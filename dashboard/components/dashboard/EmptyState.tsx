"use client";

import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, Layers } from "lucide-react";

interface Props {
  onCreateShard: () => void;
  onLoadAll: () => void;
}

export default function EmptyState({ onCreateShard, onLoadAll }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
        <Layers size={24} className="text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">No Shards Active</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Create a new shard to start a WhatsApp session, or load existing sessions from disk.
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onLoadAll}>
          <FolderOpen size={13} />
          Load Sessions
        </Button>
        <Button size="sm" className="gap-1.5 text-xs" onClick={onCreateShard}>
          <Plus size={13} />
          New Shard
        </Button>
      </div>
    </div>
  );
}
