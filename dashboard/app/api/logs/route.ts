import { NextResponse } from "next/server";
import { dashboardState } from "@/lib/shard-manager";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shardId = searchParams.get("shardId");
  const level = searchParams.get("level");
  const limit = parseInt(searchParams.get("limit") ?? "100", 10);

  let logs = dashboardState.logs;

  if (shardId) logs = logs.filter((l) => l.shardId === shardId);
  if (level) logs = logs.filter((l) => l.level === level);

  return NextResponse.json({ logs: logs.slice(0, limit) });
}

export async function DELETE() {
  dashboardState.logs = [];
  return NextResponse.json({ success: true });
}
