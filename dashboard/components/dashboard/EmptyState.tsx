"use client";

import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Layers, Terminal } from "lucide-react";

interface Props {
  onCreateShard: () => void;
  onLoadAll: () => void;
}

export default function EmptyState({ onCreateShard, onLoadAll }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center fade-in">
      {/* Icon */}
      <div className="relative">
        <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center">
          <Layers size={24} className="text-muted-foreground/40" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Terminal size={9} className="text-primary" />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2 max-w-xs">
        <h3 className="text-sm font-semibold text-foreground font-mono">
          no_shards_active
        </h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed text-pretty">
          Create a new shard to start a WhatsApp session, or load existing sessions from disk to resume previously authenticated accounts.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-[11px] h-8 border-border/50 bg-surface hover:bg-surface-2 font-mono"
          onClick={onLoadAll}
        >
          <FolderOpen size={11} />
          Load Sessions
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-[11px] h-8 bg-primary hover:bg-primary/90 font-mono"
          onClick={onCreateShard}
        >
          <Plus size={11} />
          New Shard
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground/50 font-mono">
        auto-refresh active — shards appear as they initialize
      </p>
    </div>
  );
}
