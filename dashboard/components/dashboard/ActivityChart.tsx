"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart2 } from "lucide-react";
import type { EventLogEntry } from "@/lib/types";

interface Props {
  logs: EventLogEntry[];
}

const COLORS: Record<string, string> = {
  success: "oklch(0.62 0.17 148)",
  info: "oklch(0.55 0.15 200)",
  warn: "oklch(0.65 0.20 60)",
  error: "oklch(0.65 0.22 25)",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function ActivityChart({ logs }: Props) {
  // Group logs by event type (top 8)
  const eventData = useMemo(() => {
    const counts: Record<string, { count: number; level: string }> = {};
    for (const log of logs) {
      if (!counts[log.event]) counts[log.event] = { count: 0, level: log.level };
      counts[log.event].count++;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([event, { count, level }]) => ({
        event: event.replace(".", ".​"), // zero-width space for wrapping
        count,
        level,
        fill: COLORS[level] ?? COLORS.info,
      }));
  }, [logs]);

  // Last 10 minutes bucket
  const timeData = useMemo(() => {
    const now = Date.now();
    const buckets: { time: string; count: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const from = now - (i + 1) * 60000;
      const to = now - i * 60000;
      const label = `-${i + 1}m`;
      const count = logs.filter((l) => {
        const t = new Date(l.timestamp).getTime();
        return t >= from && t < to;
      }).length;
      buckets.push({ time: label, count });
    }
    return buckets;
  }, [logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Events by type */}
      <Card className="bg-card border-border/60">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            Events by Type
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {eventData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
              No events yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={eventData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="event"
                  tick={{ fontSize: 9, fill: "oklch(0.55 0.008 240)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={40}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "oklch(0.55 0.008 240)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {eventData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Activity over time */}
      <Card className="bg-card border-border/60">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            Activity (last 10 min)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={timeData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "oklch(0.55 0.008 240)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.55 0.008 240)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(1 0 0 / 4%)" }} />
              <Bar
                dataKey="count"
                fill="oklch(0.62 0.17 148)"
                fillOpacity={0.75}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
