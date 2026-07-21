"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import type { Summary } from "@/lib/types";

interface Props {
  summary: Summary;
  loading: boolean;
  onRefresh: () => void;
  onCreateShard: () => void;
  onLoadAll: () => void;
}

export default function Header({ summary, loading, onRefresh, onCreateShard, onLoadAll }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Layers size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">Baileys Shard</h1>
            <p className="text-xs text-muted-foreground leading-tight hidden sm:block">
              Multi-Session Dashboard
            </p>
          </div>
        </div>

        {/* Status summary pills */}
        <div className="hidden md:flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 text-xs border-[oklch(0.62_0.17_148)]/30 text-[oklch(0.62_0.17_148)] bg-[oklch(0.62_0.17_148)]/10"
          >
            <Wifi size={11} />
            {summary.connected} connected
          </Badge>
          {summary.disconnected + summary.loggedOut > 0 && (
            <Badge
              variant="outline"
              className="gap-1.5 text-xs border-destructive/30 text-destructive bg-destructive/10"
            >
              <WifiOff size={11} />
              {summary.disconnected + summary.loggedOut} offline
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <Layers size={11} />
            {summary.total} total
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs gap-1.5"
                onClick={onLoadAll}
                disabled={loading}
              >
                <FolderOpen size={13} />
                <span className="hidden sm:inline">Load Sessions</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load all existing sessions from disk</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span className="sr-only">Refresh</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh dashboard data</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            className="h-8 px-3 text-xs gap-1.5"
            onClick={onCreateShard}
            disabled={loading}
          >
            <Plus size={13} />
            <span>New Shard</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
