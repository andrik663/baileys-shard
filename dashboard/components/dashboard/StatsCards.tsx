"use client";

import type { Summary } from "@/lib/types";
import {
  Wifi,
  WifiOff,
  Layers,
  MessageSquare,
  Clock,
  Activity,
  Zap,
  StopCircle,
} from "lucide-react";

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

interface StatTileProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  iconBg?: string;
  sub?: string;
}

function StatTile({ label, value, icon, accent = "text-foreground", iconBg = "bg-muted/60", sub }: StatTileProps) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className={`text-xl font-bold tabular-nums leading-none ${accent}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatsCards({ summary }: { summary: Summary }) {
  const offlineCount = summary.disconnected + summary.loggedOut;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      <StatTile
        label="Total"
        value={summary.total}
        icon={<Layers size={16} />}
        accent="text-foreground"
        iconBg="bg-muted/60"
        sub="all shards"
      />
      <StatTile
        label="Connected"
        value={summary.connected}
        icon={<Wifi size={16} />}
        accent="text-primary"
        iconBg="bg-primary/12"
        sub={summary.connected === 1 ? "1 active" : `${summary.connected} active`}
      />
      <StatTile
        label="Offline"
        value={offlineCount}
        icon={<WifiOff size={16} />}
        accent={offlineCount > 0 ? "text-destructive" : "text-muted-foreground"}
        iconBg={offlineCount > 0 ? "bg-destructive/12" : "bg-muted/60"}
        sub={summary.loggedOut > 0 ? `${summary.loggedOut} logged out` : "all good"}
      />
      <StatTile
        label="Starting"
        value={summary.initializing}
        icon={<Zap size={16} />}
        accent={summary.initializing > 0 ? "text-[oklch(0.66_0.195_60)]" : "text-muted-foreground"}
        iconBg={summary.initializing > 0 ? "bg-[oklch(0.66_0.195_60)]/12" : "bg-muted/60"}
        sub="initializing"
      />
      <StatTile
        label="Stopped"
        value={summary.stopped}
        icon={<StopCircle size={16} />}
        accent={summary.stopped > 0 ? "text-[oklch(0.59_0.18_300)]" : "text-muted-foreground"}
        iconBg={summary.stopped > 0 ? "bg-[oklch(0.59_0.18_300)]/12" : "bg-muted/60"}
        sub="manually stopped"
      />
      <StatTile
        label="Messages"
        value={summary.totalMessages.toLocaleString()}
        icon={<MessageSquare size={16} />}
        accent="text-[oklch(0.56_0.155_205)]"
        iconBg="bg-[oklch(0.56_0.155_205)]/12"
        sub="processed"
      />
      <StatTile
        label="Events"
        value={summary.totalEvents.toLocaleString()}
        icon={<Activity size={16} />}
        accent="text-foreground"
        iconBg="bg-muted/60"
        sub="emitted"
      />
      <StatTile
        label="Uptime"
        value={formatUptime(summary.uptime)}
        icon={<Clock size={16} />}
        accent="text-foreground"
        iconBg="bg-muted/60"
        sub="since restart"
      />
    </div>
  );
}
