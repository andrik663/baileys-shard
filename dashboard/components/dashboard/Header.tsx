"use client";

import { Button } from "@/components/ui/button";
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
  Zap,
  StopCircle,
  Clock,
  Layers,
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
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function StatPill({
  icon,
  value,
  label,
  color = "text-muted-foreground",
}: {
  icon: React.ReactNode;
  value: number | string;
  label?: string;
  color?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 flex-shrink-0 ${color}`}>
      {icon}
      <span className="font-mono text-xs font-semibold tabular-nums">{value}</span>
      {label && (
        <span className="text-[11px] text-muted-foreground hidden sm:inline">{label}</span>
      )}
    </div>
  );
}

export default function Header({
  summary,
  loading,
  onRefresh,
  onCreateShard,
  onLoadAll,
}: Props) {
  const offlineCount = summary.disconnected + summary.loggedOut;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[oklch(0.080_0.006_250/97%)] backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 h-11 flex items-center gap-2 sm:gap-3">

        {/* Brand mark */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-md bg-primary/20 border border-primary/35" />
            <Layers size={12} className="text-primary relative" />
          </div>
          <div className="hidden sm:flex items-baseline gap-1">
            <span className="text-[13px] font-bold tracking-tight text-foreground">
              baileys<span className="text-primary">-shard</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono hidden lg:inline opacity-60">
              v0.0.7
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-4 opacity-25 hidden sm:block flex-shrink-0" />

        {/* Live indicator */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">LIVE</span>
        </div>

        <Separator orientation="vertical" className="h-4 opacity-20 flex-shrink-0 hidden sm:block" />

        {/* Stats strip — horizontally scrollable on mobile */}
        <div className="flex items-center gap-2.5 flex-1 overflow-x-auto no-scrollbar min-w-0">
          <StatPill
            icon={<Layers size={11} />}
            value={summary.total}
            color="text-foreground"
          />

          {summary.connected > 0 && (
            <>
              <Separator orientation="vertical" className="h-3 opacity-20 flex-shrink-0" />
              <StatPill
                icon={<Wifi size={11} />}
                value={summary.connected}
                label="online"
                color="text-primary"
              />
            </>
          )}

          {offlineCount > 0 && (
            <>
              <Separator orientation="vertical" className="h-3 opacity-20 flex-shrink-0" />
              <StatPill
                icon={<WifiOff size={11} />}
                value={offlineCount}
                color="text-destructive"
              />
            </>
          )}

          {summary.initializing > 0 && (
            <>
              <Separator orientation="vertical" className="h-3 opacity-20 flex-shrink-0" />
              <StatPill
                icon={<Zap size={11} />}
                value={summary.initializing}
                color="text-[oklch(0.670_0.195_58)]"
              />
            </>
          )}

          <Separator orientation="vertical" className="h-3 opacity-20 flex-shrink-0" />
          <StatPill
            icon={<Clock size={11} />}
            value={formatUptime(summary.uptime)}
            color="text-muted-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  <span className="sr-only">Refresh</span>
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">Refresh</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 sm:w-auto sm:px-2.5 p-0 text-[11px] gap-1.5 border-border/50 bg-surface hover:bg-surface-2 font-mono"
                  onClick={onLoadAll}
                  disabled={loading}
                >
                  <FolderOpen size={11} />
                  <span className="hidden sm:inline">Load</span>
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Load all existing sessions from disk
            </TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            className="h-7 w-7 sm:w-auto sm:px-3 p-0 text-[11px] gap-1.5 bg-primary hover:bg-primary/90 font-semibold"
            onClick={onCreateShard}
            disabled={loading}
          >
            <Plus size={12} />
            <span className="hidden sm:inline">New Shard</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
