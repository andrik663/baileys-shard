"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Trash2, Search, ArrowDown, ArrowUp } from "lucide-react";
import type { EventLogEntry } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const LEVEL_CONFIG = {
  success: {
    badge: "text-primary border-primary/30 bg-primary/10",
    dot: "bg-primary",
    bar: "bg-primary/40",
  },
  info: {
    badge: "text-[oklch(0.56_0.155_205)] border-[oklch(0.56_0.155_205)]/30 bg-[oklch(0.56_0.155_205)]/10",
    dot: "bg-[oklch(0.56_0.155_205)]",
    bar: "bg-[oklch(0.56_0.155_205)]/40",
  },
  warn: {
    badge: "text-[oklch(0.66_0.195_60)] border-[oklch(0.66_0.195_60)]/30 bg-[oklch(0.66_0.195_60)]/10",
    dot: "bg-[oklch(0.66_0.195_60)]",
    bar: "bg-[oklch(0.66_0.195_60)]/40",
  },
  error: {
    badge: "text-destructive border-destructive/30 bg-destructive/10",
    dot: "bg-destructive",
    bar: "bg-destructive/40",
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // logs are stored newest-first; display oldest-first
  const displayed = [...logs].reverse();

  const shardIds = Array.from(
    new Set(logs.map((l) => l.shardId).filter(Boolean))
  ) as string[];

  const filtered = displayed.filter((l) => {
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
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filtered.length, autoScroll]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const errorCount = logs.filter((l) => l.level === "error").length;
  const warnCount = logs.filter((l) => l.level === "warn").length;

  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader className="px-4 pt-4 pb-3 space-y-0">
        {/* Title row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity size={15} className="text-primary" />
            Event Log
            <Badge variant="secondary" className="text-[11px] font-mono h-4 px-1.5">
              {filtered.length}
            </Badge>
            {errorCount > 0 && (
              <Badge className="text-[11px] px-1.5 h-4 bg-destructive/15 text-destructive border border-destructive/30">
                {errorCount} error{errorCount > 1 ? "s" : ""}
              </Badge>
            )}
            {warnCount > 0 && (
              <Badge className="text-[11px] px-1.5 h-4 bg-[oklch(0.66_0.195_60)]/15 text-[oklch(0.66_0.195_60)] border border-[oklch(0.66_0.195_60)]/30">
                {warnCount} warn{warnCount > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <Button
                size="sm"
                variant={autoScroll ? "default" : "outline"}
                className="h-7 px-2 text-[11px] gap-1"
                onClick={() => setAutoScroll(!autoScroll)}
                title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
              >
                <ArrowDown size={11} />
                Auto
              </Button>
            </Tooltip>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1"
              onClick={onClear}
            >
              <Trash2 size={11} />
              Clear
            </Button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-36">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event, message, shard..."
              className="h-7 pl-7 text-xs bg-muted/30 border-border/60"
            />
          </div>
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v ?? "all")}>
            <SelectTrigger className="h-7 w-28 text-xs bg-muted/30 border-border/60">
              <SelectValue placeholder="Level" />
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
            <Select value={shardFilter} onValueChange={(v) => setShardFilter(v ?? "all")}>
              <SelectTrigger className="h-7 w-32 text-xs bg-muted/30 border-border/60">
                <SelectValue placeholder="Shard" />
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
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 relative">
        <div
          ref={scrollContainerRef}
          className="h-80 overflow-y-auto divide-y divide-border/30"
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-10">
              <Activity size={22} className="opacity-25" />
              <p className="text-xs">No log entries match your filters</p>
            </div>
          ) : (
            filtered.map((log) => {
              const cfg = LEVEL_CONFIG[log.level];
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-4 py-2 hover:bg-muted/15 transition-colors slide-up"
                >
                  {/* Level bar */}
                  <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${cfg.bar}`} />

                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-foreground">
                        {log.event}
                      </span>
                      {log.shardId && (
                        <Badge
                          variant="outline"
                          className="text-[11px] px-1.5 py-0 h-4 font-mono border-border/60"
                        >
                          {log.shardId}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-1.5 py-0 h-4 ${cfg.badge}`}
                      >
                        {log.level}
                      </Badge>
                      {log.errorCode && (
                        <Badge
                          variant="outline"
                          className="text-[11px] px-1.5 py-0 h-4 text-destructive border-destructive/30"
                        >
                          {log.errorCode}
                        </Badge>
                      )}
                    </div>
                    {log.message && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {log.message}
                      </p>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground flex-shrink-0 tabular-nums pt-0.5">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll controls */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 text-muted-foreground bg-card/80 backdrop-blur-sm"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <ArrowUp size={10} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 text-muted-foreground bg-card/80 backdrop-blur-sm"
            onClick={scrollToBottom}
            title="Scroll to bottom"
          >
            <ArrowDown size={10} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal tooltip wrapper to avoid import overhead
function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
