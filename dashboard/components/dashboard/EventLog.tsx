"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Trash2, Search, ArrowDown } from "lucide-react";
import type { EventLogEntry } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const LEVEL_CONFIG = {
  success: {
    badge: "bg-[oklch(0.62_0.17_148)]/15 text-[oklch(0.62_0.17_148)] border-[oklch(0.62_0.17_148)]/30",
    dot: "bg-[oklch(0.62_0.17_148)]",
    row: "border-l-[oklch(0.62_0.17_148)]/40",
  },
  info: {
    badge: "bg-[oklch(0.55_0.15_200)]/15 text-[oklch(0.55_0.15_200)] border-[oklch(0.55_0.15_200)]/30",
    dot: "bg-[oklch(0.55_0.15_200)]",
    row: "border-l-[oklch(0.55_0.15_200)]/40",
  },
  warn: {
    badge: "bg-[oklch(0.65_0.20_60)]/15 text-[oklch(0.65_0.20_60)] border-[oklch(0.65_0.20_60)]/30",
    dot: "bg-[oklch(0.65_0.20_60)]",
    row: "border-l-[oklch(0.65_0.20_60)]/40",
  },
  error: {
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
    row: "border-l-destructive/40",
  },
} as const;

interface Props {
  logs: EventLogEntry[];
  onClear: () => void;
}

export default function EventLog({ logs, onClear }: Props) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [shardFilter, setShardFilter] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLogsLength = useRef(logs.length);

  const shardIds = Array.from(new Set(logs.map((l) => l.shardId).filter(Boolean))) as string[];

  const filtered = logs.filter((l) => {
    const matchLevel = levelFilter === "all" || l.level === levelFilter;
    const matchShard = shardFilter === "all" || l.shardId === shardFilter;
    const matchSearch =
      !search ||
      l.message?.toLowerCase().includes(search.toLowerCase()) ||
      l.event?.toLowerCase().includes(search.toLowerCase()) ||
      l.shardId?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchShard && matchSearch;
  });

  useEffect(() => {
    if (autoScroll && logs.length !== prevLogsLength.current) {
      prevLogsLength.current = logs.length;
    }
  }, [logs.length, autoScroll]);

  return (
    <Card className="bg-card border-border/60 flex flex-col">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            Event Log
            <Badge variant="secondary" className="text-xs font-mono">
              {filtered.length}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
            onClick={onClear}
          >
            <Trash2 size={12} />
            Clear
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="h-7 pl-7 text-xs bg-muted/30 border-border/60"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-7 w-24 text-xs bg-muted/30 border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Levels</SelectItem>
              <SelectItem value="success" className="text-xs">Success</SelectItem>
              <SelectItem value="info" className="text-xs">Info</SelectItem>
              <SelectItem value="warn" className="text-xs">Warn</SelectItem>
              <SelectItem value="error" className="text-xs">Error</SelectItem>
            </SelectContent>
          </Select>
          {shardIds.length > 0 && (
            <Select value={shardFilter} onValueChange={setShardFilter}>
              <SelectTrigger className="h-7 w-32 text-xs bg-muted/30 border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Shards</SelectItem>
                {shardIds.map((id) => (
                  <SelectItem key={id} value={id} className="text-xs font-mono">
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            size="sm"
            variant={autoScroll ? "default" : "outline"}
            className="h-7 px-2 text-xs gap-1"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            <ArrowDown size={12} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-72" ref={scrollRef}>
          <div className="divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Activity size={24} className="opacity-30" />
                <p className="text-xs">No log entries</p>
              </div>
            ) : (
              filtered.map((log) => {
                const cfg = LEVEL_CONFIG[log.level];
                return (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 px-4 py-2.5 hover:bg-muted/20 border-l-2 ${cfg.row} slide-in-up`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium text-foreground">
                          {log.event}
                        </span>
                        {log.shardId && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0 font-mono border-border/60"
                          >
                            {log.shardId}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0 ${cfg.badge}`}
                        >
                          {log.level}
                        </Badge>
                        {log.errorCode && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0 text-destructive border-destructive/30"
                          >
                            {log.errorCode}
                          </Badge>
                        )}
                      </div>
                      {log.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {log.message}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
