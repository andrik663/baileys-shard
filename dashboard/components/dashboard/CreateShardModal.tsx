"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Phone, Hash, Info } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateShardModal({ open, onClose, onCreated }: Props) {
  const [id, setId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body: any = {};
      if (id.trim()) body.id = id.trim();
      if (phoneNumber.trim()) body.phoneNumber = phoneNumber.trim();

      const res = await fetch("/api/shards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create shard");

      setId("");
      setPhoneNumber("");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md bg-card border-border/60 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Create New Shard
          </DialogTitle>
          <DialogDescription>
            Add a new WhatsApp session shard to the manager.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="shard-id" className="text-xs font-medium flex items-center gap-1.5">
              <Hash size={12} />
              Shard ID
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="shard-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. bot-1, main-session"
              className="font-mono text-sm bg-muted/30 border-border/60"
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated if left blank (shard-1, shard-2, ...)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5">
              <Phone size={12} />
              Phone Number
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 6281234567890"
              className="font-mono text-sm bg-muted/30 border-border/60"
            />
            <p className="text-xs text-muted-foreground">
              Provide for pairing code auth. Leave blank to use QR code.
            </p>
          </div>

          <div className="rounded-md bg-muted/40 border border-border/40 p-3 flex gap-2">
            <Info size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              After creation, scan the QR code or enter the pairing code in WhatsApp &rarr; Linked Devices.
            </p>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {loading ? "Creating..." : "Create Shard"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
