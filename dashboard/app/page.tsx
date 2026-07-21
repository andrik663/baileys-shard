"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/dashboard/Header";
import StatsCards from "@/components/dashboard/StatsCards";
import ShardCard from "@/components/dashboard/ShardCard";
import CreateShardModal from "@/components/dashboard/CreateShardModal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import EventLog from "@/components/dashboard/EventLog";
import SessionInfoPanel from "@/components/dashboard/SessionInfoPanel";
import ActivityChart from "@/components/dashboard/ActivityChart";
import CodeDocs from "@/components/dashboard/CodeDocs";
import EmptyState from "@/components/dashboard/EmptyState";
import {
  Layers,
  Activity,
  Database,
  BarChart2,
  Code2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import type {
  ShardStatus,
  EventLogEntry,
  Summary,
  ShardsResponse,
} from "@/lib/types";

const DEFAULT_SUMMARY: Summary = {
  total: 0,
  connected: 0,
  disconnected: 0,
  initializing: 0,
  loggedOut: 0,
  stopped: 0,
  uptime: 0,
  totalMessages: 0,
  totalEvents: 0,
};

interface PendingAction {
  type: "stop" | "delete" | "reconnect";
  shardId: string;
  clearSession?: boolean;
}

interface ToastState {
  message: string;
  level: "success" | "error" | "info";
}

export default function DashboardPage() {
  const [shards, setShards] = useState<ShardStatus[]>([]);
  const [summary, setSummary] = useState<Summary>(DEFAULT_SUMMARY);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [pairingCodes, setPairingCodes] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<EventLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [activeTab, setActiveTab] = useState("shards");

  const showToast = useCallback(
    (message: string, level: ToastState["level"] = "info") => {
      setToast({ message, level });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  const fetchData = useCallback(async () => {
    try {
      const [shardsRes, logsRes] = await Promise.all([
        fetch("/api/shards"),
        fetch("/api/logs"),
      ]);
      if (shardsRes.ok) {
        const data: ShardsResponse = await shardsRes.json();
        setShards(data.shards ?? []);
        setSummary(data.summary ?? DEFAULT_SUMMARY);
        setQrCodes(data.qrCodes ?? {});
        setPairingCodes(data.pairingCodes ?? {});
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs ?? []);
      }
    } catch (err) {
      console.error("[dashboard] Failed to fetch:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 3000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
    showToast("Data refreshed", "info");
  };

  const handleLoadAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shards/load-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Loaded ${data.ids?.length ?? 0} session(s)`, "success");
      await fetchData();
    } catch (err: any) {
      showToast(err.message ?? "Failed to load sessions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = (id: string) =>
    setPendingAction({ type: "stop", shardId: id });

  const handleReconnect = (id: string, clearSession = false) =>
    setPendingAction({ type: "reconnect", shardId: id, clearSession });

  const handleDelete = (id: string) =>
    setPendingAction({ type: "delete", shardId: id });

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setConfirmLoading(true);
    try {
      const { type, shardId, clearSession } = pendingAction;

      if (type === "stop") {
        const res = await fetch(`/api/shards/${encodeURIComponent(shardId)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(`Shard "${shardId}" stopped`, "info");
      }

      if (type === "reconnect") {
        const res = await fetch(
          `/api/shards/${encodeURIComponent(shardId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "reconnect",
              clearSession: clearSession ?? false,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(
          `Reconnecting "${shardId}"${clearSession ? " — session cleared" : ""}`,
          "success"
        );
      }

      if (type === "delete") {
        const res = await fetch(
          `/api/session/${encodeURIComponent(shardId)}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(`Session "${shardId}" cleaned`, "info");
      }

      await fetchData();
    } catch (err: any) {
      showToast(err.message ?? "Action failed", "error");
    } finally {
      setConfirmLoading(false);
      setPendingAction(null);
    }
  };

  const handleClearLogs = async () => {
    await fetch("/api/logs", { method: "DELETE" });
    setLogs([]);
    showToast("Logs cleared", "info");
  };

  const errorCount = logs.filter((l) => l.level === "error").length;

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern">
      <Header
        summary={summary}
        loading={loading}
        onRefresh={handleRefresh}
        onCreateShard={() => setCreateOpen(true)}
        onLoadAll={handleLoadAll}
      />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-5 space-y-4">
        {/* Stats */}
        <StatsCards summary={summary} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="!flex-col !gap-0 w-full">
          {/* Tab bar */}
          <div className="border-b border-border">
            <TabsList className="bg-transparent h-auto gap-0 p-0 rounded-none">
              {[
                {
                  value: "shards",
                  label: "Shards",
                  icon: <Layers size={12} />,
                  badge: shards.length > 0 ? String(shards.length) : null,
                  badgeVariant: "default" as const,
                },
                {
                  value: "logs",
                  label: "Event Log",
                  icon: <Activity size={12} />,
                  badge: errorCount > 0 ? String(errorCount) : null,
                  badgeVariant: "error" as const,
                },
                {
                  value: "sessions",
                  label: "Sessions",
                  icon: <Database size={12} />,
                  badge: null,
                  badgeVariant: "default" as const,
                },
                {
                  value: "analytics",
                  label: "Analytics",
                  icon: <BarChart2 size={12} />,
                  badge: null,
                  badgeVariant: "default" as const,
                },
                {
                  value: "docs",
                  label: "API Docs",
                  icon: <Code2 size={12} />,
                  badge: null,
                  badgeVariant: "default" as const,
                },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`
                    relative h-9 px-3.5 text-[11px] font-mono font-semibold rounded-none border-b-2 border-transparent
                    text-muted-foreground hover:text-foreground transition-colors gap-1.5
                    data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span
                      className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold tabular-nums ${
                        tab.badgeVariant === "error"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Shards grid */}
          <TabsContent value="shards" className="mt-4">
            {shards.length === 0 ? (
              <EmptyState
                onCreateShard={() => setCreateOpen(true)}
                onLoadAll={handleLoadAll}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 auto-rows-fr">
                {shards.map((shard) => (
                  <ShardCard
                    key={shard.id}
                    shard={shard}
                    qrImage={qrCodes[shard.id]}
                    pairingCode={pairingCodes[shard.id]}
                    onStop={handleStop}
                    onReconnect={handleReconnect}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <EventLog logs={logs} onClear={handleClearLogs} />
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SessionInfoPanel shards={shards} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <ActivityChart logs={logs} />
          </TabsContent>

          <TabsContent value="docs" className="mt-4">
            <CodeDocs />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-2.5 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-mono">
            baileys-shard v0.0.7 &mdash; multi-session WhatsApp management
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground font-mono">
              refresh: 3s
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              live
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateShardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchData}
      />

      <ConfirmDialog
        open={!!pendingAction}
        title={
          pendingAction?.type === "stop"
            ? `Stop "${pendingAction?.shardId}"?`
            : pendingAction?.type === "delete"
            ? `Clean Session "${pendingAction?.shardId}"?`
            : `Reconnect "${pendingAction?.shardId}"?`
        }
        description={
          pendingAction?.type === "stop"
            ? "This will stop the shard socket. You can reconnect it later."
            : pendingAction?.type === "delete"
            ? "This will validate and delete the session files. The shard will need to re-authenticate."
            : pendingAction?.clearSession
            ? "This will force-clear the session and reconnect. The shard will need to re-authenticate."
            : "This will recreate the shard connection while protecting any valid existing session."
        }
        confirmLabel={
          pendingAction?.type === "stop"
            ? "Stop Shard"
            : pendingAction?.type === "delete"
            ? "Clean Session"
            : "Reconnect"
        }
        destructive={
          pendingAction?.type === "stop" ||
          pendingAction?.type === "delete" ||
          pendingAction?.clearSession
        }
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={() => setPendingAction(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`
            fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg
            text-xs font-mono font-medium shadow-2xl border slide-up
            ${
              toast.level === "error"
                ? "bg-[oklch(0.630_0.220_25/12%)] text-destructive border-destructive/30"
                : toast.level === "success"
                ? "bg-[oklch(0.640_0.175_148/10%)] text-[oklch(0.640_0.175_148)] border-[oklch(0.640_0.175_148/30%)]"
                : "bg-card text-foreground border-border/60"
            }
          `}
        >
          {toast.level === "error" && <AlertCircle size={13} />}
          {toast.level === "success" && <CheckCircle2 size={13} />}
          {toast.level === "info" && <Info size={13} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
