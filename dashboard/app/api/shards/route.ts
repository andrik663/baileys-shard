import { NextResponse } from "next/server";
import { dashboardState, getManager } from "@/lib/shard-manager";

export const dynamic = "force-dynamic";

export async function GET() {
  const shards = dashboardState.getAllShards();
  const summary = dashboardState.getSummary();
  const qrCodes: Record<string, string> = {};
  const pairingCodes: Record<string, string> = {};

  dashboardState.qrCodes.forEach((v, k) => {
    qrCodes[k] = v.image;
  });
  dashboardState.pairingCodes.forEach((v, k) => {
    pairingCodes[k] = v.code;
  });

  return NextResponse.json({ shards, summary, qrCodes, pairingCodes });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, phoneNumber } = body as { id?: string; phoneNumber?: string };

    const manager = await getManager();
    if (!manager) {
      return NextResponse.json({ error: "ShardManager not ready" }, { status: 503 });
    }

    const options: any = {};
    if (id) options.id = id;
    if (phoneNumber) options.phoneNumber = phoneNumber;

    dashboardState.addLog({
      shardId: id ?? null,
      event: "shard.create",
      message: `Creating shard${id ? ` "${id}"` : ""}${phoneNumber ? ` with phone ${phoneNumber}` : ""}`,
      level: "info",
    });

    const { id: shardId } = await manager.createShard(options);
    dashboardState.updateShard(shardId, {
      status: "initializing",
      phoneNumber: phoneNumber ?? null,
    });

    return NextResponse.json({ success: true, id: shardId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
