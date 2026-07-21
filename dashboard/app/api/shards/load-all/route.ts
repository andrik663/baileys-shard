import { NextResponse } from "next/server";
import { dashboardState, getManager } from "@/lib/shard-manager";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const manager = await getManager();
    if (!manager) {
      return NextResponse.json({ error: "ShardManager not ready" }, { status: 503 });
    }

    dashboardState.addLog({
      shardId: null,
      event: "system.load_all",
      message: "Loading all sessions from disk...",
      level: "info",
    });

    const ids = await manager.loadAllShards();

    for (const id of ids) {
      dashboardState.updateShard(id, { status: "initializing" });
    }

    dashboardState.addLog({
      shardId: null,
      event: "system.load_all",
      message: `Loaded ${ids.length} session(s)`,
      level: ids.length > 0 ? "success" : "warn",
    });

    return NextResponse.json({ success: true, ids });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
