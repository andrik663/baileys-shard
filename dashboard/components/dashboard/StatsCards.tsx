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
  accentColor?: string;       /* oklch(...) string */
  dimmed?: boolean;
  sub?: string;
}

function StatTile({
  label,
  value,
  icon,
  accentColor,
  dimmed = false,
  sub,
}: StatTileProps) {
  const accent = accentColor ?? "oklch(0.485 0.012 245)";
  const dimmedStyle = dimmed
    ? { color: "oklch(0.485 0.012 245)" }
    : { color: accent };

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-lg px-2.5 sm:px-3.5 py-2.5 sm:py-3 flex items-start gap-2 sm:gap-3 group hover:border-border/80 transition-colors">
      {/* Left accent bar */}
      {!dimmed && (
        <div
          className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full opacity-70"
          style={{ background: accent }}
        />
      )}

      {/* Icon */}
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: dimmed ? "oklch(1 0 0 / 4%)" : `color-mix(in oklch, ${accent} 12%, transparent)`,
        }}
      >
        <span style={dimmedStyle}>{icon}</span>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-1 sm:mb-1.5">
          {label}
        </p>
        <p
          className="text-base sm:text-xl font-bold tabular-nums font-mono leading-none"
          style={dimmedStyle}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 truncate leading-none hidden sm:block">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function StatsCards({ summary }: { summary: Summary }) {
  const offlineCount = summary.disconnected + summary.loggedOut;

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      <StatTile
        label="Total"
        value={summary.total}
        icon={<Layers size={15} />}
        dimmed={summary.total === 0}
        accentColor="oklch(0.920 0.006 245)"
        sub="all shards"
      />
      <StatTile
        label="Connected"
        value={summary.connected}
        icon={<Wifi size={15} />}
        accentColor="oklch(0.640 0.175 148)"
        dimmed={summary.connected === 0}
        sub={`${summary.connected} active`}
      />
      <StatTile
        label="Offline"
        value={offlineCount}
        icon={<WifiOff size={15} />}
        accentColor="oklch(0.630 0.220 25)"
        dimmed={offlineCount === 0}
        sub={summary.loggedOut > 0 ? `${summary.loggedOut} logged out` : "all good"}
      />
      <StatTile
        label="Starting"
        value={summary.initializing}
        icon={<Zap size={15} />}
        accentColor="oklch(0.670 0.195 58)"
        dimmed={summary.initializing === 0}
        sub="initializing"
      />
      <StatTile
        label="Stopped"
        value={summary.stopped}
        icon={<StopCircle size={15} />}
        accentColor="oklch(0.585 0.182 300)"
        dimmed={summary.stopped === 0}
        sub="manually stopped"
      />
      <StatTile
        label="Messages"
        value={summary.totalMessages.toLocaleString()}
        icon={<MessageSquare size={15} />}
        accentColor="oklch(0.555 0.155 210)"
        dimmed={summary.totalMessages === 0}
        sub="processed"
      />
      <StatTile
        label="Events"
        value={summary.totalEvents.toLocaleString()}
        icon={<Activity size={15} />}
        accentColor="oklch(0.920 0.006 245)"
        dimmed={summary.totalEvents === 0}
        sub="emitted"
      />
      <StatTile
        label="Uptime"
        value={formatUptime(summary.uptime)}
        icon={<Clock size={15} />}
        accentColor="oklch(0.920 0.006 245)"
        sub="since restart"
      />
    </div>
  );
}
