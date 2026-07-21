/**
 * Server-side singleton ShardManager + in-memory event log store.
 * This module is imported only in API route handlers (server components / route handlers).
 */

import { EventEmitter } from "events";

export interface ShardStatus {
  id: string;
  index: number;
  total: number;
  phoneNumber: string | null;
  status: "initializing" | "connecting" | "connected" | "disconnected" | "logged_out" | "stopped" | "error";
  updatedAt: string;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  shardId: string | null;
  event: string;
  state?: string;
  type?: string;
  code?: string;
  errorCode?: string;
  message?: string;
  level: "info" | "warn" | "error" | "success";
}

export interface QRData {
  shardId: string;
  image: string; // base64 PNG
  generatedAt: string;
}

export interface PairingData {
  shardId: string;
  code: string;
  generatedAt: string;
}

// ── In-process state ──────────────────────────────────────────────────────────

const MAX_LOG_ENTRIES = 200;

class DashboardState extends EventEmitter {
  public shards: Map<string, ShardStatus> = new Map();
  public logs: EventLogEntry[] = [];
  public qrCodes: Map<string, QRData> = new Map();
  public pairingCodes: Map<string, PairingData> = new Map();
  public manager: any = null;
  public initialized = false;
  public stats = {
    totalMessages: 0,
    totalEvents: 0,
    uptime: Date.now(),
  };

  addLog(entry: Omit<EventLogEntry, "id" | "timestamp">) {
    const log: EventLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(log);
    if (this.logs.length > MAX_LOG_ENTRIES) this.logs.splice(MAX_LOG_ENTRIES);
    this.stats.totalEvents++;
    this.emit("log", log);
  }

  updateShard(id: string, updates: Partial<ShardStatus>) {
    const existing = this.shards.get(id);
    const updated: ShardStatus = {
      id,
      index: existing?.index ?? this.shards.size + 1,
      total: this.shards.size,
      phoneNumber: existing?.phoneNumber ?? null,
      status: existing?.status ?? "initializing",
      updatedAt: new Date().toISOString(),
      ...updates,
    };
    this.shards.set(id, updated);
    this.emit("shards", Array.from(this.shards.values()));
  }

  removeShard(id: string) {
    this.shards.delete(id);
    this.qrCodes.delete(id);
    this.pairingCodes.delete(id);
    this.emit("shards", Array.from(this.shards.values()));
  }

  getAllShards(): ShardStatus[] {
    return Array.from(this.shards.values());
  }

  getSummary() {
    const shards = this.getAllShards();
    return {
      total: shards.length,
      connected: shards.filter((s) => s.status === "connected").length,
      disconnected: shards.filter((s) => s.status === "disconnected").length,
      initializing: shards.filter((s) => s.status === "initializing" || s.status === "connecting").length,
      loggedOut: shards.filter((s) => s.status === "logged_out").length,
      stopped: shards.filter((s) => s.status === "stopped").length,
      uptime: Math.floor((Date.now() - this.stats.uptime) / 1000),
      totalMessages: this.stats.totalMessages,
      totalEvents: this.stats.totalEvents,
    };
  }
}

// Global singleton — survives hot-reload in dev via globalThis
const globalState = globalThis as any;
if (!globalState.__dashboardState) {
  globalState.__dashboardState = new DashboardState();
}

export const dashboardState: DashboardState = globalState.__dashboardState;

// ── ShardManager bootstrap ────────────────────────────────────────────────────

