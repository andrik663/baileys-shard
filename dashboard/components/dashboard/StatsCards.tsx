"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Summary } from "@/lib/types";
import {
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  MessageSquare,
  Clock,
  Layers,
  Activity,
} from "lucide-react";

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  sub?: string;
}

function StatCard({ label, value, icon, accent = "text-muted-foreground", sub }: StatCardProps) {
  return (
    <Card className="bg-card border-border/60">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg bg-muted/50 ${accent}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Total Shards"
        value={summary.total}
        icon={<Layers size={18} />}
        accent="text-foreground"
        sub={`${summary.initializing} initializing`}
      />
      <StatCard
        label="Connected"
        value={summary.connected}
        icon={<Wifi size={18} />}
        accent="text-[oklch(0.62_0.17_148)]"
        sub={summary.connected > 0 ? "Active sessions" : "No active sessions"}
      />
      <StatCard
        label="Disconnected"
        value={summary.disconnected + summary.loggedOut}
        icon={<WifiOff size={18} />}
        accent={summary.disconnected + summary.loggedOut > 0 ? "text-destructive" : "text-muted-foreground"}
        sub={summary.loggedOut > 0 ? `${summary.loggedOut} logged out` : "All good"}
      />
      <StatCard
        label="Messages"
        value={summary.totalMessages.toLocaleString()}
        icon={<MessageSquare size={18} />}
        accent="text-[oklch(0.55_0.15_200)]"
        sub="Total processed"
      />
      <StatCard
        label="Events"
        value={summary.totalEvents.toLocaleString()}
        icon={<Activity size={18} />}
        accent="text-foreground"
        sub="All emitted events"
      />
      <StatCard
        label="Uptime"
        value={formatUptime(summary.uptime)}
        icon={<Clock size={18} />}
        accent="text-foreground"
        sub="Since last restart"
      />
      <StatCard
        label="Stopped"
        value={summary.stopped}
        icon={<AlertCircle size={18} />}
        accent={summary.stopped > 0 ? "text-[oklch(0.65_0.20_60)]" : "text-muted-foreground"}
        sub="Manually stopped"
      />
      <StatCard
        label="Initializing"
        value={summary.initializing}
        icon={<Loader2 size={18} className={summary.initializing > 0 ? "animate-spin" : ""} />}
        accent={summary.initializing > 0 ? "text-[oklch(0.65_0.20_60)]" : "text-muted-foreground"}
        sub="Starting up"
      />
    </div>
  );
}
