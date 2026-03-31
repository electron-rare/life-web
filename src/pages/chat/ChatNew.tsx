import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/ui/GlassCard";

type Message = { role: string; content: string };

export function ChatNew() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("ollama");
  const [model, setModel] = useState("qwen3:4b");
  const [selectedModel, setSelectedModel] = useState("qwen3:4b");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const qc = useQueryClient();

  const catalog = useQuery({ queryKey: ["model-catalog"], queryFn: api.modelCatalog });
  const models = catalog.data?.models ?? [];
  const domains = catalog.data?.domains ?? {};

  const modelInfo = models.find((m) => m.id === selectedModel);
  const effectiveProvider = modelInfo?.provider ?? provider;
  const effectiveModel = modelInfo?.id ?? model;

  const chatMutation = useMutation({
    mutationFn: async (msgs: Message[]) => {
      const response = await api.chat({ messages: msgs, provider: effectiveProvider, model: effectiveModel });
      return response;
    },
    onSuccess: async (data) => {
      const assistantMsg: Message = { role: "assistant", content: data.content };
      setMessages((prev) => [...prev, assistantMsg]);

      // Save to conversation
      if (conversationId) {
        await api.conversations.addMessage(conversationId, assistantMsg).catch(() => {});
      }
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => {
      setMessages((prev) => [...prev, { role: "assistant", content: `Erreur: ${err.message}` }]);
    },
  });

  async function handleSend() {
    if (!input.trim() || chatMutation.isPending) return;

    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");

    // Create conversation on first message
    if (!conversationId) {
      try {
        const conv = await api.conversations.create({
          title: input.slice(0, 50),
          provider: effectiveProvider,
        });
        setConversationId(conv.id);
        await api.conversations.addMessage(conv.id, userMsg).catch(() => {});
      } catch {
        // Continue without persistence
      }
    } else {
      await api.conversations.addMessage(conversationId, userMsg).catch(() => {});
    }

    chatMutation.mutate(updated);
  }

  function handleNewChat() {
    setMessages([]);
    setConversationId(null);
    qc.invalidateQueries({ queryKey: ["conversations"] });
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            const m = models.find((x) => x.id === e.target.value);
            if (m) {
              setProvider(m.provider);
              setModel(m.id);
            }
          }}
          className="flex-1 rounded-lg border border-border-glass bg-surface-card px-3 py-1.5 text-xs text-text-primary"
        >
          {models.length === 0 ? (
            <option value="qwen3:4b">qwen3:4b (Tower)</option>
          ) : (
            Object.entries(domains).map(([key, label]) => {
              const domainModels = models.filter((m) => m.domain === key);
              if (domainModels.length === 0) return null;
              return (
                <optgroup key={key} label={label}>
                  {domainModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.size}) — {m.location}
                    </option>
                  ))}
                </optgroup>
              );
            })
          )}
        </select>
        {modelInfo && (
          <span
            className="text-[9px] text-text-dim truncate max-w-[200px]"
            title={modelInfo.description}
          >
            {modelInfo.description}
          </span>
        )}
        <button
          onClick={handleNewChat}
          className="ml-auto rounded-lg bg-surface-hover px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
        >
          Nouvelle conversation
        </button>
        {conversationId && (
          <span className="text-[9px] text-text-dim">#{conversationId}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-auto">
        {messages.map((m, i) => (
          <GlassCard key={i} className={m.role === "user" ? "ml-12" : "mr-12"}>
            <p className="mb-1 text-[9px] uppercase text-text-muted">
              {m.role === "user" ? "Vous" : `${effectiveProvider}/${effectiveModel}`}
            </p>
            <p className="whitespace-pre-wrap text-sm">{m.content}</p>
          </GlassCard>
        ))}
        {chatMutation.isPending && (
          <GlassCard className="mr-12">
            <p className="animate-pulse text-sm text-text-muted">Réflexion...</p>
          </GlassCard>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Votre message..."
          className="flex-1 rounded-lg border border-border-glass bg-surface-card px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={chatMutation.isPending}
          className="rounded-lg bg-accent-green/20 px-4 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-accent-green/30 disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
