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
    <Card className="bg-card border-border/60">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Database size={16} className="text-primary" />
          Session Inspector
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
            className="h-8 px-3 text-xs"
            onClick={() => checkSession(searchId)}
            disabled={loading || !searchId.trim()}
          >
            {loading ? "Checking..." : "Check"}
          </Button>
        </div>

        {/* Quick select active shards */}
        {shards.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shards.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSearchId(s.id);
                  checkSession(s.id);
                }}
                className="text-xs font-mono px-2 py-0.5 rounded bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors"
              >
                {s.id}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
        )}

        {result && (
          <div className="rounded-md border border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold">{result.id}</span>
              {result.session.valid ? (
                <Badge className="text-xs bg-[oklch(0.62_0.17_148)]/15 text-[oklch(0.62_0.17_148)] border-[oklch(0.62_0.17_148)]/30 gap-1">
                  <ShieldCheck size={11} /> Valid
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-destructive border-destructive/30 gap-1">
                  <ShieldAlert size={11} /> Invalid
                </Badge>
              )}
            </div>

            <div className="p-3 space-y-2">
              {[
                { label: "Exists on disk", value: result.session.exists },
                { label: "Registered", value: result.session.registered },
                { label: "Valid credentials", value: result.session.valid },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  {value ? (
                    <span className="flex items-center gap-1 text-[oklch(0.62_0.17_148)]">
                      <CheckCircle2 size={12} /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-destructive">
                      <XCircle size={12} /> No
                    </span>
                  )}
                </div>
              ))}

              {result.session.reason && (
                <>
                  <Separator className="opacity-40" />
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle size={12} className="text-[oklch(0.65_0.20_60)] flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{result.session.reason}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <Separator className="opacity-40" />

        {/* All sessions summary */}
        <ScrollArea className="h-40">
          <div className="space-y-1">
            {shards.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No active shards</p>
            ) : (
              shards.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/30 cursor-pointer"
                  onClick={() => {
                    setSearchId(s.id);
                    checkSession(s.id);
                  }}
                >
                  <span className="text-xs font-mono text-foreground">{s.id}</span>
                  <div className="flex items-center gap-2">
                    {s.phoneNumber && (
                      <span className="text-xs text-muted-foreground font-mono">{s.phoneNumber}</span>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0"
                    >
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
