"use client";

import { useState } from "react";
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
  ShieldOff,
  Zap,
  Hash,
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

interface StatusCfg {
  label: string;
  color: string;       /* text colour */
  border: string;      /* border class */
  dot: string;         /* dot bg */
  glow: string;        /* box-shadow class */
  pulse: boolean;
  icon: React.ElementType;
  spinning?: boolean;
}

const STATUS_CONFIG: Record<string, StatusCfg> = {
  connected: {
    label: "Connected",
    color: "text-[oklch(0.640_0.175_148)]",
    border: "border-[oklch(0.640_0.175_148/28%)]",
    dot: "bg-[oklch(0.640_0.175_148)]",
    glow: "glow-connected",
    pulse: true,
    icon: Wifi,
  },
  disconnected: {
    label: "Disconnected",
    color: "text-destructive",
    border: "border-destructive/25",
    dot: "bg-destructive",
    glow: "glow-error",
    pulse: false,
    icon: WifiOff,
  },
  initializing: {
    label: "Initializing",
    color: "text-[oklch(0.670_0.195_58)]",
    border: "border-[oklch(0.670_0.195_58/25%)]",
    dot: "bg-[oklch(0.670_0.195_58)]",
    glow: "glow-initializing",
    pulse: true,
    icon: Zap,
  },
  connecting: {
    label: "Connecting",
    color: "text-[oklch(0.670_0.195_58)]",
    border: "border-[oklch(0.670_0.195_58/25%)]",
    dot: "bg-[oklch(0.670_0.195_58)]",
    glow: "glow-initializing",
    pulse: true,
    icon: Loader2,
    spinning: true,
  },
  logged_out: {
    label: "Logged Out",
    color: "text-[oklch(0.585_0.182_300)]",
    border: "border-[oklch(0.585_0.182_300/25%)]",
    dot: "bg-[oklch(0.585_0.182_300)]",
    glow: "",
    pulse: false,
    icon: LogOut,
  },
  stopped: {
    label: "Stopped",
    color: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
    glow: "",
    pulse: false,
    icon: StopCircle,
  },
  error: {
    label: "Error",
    color: "text-destructive",
    border: "border-destructive/25",
    dot: "bg-destructive",
    glow: "glow-error",
    pulse: false,
    icon: WifiOff,
  },
};

const FALLBACK: StatusCfg = STATUS_CONFIG.stopped;

