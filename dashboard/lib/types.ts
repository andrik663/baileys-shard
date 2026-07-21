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

export interface Summary {
  total: number;
  connected: number;
  disconnected: number;
  initializing: number;
  loggedOut: number;
  stopped: number;
  uptime: number;
  totalMessages: number;
  totalEvents: number;
}

export interface ShardsResponse {
  shards: ShardStatus[];
  summary: Summary;
  qrCodes: Record<string, string>;
  pairingCodes: Record<string, string>;
}
