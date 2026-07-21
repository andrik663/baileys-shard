"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wifi,
  WifiOff,
  Loader2,
  LogOut,
  RefreshCw,
  StopCircle,
  Trash2,
  Phone,
  Clock,
  QrCode,
  KeyRound,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  MessageSquare,
  ShieldOff,
  Zap,
} from "lucide-react";
import type { ShardStatus } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface Props {
  shard: ShardStatus;
  qrImage?: string;
  pairingCode?: string;
  onStop: (id: string) => void;
  onReconnect: (id: string, clearSession?: boolean) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG = {
  connected: {
    label: "Connected",
    color: "text-primary border-primary/30 bg-primary/10",
    dot: "bg-primary",
    icon: Wifi,
    pulse: true,
    glow: "shadow-[0_0_0_1px_oklch(0.625_0.172_148/20%)]",
  },
  disconnected: {
    label: "Disconnected",
    color: "text-destructive border-destructive/30 bg-destructive/10",
    dot: "bg-destructive",
    icon: WifiOff,
    pulse: false,
    glow: "",
  },
  initializing: {
    label: "Initializing",
    color: "text-[oklch(0.66_0.195_60)] border-[oklch(0.66_0.195_60)]/30 bg-[oklch(0.66_0.195_60)]/10",
    dot: "bg-[oklch(0.66_0.195_60)]",
    icon: Zap,
    pulse: true,
    glow: "",
  },
  connecting: {
    label: "Connecting",
    color: "text-[oklch(0.66_0.195_60)] border-[oklch(0.66_0.195_60)]/30 bg-[oklch(0.66_0.195_60)]/10",
    dot: "bg-[oklch(0.66_0.195_60)]",
    icon: Loader2,
    pulse: true,
    glow: "",
  },
  logged_out: {
    label: "Logged Out",
    color: "text-[oklch(0.59_0.18_300)] border-[oklch(0.59_0.18_300)]/30 bg-[oklch(0.59_0.18_300)]/10",
    dot: "bg-[oklch(0.59_0.18_300)]",
    icon: LogOut,
    pulse: false,
    glow: "",
  },
  stopped: {
    label: "Stopped",
    color: "text-muted-foreground border-border bg-muted/40",
    dot: "bg-muted-foreground",
    icon: StopCircle,
    pulse: false,
    glow: "",
  },
  error: {
    label: "Error",
    color: "text-destructive border-destructive/30 bg-destructive/10",
    dot: "bg-destructive",
    icon: WifiOff,
    pulse: false,
    glow: "",
  },
} as const;

export default function ShardCard({
  shard,
  qrImage,
  pairingCode,
  onStop,
  onReconnect,
  onDelete,
}: Props) {
  const [showQR, setShowQR] = useState(false);
  const config = STATUS_CONFIG[shard.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.stopped;
  const StatusIcon = config.icon;
  const isSpinning = shard.status === "connecting";
  const isBusy = shard.status === "initializing" || shard.status === "connecting";
  const isConnected = shard.status === "connected";

  return (
    <Card
      className={`bg-card border-border flex flex-col transition-all duration-200 hover:border-border/80 ${isConnected ? config.glow : ""}`}
    >
      <CardHeader className="pb-2 pt-3.5 px-4">
        {/* Top row: ID + status + menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${config.dot} ${config.pulse ? "pulse-dot" : ""}`}
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm font-mono text-foreground truncate leading-tight">
                {shard.id}
              </p>
              {shard.phoneNumber ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={9} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-mono truncate">
                    {shard.phoneNumber}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">No phone number</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge
              variant="outline"
              className={`text-[11px] px-1.5 py-0 h-5 flex items-center gap-1 ${config.color}`}
            >
              <StatusIcon size={10} className={isSpinning ? "animate-spin" : ""} />
              {config.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <MoreHorizontal size={13} />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem
                  className="text-xs gap-2"
                  onClick={() => onReconnect(shard.id)}
                  disabled={isBusy}
                >
                  <RefreshCw size={12} />
                  Reconnect
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2 text-[oklch(0.66_0.195_60)]"
                  onClick={() => onReconnect(shard.id, true)}
                  disabled={isBusy}
                >
                  <ShieldOff size={12} />
                  Reconnect &amp; Clear Session
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs gap-2 text-destructive focus:text-destructive"
                  onClick={() => onStop(shard.id)}
                  disabled={shard.status === "stopped"}
                >
                  <StopCircle size={12} />
                  Stop Shard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2 text-destructive focus:text-destructive"
                  onClick={() => onDelete(shard.id)}
                >
                  <Trash2 size={12} />
                  Clean Session Files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex-1 flex flex-col gap-2.5">
        {/* Meta row */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded bg-muted/40 px-2.5 py-1.5 text-xs">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Index</p>
            <p className="font-mono font-semibold text-foreground">{shard.index} / {shard.total || "?"}</p>
          </div>
          <div className="rounded bg-muted/40 px-2.5 py-1.5 text-xs">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Updated</p>
            <div className="flex items-center gap-1">
              <Clock size={9} className="text-muted-foreground flex-shrink-0" />
              <p className="font-mono font-semibold text-foreground truncate text-[11px]">
                {formatDistanceToNow(new Date(shard.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* QR code section */}
        {qrImage && (
          <div className="rounded border border-border overflow-hidden">
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium hover:bg-muted/30 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[oklch(0.56_0.155_205)]">
                <QrCode size={12} />
                QR Code — Scan to Connect
              </span>
              {showQR ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showQR && (
              <div className="p-3 bg-white flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${qrImage}`}
                  alt={`QR code for shard ${shard.id}`}
                  className="w-36 h-36 object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Pairing code section */}
        {pairingCode && (
          <div className="rounded border border-[oklch(0.59_0.18_300)]/30 bg-[oklch(0.59_0.18_300)]/8 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <KeyRound size={11} className="text-[oklch(0.59_0.18_300)]" />
              <span className="text-[11px] text-[oklch(0.59_0.18_300)] font-medium">Pairing Code</span>
            </div>
            <p className="font-mono text-base font-bold tracking-[0.3em] text-foreground">{pairingCode}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              WhatsApp &rarr; Linked Devices &rarr; Link a Device
            </p>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs gap-1.5 border-border/60"
                onClick={() => onReconnect(shard.id)}
                disabled={isBusy}
              >
                <RefreshCw size={11} />
                Reconnect
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reconnect shard (keeps existing session)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-border/60 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                onClick={() => onStop(shard.id)}
                disabled={shard.status === "stopped"}
              >
                <StopCircle size={12} />
                <span className="sr-only">Stop</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Stop shard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-border/60 text-muted-foreground hover:text-foreground"
                onClick={() => onDelete(shard.id)}
              >
                <Trash2 size={12} />
                <span className="sr-only">Clean session</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clean session files</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
