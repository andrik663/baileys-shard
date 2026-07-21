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
    color: "bg-[oklch(0.62_0.17_148)]/15 text-[oklch(0.62_0.17_148)] border-[oklch(0.62_0.17_148)]/30",
    dot: "bg-[oklch(0.62_0.17_148)]",
    icon: Wifi,
    pulse: true,
  },
  disconnected: {
    label: "Disconnected",
    color: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
    icon: WifiOff,
    pulse: false,
  },
  initializing: {
    label: "Initializing",
    color: "bg-[oklch(0.65_0.20_60)]/15 text-[oklch(0.65_0.20_60)] border-[oklch(0.65_0.20_60)]/30",
    dot: "bg-[oklch(0.65_0.20_60)]",
    icon: Loader2,
    pulse: true,
  },
  connecting: {
    label: "Connecting",
    color: "bg-[oklch(0.65_0.20_60)]/15 text-[oklch(0.65_0.20_60)] border-[oklch(0.65_0.20_60)]/30",
    dot: "bg-[oklch(0.65_0.20_60)]",
    icon: Loader2,
    pulse: true,
  },
  logged_out: {
    label: "Logged Out",
    color: "bg-[oklch(0.60_0.18_300)]/15 text-[oklch(0.60_0.18_300)] border-[oklch(0.60_0.18_300)]/30",
    dot: "bg-[oklch(0.60_0.18_300)]",
    icon: LogOut,
    pulse: false,
  },
  stopped: {
    label: "Stopped",
    color: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    icon: StopCircle,
    pulse: false,
  },
  error: {
    label: "Error",
    color: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
    icon: WifiOff,
    pulse: false,
  },
} as const;

export default function ShardCard({ shard, qrImage, pairingCode, onStop, onReconnect, onDelete }: Props) {
  const [showQR, setShowQR] = useState(false);
  const config = STATUS_CONFIG[shard.status] ?? STATUS_CONFIG.stopped;
  const StatusIcon = config.icon;
  const isSpinning = shard.status === "initializing" || shard.status === "connecting";

  return (
    <Card className="bg-card border-border/60 flex flex-col">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot} ${config.pulse ? "pulse-dot" : ""}`} />
            <div className="min-w-0">
              <p className="font-semibold text-sm font-mono text-foreground truncate">{shard.id}</p>
              {shard.phoneNumber && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone size={10} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-mono truncate">{shard.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0.5 flex-shrink-0 flex items-center gap-1.5 ${config.color}`}
          >
            <StatusIcon size={11} className={isSpinning ? "animate-spin" : ""} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex-1 flex flex-col gap-3">
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/40 rounded-md px-2.5 py-1.5">
            <p className="text-muted-foreground mb-0.5">Index</p>
            <p className="font-mono font-medium text-foreground">{shard.index}</p>
          </div>
          <div className="bg-muted/40 rounded-md px-2.5 py-1.5">
            <p className="text-muted-foreground mb-0.5">Updated</p>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-muted-foreground" />
              <p className="font-mono font-medium text-foreground truncate">
                {formatDistanceToNow(new Date(shard.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* QR / Pairing codes */}
        {qrImage && (
          <div className="rounded-md border border-border/60 overflow-hidden">
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[oklch(0.55_0.15_200)]">
                <QrCode size={13} />
                QR Code Ready — Scan to Connect
              </span>
              {showQR ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showQR && (
              <div className="p-3 bg-white flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${qrImage}`}
                  alt={`QR code for shard ${shard.id}`}
                  className="w-40 h-40 object-contain"
                />
              </div>
            )}
          </div>
        )}

        {pairingCode && (
          <div className="rounded-md border border-[oklch(0.60_0.18_300)]/30 bg-[oklch(0.60_0.18_300)]/10 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <KeyRound size={12} className="text-[oklch(0.60_0.18_300)]" />
              <span className="text-xs text-[oklch(0.60_0.18_300)] font-medium">Pairing Code</span>
            </div>
            <p className="font-mono text-lg font-bold tracking-widest text-foreground">{pairingCode}</p>
            <p className="text-xs text-muted-foreground mt-1">Enter in WhatsApp &rarr; Linked Devices</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-1 mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs gap-1.5"
                onClick={() => onReconnect(shard.id)}
                disabled={shard.status === "initializing" || shard.status === "connecting"}
              >
                <RefreshCw size={12} />
                Reconnect
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reconnect shard (keeps session)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1 text-[oklch(0.65_0.20_60)] border-[oklch(0.65_0.20_60)]/30 hover:bg-[oklch(0.65_0.20_60)]/10"
                onClick={() => onReconnect(shard.id, true)}
                disabled={shard.status === "initializing" || shard.status === "connecting"}
              >
                <Trash2 size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reconnect &amp; clear session</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => onStop(shard.id)}
                disabled={shard.status === "stopped"}
              >
                <StopCircle size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Stop shard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => onDelete(shard.id)}
              >
                <Trash2 size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete &amp; clean session</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
