"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  Loader2,
  Phone,
  Wifi,
  WifiOff,
  StopCircle,
  LogOut,
  Zap,
} from "lucide-react";
import type { ShardStatus } from "@/lib/types";

interface SessionCheckResult {
  id: string;
  session: {
    exists: boolean;
    registered: boolean;
    valid: boolean;
    reason?: string;
  };
}

interface Props {
  shards: ShardStatus[];
}

const STATUS_DOT: Record<string, string> = {
  connected:    "bg-primary",
  disconnected: "bg-destructive",
  initializing: "bg-[oklch(0.66_0.195_60)]",
  connecting:   "bg-[oklch(0.66_0.195_60)]",
  logged_out:   "bg-[oklch(0.59_0.18_300)]",
  stopped:      "bg-muted-foreground",
  error:        "bg-destructive",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  connected:    <Wifi size={11} className="text-primary" />,
  disconnected: <WifiOff size={11} className="text-destructive" />,
  initializing: <Zap size={11} className="text-[oklch(0.66_0.195_60)]" />,
  connecting:   <Loader2 size={11} className="text-[oklch(0.66_0.195_60)] animate-spin" />,
  logged_out:   <LogOut size={11} className="text-[oklch(0.59_0.18_300)]" />,
  stopped:      <StopCircle size={11} className="text-muted-foreground" />,
  error:        <WifiOff size={11} className="text-destructive" />,
};

export default function SessionInfoPanel({ shards }: Props) {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<SessionCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkSession = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/session/${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to check session");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Left: Inspector */}
      <Card className="bg-card border-border">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database size={15} className="text-primary" />
            Session Inspector
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) checkSession(searchId);
                }}
                placeholder="Enter shard ID..."
                className="h-8 pl-7 text-xs font-mono bg-muted/30 border-border/60"
              />
            </div>
            <Button
              size="sm"
              className="h-8 px-3 text-xs gap-1.5"
              onClick={() => checkSession(searchId)}
              disabled={loading || !searchId.trim()}
            >
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Search size={12} />
              )}
              {loading ? "Checking..." : "Check"}
            </Button>
          </div>

          {/* Quick shard buttons */}
          {shards.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-muted-foreground self-center">Quick select:</span>
              {shards.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSearchId(s.id);
                    checkSession(s.id);
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s.status] ?? "bg-muted-foreground"}`}
                  />
                  {s.id}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 rounded border border-destructive/20 px-3 py-2 flex items-center gap-2">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          {result && (
            <div className="rounded border border-border overflow-hidden fade-in">
              <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-foreground">{result.id}</span>
                {result.session.valid ? (
                  <Badge className="text-[11px] h-5 gap-1 bg-primary/15 text-primary border border-primary/30">
                    <ShieldCheck size={10} />
                    Valid Session
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] h-5 gap-1 text-destructive border-destructive/30">
                    <ShieldAlert size={10} />
                    Invalid
                  </Badge>
                )}
              </div>

              <div className="p-3 space-y-1.5">
                {([
                  { label: "Session exists on disk", value: result.session.exists },
                  { label: "Device registered",       value: result.session.registered },
                  { label: "Credentials valid",       value: result.session.valid },
                ] as const).map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    {value ? (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 size={11} />
                        Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-destructive font-medium">
                        <XCircle size={11} />
                        No
                      </span>
                    )}
                  </div>
                ))}

                {result.session.reason && (
                  <>
                    <Separator className="opacity-30 my-1" />
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-[oklch(0.66_0.195_60)]/8 rounded px-2 py-1.5">
                      <AlertCircle size={11} className="text-[oklch(0.66_0.195_60)] mt-0.5 flex-shrink-0" />
                      {result.session.reason}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-1.5">
              <Database size={20} className="opacity-25" />
              <p className="text-xs">Enter a shard ID to inspect its session</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Sessions table */}
      <Card className="bg-card border-border">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Database size={15} className="text-primary" />
              Active Sessions
            </span>
            <Badge variant="secondary" className="text-[11px] h-4 px-1.5 font-mono">
              {shards.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {shards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Database size={20} className="opacity-25" />
              <p className="text-xs">No active shards</p>
            </div>
          ) : (
            <ScrollArea className="h-56">
              <div className="space-y-1">
                {shards.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSearchId(s.id);
                      checkSession(s.id);
                    }}
                    className="flex items-center justify-between px-2.5 py-2 rounded border border-transparent hover:border-border/60 hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s.status] ?? "bg-muted-foreground"} ${s.status === "connected" ? "pulse-dot" : ""}`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold text-foreground truncate">{s.id}</p>
                        {s.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone size={9} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-mono">{s.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {s.index}/{s.total || "?"}
                      </span>
                      <div className="flex items-center gap-1">
                        {STATUS_ICONS[s.status]}
                        <span className="text-[11px] text-muted-foreground capitalize group-hover:text-foreground transition-colors">
                          {s.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
