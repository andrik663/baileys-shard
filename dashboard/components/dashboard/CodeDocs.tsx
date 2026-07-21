"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Copy, Check } from "lucide-react";

const SNIPPETS: Record<string, { label: string; code: string; badge: string }> = {
  basic: {
    label: "Basic Usage",
    badge: "ESM",
    code: `import { ShardManager } from "baileys-shard";

const manager = new ShardManager({
  session: "./sessions" // session directory
});

// Listen for connection events
manager.on("login.update", ({ shardId, state, type, code, image }) => {
  if (type === "qr") {
    // image = Buffer (PNG)
    console.log(\`QR ready for \${shardId}\`);
  } else if (type === "pairing") {
    console.log(\`Pairing code for \${shardId}: \${code}\`);
  } else if (state === "connected") {
    console.log(\`\${shardId} connected!\`);
  }
});

// Create a new shard
const { id, sock } = await manager.createShard({
  id: "bot-1",
  phoneNumber: "6281234567890" // optional
});`,
  },
  multi: {
    label: "Multi-Session",
    badge: "Advanced",
    code: `// Load all existing sessions on startup
const ids = await manager.loadAllShards();
console.log("Loaded:", ids);

// Handle messages from ALL shards
manager.on("messages.upsert", async ({ shardId, sock, data }) => {
  for (const msg of data.messages) {
    if (!msg.key.fromMe && msg.message?.conversation) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: \`[Auto-reply from \${shardId}] \${msg.message.conversation}\`
      });
    }
  }
});

// Bot farm — 10 sessions
for (let i = 1; i <= 10; i++) {
  await manager.createShard({
    id: \`bot-\${i}\`,
    phoneNumber: \`6281234567\${i.toString().padStart(3, "0")}\`
  });
}`,
  },
  events: {
    label: "Event System",
    badge: "Events",
    code: `// Global events (all shards)
manager.on("shard.error", ({ shardId, error }) => {
  console.error(\`Error on \${shardId}: [\${error.code}] \${error.message}\`);
  if (error.code === "RECREATE_FAILED") {
    setTimeout(() => {
      manager.recreateShard({ id: shardId, clearSession: true });
    }, 10000);
  }
});

// Per-shard event isolation
const bot1 = manager.shard("bot-1");
if (bot1) {
  bot1.on("messages.upsert", ({ data }) => {
    // Only messages from bot-1
    console.log("bot-1 messages:", data.messages);
  });
}

// Direct socket access
const sock = manager.socket("bot-1");
await sock?.sendMessage("6281234567890@s.whatsapp.net", {
  text: "Hello from direct socket!"
});`,
  },
  session: {
    label: "Session Mgmt",
    badge: "Sessions",
    code: `// Check session status
const info = await manager.getSessionInfo("bot-1");
// { exists: true, registered: true, valid: true }

// Validate + clean if corrupt
await manager.validateAndCleanSession("./sessions/bot-1");

// Auto-clean all corrupt sessions
await manager.cleanupCorruptSessions();

// Recreate with options
await manager.recreateShard({
  id: "bot-1",
  clearSession: false,   // protect registered session
  forceRecreate: false,
  phoneNumber: "6281234567890"
});

// Get all shard info
const allInfo = manager.getAllShardInfo();
allInfo.forEach(s => console.log(s.id, s.status));`,
  },
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-6 px-1.5 text-xs gap-1 z-10 text-muted-foreground hover:text-foreground"
        onClick={copy}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <ScrollArea className="h-52 rounded-md bg-muted/30 border border-border/60">
        <pre className="text-xs font-mono leading-relaxed p-4 pr-16 whitespace-pre overflow-x-auto">
          <code>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}

export default function CodeDocs() {
  return (
    <Card className="bg-card border-border/60">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Code2 size={16} className="text-primary" />
          API Reference & Examples
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <Tabs defaultValue="basic">
          <TabsList className="h-7 bg-muted/40 mb-3 flex-wrap gap-0.5">
            {Object.entries(SNIPPETS).map(([key, { label, badge }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-xs h-6 px-2.5 gap-1.5"
              >
                {label}
                <Badge
                  variant="secondary"
                  className="text-xs px-1 py-0 h-4 hidden sm:flex"
                >
                  {badge}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(SNIPPETS).map(([key, { code }]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <CodeBlock code={code} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
