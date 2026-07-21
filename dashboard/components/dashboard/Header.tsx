"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  RefreshCw,
  FolderOpen,
  Wifi,
  WifiOff,
  Layers,
  Zap,
  StopCircle,
  AlertCircle,
} from "lucide-react";
import type { Summary } from "@/lib/types";

interface Props {
  summary: Summary;
  loading: boolean;
  onRefresh: () => void;
  onCreateShard: () => void;
  onLoadAll: () => void;
}

function formatUptime(s: number) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export default function Header({
  summary,
  loading,
  onRefresh,
  onCreateShard,
  onLoadAll,
}: Props) {
  const hasOffline = summary.disconnected + summary.loggedOut > 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-sidebar/95 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 h-12 flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Layers size={14} className="text-primary" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-foreground leading-none">Baileys<span className="text-primary">Shard</span></span>
            <span className="text-xs text-muted-foreground ml-1.5 hidden md:inline">Manager</span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 opacity-40 hidden sm:block" />

        {/* Live status strip */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Live</span>
          </div>

          <Separator orientation="vertical" className="h-4 opacity-30 flex-shrink-0" />

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Shards</span>
            <Badge variant="secondary" className="h-4 px-1.5 text-xs font-mono">
              {summary.total}
            </Badge>
          </div>

          {summary.connected > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Wifi size={11} className="text-primary" />
              <span className="text-xs text-primary font-medium tabular-nums">{summary.connected}</span>
            </div>
          )}

          {hasOffline && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <WifiOff size={11} className="text-destructive" />
              <span className="text-xs text-destructive font-medium tabular-nums">
                {summary.disconnected + summary.loggedOut}
              </span>
            </div>
          )}

          {summary.initializing > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Zap size={11} className="text-[oklch(0.66_0.195_60)]" />
              <span className="text-xs text-[oklch(0.66_0.195_60)] font-medium tabular-nums">
                {summary.initializing}
              </span>
            </div>
          )}

          {summary.stopped > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <StopCircle size={11} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground tabular-nums">{summary.stopped}</span>
            </div>
          )}

          <Separator orientation="vertical" className="h-4 opacity-30 flex-shrink-0" />

          <div className="flex items-center gap-1 flex-shrink-0">
            <AlertCircle size={11} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
              Uptime:
            </span>
            <span className="text-xs text-foreground font-mono">{formatUptime(summary.uptime)}</span>
          </div>

          {summary.totalMessages > 0 && (
            <>
              <Separator orientation="vertical" className="h-4 opacity-30 flex-shrink-0" />
              <span className="text-xs text-muted-foreground flex-shrink-0">
                <span className="font-mono text-foreground">{summary.totalMessages.toLocaleString()}</span>
                {" msgs"}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span className="sr-only">Refresh</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Refresh</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs gap-1.5 border-border/60"
                onClick={onLoadAll}
                disabled={loading}
              >
                <FolderOpen size={12} />
                <span className="hidden md:inline">Load Sessions</span>
                <span className="inline md:hidden">Load</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Load all existing sessions from disk</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            className="h-8 px-3 text-xs gap-1.5"
            onClick={onCreateShard}
            disabled={loading}
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Shard</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
