"use client";

import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Layers, Zap } from "lucide-react";

interface Props {
  onCreateShard: () => void;
  onLoadAll: () => void;
}

export default function EmptyState({ onCreateShard, onLoadAll }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center fade-in">
      {/* Icon cluster */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
          <Layers size={28} className="text-muted-foreground/50" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Zap size={11} className="text-primary" />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-sm font-semibold text-foreground">No Shards Active</h3>
        <p className="text-xs text-muted-foreground leading-relaxed text-pretty">
          Create a new shard to start a WhatsApp session, or load existing sessions from disk
          to resume previously authenticated accounts.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs h-8 border-border/60"
          onClick={onLoadAll}
        >
          <FolderOpen size={12} />
          Load Sessions
        </Button>
        <Button size="sm" className="gap-1.5 text-xs h-8" onClick={onCreateShard}>
          <Plus size={12} />
          Create New Shard
        </Button>
      </div>

      {/* Hint */}
      <p className="text-[11px] text-muted-foreground/60">
        Auto-refresh is active — shards will appear as soon as they initialize
      </p>
    </div>
  );
}
