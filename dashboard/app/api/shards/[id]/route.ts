import { NextResponse } from "next/server";
import { dashboardState, getManager } from "@/lib/shard-manager";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const info = dashboardState.shards.get(id);
  const sessionInfo = dashboardState.manager
    ? await dashboardState.manager.getSessionInfo(id).catch(() => null)
    : null;

  if (!info && !sessionInfo) {
    return NextResponse.json({ error: "Shard not found" }, { status: 404 });
  }

  return NextResponse.json({
    shard: info ?? null,
    session: sessionInfo,
    qr: dashboardState.qrCodes.get(id) ?? null,
    pairing: dashboardState.pairingCodes.get(id) ?? null,
  });
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

    await manager.stopShard(id);
    dashboardState.updateShard(id, { status: "stopped" });
    // Clear any pending QR / pairing data so the card stops showing them.
    dashboardState.qrCodes.delete(id);
    dashboardState.pairingCodes.delete(id);
    dashboardState.addLog({
      shardId: id,
      event: "shard.stop",
      message: `Shard "${id}" stopped`,
      level: "warn",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const { action, clearSession, forceRecreate, phoneNumber } = body as {
      action: string;
      clearSession?: boolean;
      forceRecreate?: boolean;
      phoneNumber?: string;
    };

    const manager = await getManager();
    if (!manager) {
      return NextResponse.json({ error: "ShardManager not ready" }, { status: 503 });
    }

    if (action === "reconnect") {
      dashboardState.addLog({
        shardId: id,
        event: "shard.reconnect",
        message: `Reconnecting shard "${id}"${clearSession ? " (session cleared)" : ""}`,
        level: "info",
      });
      dashboardState.updateShard(id, { status: "initializing" });

      // Clear the stopped flag so the shard can reconnect.
      if (typeof manager.clearStoppedFlag === "function") {
        manager.clearStoppedFlag(id);
      }

      await manager.recreateShard({
        id,
        clearSession: clearSession ?? false,
        forceRecreate: true,
        ...(phoneNumber ? { phoneNumber } : {}),
      });

      return NextResponse.json({ success: true });
    }

    if (action === "connect") {
      dashboardState.updateShard(id, { status: "initializing" });
      await manager.connect(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
