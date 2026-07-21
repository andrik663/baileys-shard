import { NextResponse } from "next/server";
import { getManager, dashboardState } from "@/lib/shard-manager";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const manager = await getManager();
    if (!manager) {
      return NextResponse.json({ error: "ShardManager not ready" }, { status: 503 });
    }
    const info = await manager.getSessionInfo(id);
    return NextResponse.json({ id, session: info });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const manager = await getManager();
    if (!manager) {
      return NextResponse.json({ error: "ShardManager not ready" }, { status: 503 });
    }

    await manager.validateAndCleanSession(`./sessions/${id}`);
    dashboardState.removeShard(id);
    dashboardState.addLog({
      shardId: id,
      event: "session.clean",
      message: `Session for "${id}" validated and cleaned`,
      level: "warn",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