export default function ShardCard({
  shard,
  qrImage,
  pairingCode,
  onStop,
  onReconnect,
  onDelete,
}: Props) {
  const [showQR, setShowQR] = useState(false);
  const cfg = STATUS_CONFIG[shard.status as keyof typeof STATUS_CONFIG] ?? FALLBACK;
  const StatusIcon = cfg.icon;
  const isBusy = shard.status === "initializing" || shard.status === "connecting";
  const isConnected = shard.status === "connected";

  return (
    <div
      className={`relative flex flex-col bg-card rounded-xl border transition-all duration-200 hover:bg-[oklch(0.125_0.009_248)] ${cfg.border} ${isConnected ? cfg.glow : shard.status === "error" ? cfg.glow : ""}`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-[1.5px] rounded-full opacity-60"
        style={{
          background:
            isConnected
              ? "oklch(0.640 0.175 148)"
              : shard.status === "initializing" || shard.status === "connecting"
              ? "oklch(0.670 0.195 58)"
              : shard.status === "error" || shard.status === "disconnected"
              ? "oklch(0.630 0.220 25)"
              : "transparent",
        }}
      />

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          {/* ID + phone */}
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Status dot with pulse ring */}
            <div className="relative flex items-center justify-center mt-1 flex-shrink-0 w-4 h-4">
              {cfg.pulse && (
                <span
                  className="pulse-ring absolute inline-flex h-3 w-3 rounded-full opacity-40"
                  style={{ background: cfg.dot.replace("bg-", "").replace("[", "").replace("]", "") }}
                />
              )}
              <span className={`relative inline-flex w-2 h-2 rounded-full ${cfg.dot}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Hash size={10} className="text-muted-foreground flex-shrink-0" />
                <p className="font-mono font-bold text-sm text-foreground truncate leading-tight">
                  {shard.id}
                </p>
              </div>
              {shard.phoneNumber ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={9} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-mono truncate">
                    {shard.phoneNumber}
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-0.5">No phone number</p>
              )}
            </div>
          </div>

          {/* Status badge + menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-5 gap-1 font-mono border ${cfg.color} border-current/30`}
              style={{ borderColor: "currentColor", opacity: 0.9 }}
            >
              <StatusIcon size={9} className={cfg.spinning ? "animate-spin" : ""} />
              {cfg.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground/60 hover:text-foreground hover:bg-surface-2 flex-shrink-0"
                >
                  <MoreHorizontal size={12} />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuItem
                  className="text-xs gap-2 cursor-pointer"
                  onClick={() => onReconnect(shard.id)}
                  disabled={isBusy}
                >
                  <RefreshCw size={12} />
                  Reconnect
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2 cursor-pointer text-[oklch(0.670_0.195_58)] focus:text-[oklch(0.670_0.195_58)]"
                  onClick={() => onReconnect(shard.id, true)}
                  disabled={isBusy}
                >
                  <ShieldOff size={12} />
                  Reconnect &amp; Clear Session
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => onStop(shard.id)}
                  disabled={shard.status === "stopped"}
                >
                  <StopCircle size={12} />
                  Stop Shard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => onDelete(shard.id)}
                >
                  <Trash2 size={12} />
                  Clean Session Files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
        <div className="panel-inset px-2.5 py-2">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Index</p>
          <p className="font-mono text-xs font-bold text-foreground">
            {shard.index} <span className="text-muted-foreground font-normal">/ {shard.total ?? "?"}</span>
          </p>
        </div>
        <div className="panel-inset px-2.5 py-2">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Updated</p>
          <div className="flex items-center gap-1">
            <Clock size={8} className="text-muted-foreground flex-shrink-0" />
            <p className="font-mono text-[10px] font-semibold text-foreground truncate">
              {formatDistanceToNow(new Date(shard.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* QR code */}
      {qrImage && (
        <div className="mx-4 mb-3 rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium hover:bg-muted/20 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-[oklch(0.555_0.155_210)]">
              <QrCode size={11} />
              QR Code — Scan to connect
            </span>
            {showQR ? <ChevronUp size={11} className="text-muted-foreground" /> : <ChevronDown size={11} className="text-muted-foreground" />}
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

      {/* Pairing code */}
      {pairingCode && (
        <div className="mx-4 mb-3 rounded-lg border border-[oklch(0.585_0.182_300/30%)] bg-[oklch(0.585_0.182_300/6%)] px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <KeyRound size={10} className="text-[oklch(0.585_0.182_300)]" />
            <span className="text-[10px] text-[oklch(0.585_0.182_300)] font-semibold uppercase tracking-wider">
              Pairing Code
            </span>
          </div>
          <p className="font-mono text-lg font-bold tracking-[0.35em] text-foreground">{pairingCode}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            WhatsApp &rarr; Linked Devices &rarr; Link a Device
          </p>
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 pb-4 mt-auto">
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-[11px] gap-1.5 border-border/50 bg-surface hover:bg-surface-2 font-mono"
                onClick={() => onReconnect(shard.id)}
                disabled={isBusy}
              >
                <RefreshCw size={10} />
                Reconnect
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Reconnect shard — keeps existing session
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-border/50 bg-surface hover:bg-destructive/15 hover:border-destructive/40 hover:text-destructive text-muted-foreground"
                onClick={() => onStop(shard.id)}
                disabled={shard.status === "stopped"}
              >
                <StopCircle size={11} />
                <span className="sr-only">Stop</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Stop shard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-border/50 bg-surface hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                onClick={() => onDelete(shard.id)}
              >
                <Trash2 size={11} />
                <span className="sr-only">Clean session</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Clean session files</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