async function bootstrapManager() {
  if (dashboardState.initialized) return;
  dashboardState.initialized = true;

  try {
    // Import ShardManager directly from source (avoids dependency on compiled dist/)
    const { default: ShardManager } = await import("./baileys-shard/ShardManager");
    const manager = new ShardManager({ session: "./sessions" });
    dashboardState.manager = manager;

    dashboardState.addLog({
      shardId: null,
      event: "system.init",
      message: "ShardManager initialized successfully",
      level: "success",
    });

    // ── Event bindings ──────────────────────────────────────────────────────

    manager.on("login.update", ({ shardId, state, type, code, image }: any) => {
      if (state === "stopped") {
        dashboardState.updateShard(shardId, { status: "stopped" });
        dashboardState.qrCodes.delete(shardId);
        dashboardState.pairingCodes.delete(shardId);
        return;
      }

      dashboardState.updateShard(shardId, {
        status:
          state === "connected"
            ? "connected"
            : state === "disconnected"
            ? "disconnected"
            : state === "logged_out"
            ? "logged_out"
            : "connecting",
      });

      if (type === "qr" && image) {
        const b64 = Buffer.isBuffer(image)
          ? image.toString("base64")
          : Buffer.from(image).toString("base64");
        dashboardState.qrCodes.set(shardId, {
          shardId,
          image: b64,
          generatedAt: new Date().toISOString(),
        });
        dashboardState.addLog({
          shardId,
          event: "login.update",
          state: "connecting",
          type: "qr",
          message: `QR code generated for ${shardId}`,
          level: "info",
        });
      }

      if (type === "pairing" && code) {
        dashboardState.pairingCodes.set(shardId, {
          shardId,
          code,
          generatedAt: new Date().toISOString(),
        });
        dashboardState.addLog({
          shardId,
          event: "login.update",
          state: "connecting",
          type: "pairing",
          code,
          message: `Pairing code for ${shardId}: ${code}`,
          level: "info",
        });
      }

      if (state === "connected") {
        dashboardState.qrCodes.delete(shardId);
        dashboardState.pairingCodes.delete(shardId);
        dashboardState.addLog({
          shardId,
          event: "login.update",
          state: "connected",
          message: `${shardId} connected successfully`,
          level: "success",
        });
      }

      if (state === "disconnected") {
        dashboardState.addLog({
          shardId,
          event: "login.update",
          state: "disconnected",
          message: `${shardId} disconnected, will reconnect...`,
          level: "warn",
        });
      }

      if (state === "logged_out") {
        dashboardState.addLog({
          shardId,
          event: "login.update",
          state: "logged_out",
          message: `${shardId} logged out`,
          level: "warn",
        });
      }
    });

    manager.on("messages.upsert", ({ shardId, data }: any) => {
      const count = data?.messages?.length ?? 1;
      dashboardState.stats.totalMessages += count;
      dashboardState.addLog({
        shardId,
        event: "messages.upsert",
        message: `${count} new message(s) on ${shardId}`,
        level: "info",
      });
    });

    manager.on("messages.update", ({ shardId }: any) => {
      dashboardState.addLog({
        shardId,
        event: "messages.update",
        message: `Message update on ${shardId}`,
        level: "info",
      });
    });

    manager.on("messages.delete", ({ shardId }: any) => {
      dashboardState.addLog({
        shardId,
        event: "messages.delete",
        message: `Message deleted on ${shardId}`,
        level: "warn",
      });
    });

    manager.on("groups.upsert", ({ shardId }: any) => {
      dashboardState.addLog({
        shardId,
        event: "groups.upsert",
        message: `Group created/joined on ${shardId}`,
        level: "info",
      });
    });

    manager.on("contacts.upsert", ({ shardId, data }: any) => {
      dashboardState.addLog({
        shardId,
        event: "contacts.upsert",
        message: `${Array.isArray(data) ? data.length : 1} contact(s) updated on ${shardId}`,
        level: "info",
      });
    });

    manager.on("shard.error", ({ shardId, error }: any) => {
      dashboardState.updateShard(shardId ?? "unknown", { status: "error" as any });
      dashboardState.addLog({
        shardId: shardId ?? null,
        event: "shard.error",
        errorCode: error?.code,
        message: error?.message ?? "Unknown error",
        level: "error",
      });
    });

    manager.on("creds.update", ({ shardId }: any) => {
      dashboardState.addLog({
        shardId,
        event: "creds.update",
        message: `Credentials updated for ${shardId}`,
        level: "info",
      });
    });

    // Auto-load existing sessions
    try {
      const ids = await manager.loadAllShards();
      for (const id of ids) {
        dashboardState.updateShard(id, { status: "initializing" });
      }
      if (ids.length > 0) {
        dashboardState.addLog({
          shardId: null,
          event: "system.load",
          message: `Loaded ${ids.length} existing session(s): ${ids.join(", ")}`,
          level: "info",
        });
      }
    } catch {
      // no sessions yet — fine
    }
  } catch (err: any) {
    dashboardState.addLog({
      shardId: null,
      event: "system.error",
      message: `Failed to initialize ShardManager: ${err?.message}`,
      level: "error",
    });
  }
}

// Bootstrap on first import
bootstrapManager().catch(console.error);

export async function getManager() {
  if (!dashboardState.manager) {
    await bootstrapManager();
  }
  return dashboardState.manager;
}
