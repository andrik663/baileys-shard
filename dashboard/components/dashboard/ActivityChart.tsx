"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { BarChart2, TrendingUp, PieChart as PieIcon } from "lucide-react";
import type { EventLogEntry } from "@/lib/types";

interface Props {
  logs: EventLogEntry[];
}

const LEVEL_COLORS: Record<string, string> = {
  success: "oklch(0.625 0.172 148)",
  info:    "oklch(0.560 0.155 205)",
  warn:    "oklch(0.660 0.195 60)",
  error:   "oklch(0.640 0.215 25)",
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono" style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function ActivityChart({ logs }: Props) {
  // Top 10 events by count
  const eventData = useMemo(() => {
    const counts: Record<string, { count: number; level: string }> = {};
    for (const log of logs) {
      if (!counts[log.event]) counts[log.event] = { count: 0, level: log.level };
      counts[log.event].count++;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([event, { count, level }]) => ({
        event: event.split(".").pop() ?? event,
        fullEvent: event,
        count,
        fill: LEVEL_COLORS[level] ?? LEVEL_COLORS.info,
      }));
  }, [logs]);

  // Activity per minute over last 15 minutes
  const timeData = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 15 }, (_, i) => {
      const minutesAgo = 14 - i;
      const from = now - (minutesAgo + 1) * 60000;
      const to = now - minutesAgo * 60000;
      const slice = logs.filter((l) => {
        const t = new Date(l.timestamp).getTime();
        return t >= from && t < to;
      });
      return {
        time: `-${minutesAgo + 1}m`,
        total: slice.length,
        errors: slice.filter((l) => l.level === "error").length,
        success: slice.filter((l) => l.level === "success").length,
      };
    });
  }, [logs]);

  // Level breakdown for pie
  const levelData = useMemo(() => {
    const counts = { success: 0, info: 0, warn: 0, error: 0 };
    for (const log of logs) {
      if (log.level in counts) counts[log.level as keyof typeof counts]++;
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([level, value]) => ({
        name: level,
        value,
        fill: LEVEL_COLORS[level],
      }));
  }, [logs]);

  const totalLogs = logs.length;

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(LEVEL_COLORS).map(([level, color]) => {
          const count = logs.filter((l) => l.level === level).length;
          return (
            <div
              key={level}
              className="bg-card border border-border rounded-lg px-3 py-2.5 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{level}</p>
                <p className="text-lg font-bold tabular-nums" style={{ color }}>
                  {count}
                </p>
              </div>
              <div
                className="w-2 h-10 rounded-full opacity-40"
                style={{ background: color }}
              />
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Events by type bar */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <BarChart2 size={14} className="text-primary" />
                  Events by Type
                </span>
                <Badge variant="secondary" className="text-[11px] h-4 px-1.5 font-mono">
                  {totalLogs} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {eventData.length === 0 ? (
                <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
                  No events captured yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={eventData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <XAxis
                      dataKey="event"
                      tick={{ fontSize: 9, fill: "oklch(0.50 0.010 245)" }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={36}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "oklch(0.50 0.010 245)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartTooltip
                      content={(props) => (
                        <ChartTooltip
                          {...props}
                          label={
                            props.payload?.[0]
                              ? (props.payload[0].payload as { fullEvent: string }).fullEvent
                              : props.label
                          }
                        />
                      )}
                      cursor={{ fill: "oklch(1 0 0 / 4%)" }}
                    />
                    <Bar dataKey="count" name="count" radius={[3, 3, 0, 0]}>
                      {eventData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Level pie */}
        <Card className="bg-card border-border">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <PieIcon size={14} className="text-primary" />
              Level Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {levelData.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {levelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px" }}
                  />
                  <RechartTooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity timeline */}
      <Card className="bg-card border-border">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            Activity Timeline — last 15 minutes
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timeData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "oklch(0.50 0.010 245)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "oklch(0.50 0.010 245)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <RechartTooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "oklch(1 0 0 / 10%)" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="total"
                stroke="oklch(0.56 0.155 205)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "oklch(0.56 0.155 205)" }}
              />
              <Line
                type="monotone"
                dataKey="errors"
                name="errors"
                stroke="oklch(0.640 0.215 25)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                activeDot={{ r: 3, fill: "oklch(0.640 0.215 25)" }}
              />
              <Line
                type="monotone"
                dataKey="success"
                name="success"
                stroke="oklch(0.625 0.172 148)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: "oklch(0.625 0.172 148)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
