"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Layers, Activity, Database, Code2, AlertCircle } from "lucide-react";
import type { ShardStatus, EventLogEntry, Summary, ShardsResponse } from "@/lib/types";

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
  const [toast, setToast] = useState<{ message: string; level: "success" | "error" | "info" } | null>(null);
  const [activeTab, setActiveTab] = useState("shards");

  const showToast = useCallback(
    (message: string, level: "success" | "error" | "info" = "info") => {
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
      console.error("[v0] Failed to fetch dashboard data:", err);
    }
  }, []);

  // Initial load + auto-refresh every 3s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
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

  const handleStop = (id: string) => {
    setPendingAction({ type: "stop", shardId: id });
  };

  const handleReconnect = (id: string, clearSession = false) => {
    setPendingAction({ type: "reconnect", shardId: id, clearSession });
  };

  const handleDelete = (id: string) => {
    setPendingAction({ type: "delete", shardId: id });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setConfirmLoading(true);
    try {
      const { type, shardId, clearSession } = pendingAction;

      if (type === "stop") {
        const res = await fetch(`/api/shards/${encodeURIComponent(shardId)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(`Shard "${shardId}" stopped`, "info");
      }

      if (type === "reconnect") {
        const res = await fetch(`/api/shards/${encodeURIComponent(shardId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reconnect", clearSession: clearSession ?? false }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast(
          `Reconnecting "${shardId}"${clearSession ? " (session cleared)" : ""}`,
          "success"
        );
      }

      if (type === "delete") {
        const res = await fetch(`/api/session/${encodeURIComponent(shardId)}`, { method: "DELETE" });
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        summary={summary}
        loading={loading}
        onRefresh={handleRefresh}
        onCreateShard={() => setCreateOpen(true)}
        onLoadAll={handleLoadAll}
      />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Stats row */}
        <StatsCards summary={summary} />

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/40 h-8 gap-0.5">
            <TabsTrigger value="shards" className="text-xs h-7 gap-1.5">
              <Layers size={13} />
              Shards
              {shards.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                  {shards.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs h-7 gap-1.5">
              <Activity size={13} />
              Event Log
              {errorCount > 0 && (
                <Badge className="text-xs px-1.5 py-0 h-4 bg-destructive text-destructive-foreground">
                  {errorCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs h-7 gap-1.5">
              <Database size={13} />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs h-7 gap-1.5">
              <Activity size={13} />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs h-7 gap-1.5">
              <Code2 size={13} />
              API Docs
            </TabsTrigger>
          </TabsList>

          {/* Shards grid */}
          <TabsContent value="shards" className="mt-4">
            {shards.length === 0 ? (
              <EmptyState
                onCreateShard={() => setCreateOpen(true)}
                onLoadAll={handleLoadAll}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

          {/* Event log */}
          <TabsContent value="logs" className="mt-4">
            <EventLog logs={logs} onClear={handleClearLogs} />
          </TabsContent>

          {/* Sessions inspector */}
          <TabsContent value="sessions" className="mt-4">
            <div className="max-w-xl">
              <SessionInfoPanel shards={shards} />
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-4">
            <ActivityChart logs={logs} />
          </TabsContent>

          {/* API Docs */}
          <TabsContent value="docs" className="mt-4">
            <CodeDocs />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-3 px-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Baileys Shard v0.0.7 &mdash; Multi-Session WhatsApp Management
          </span>
          <div className="flex items-center gap-3">
            <span>Auto-refresh: 3s</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.62_0.17_148)] inline-block pulse-dot" />
              Live
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
            ? `Stop Shard "${pendingAction?.shardId}"?`
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

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-lg border slide-in-up
            ${
              toast.level === "error"
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : toast.level === "success"
                ? "bg-[oklch(0.62_0.17_148)]/15 text-[oklch(0.62_0.17_148)] border-[oklch(0.62_0.17_148)]/30"
                : "bg-card text-foreground border-border/60"
            }`}
        >
          {toast.level === "error" && <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
