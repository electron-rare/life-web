import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/ui/GlassCard";

type Message = { role: string; content: string };

export function ChatNew() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("ollama");
  const [model, setModel] = useState("qwen3:4b");

  const chatMutation = useMutation({
    mutationFn: (msgs: Message[]) => api.chat({ messages: msgs, provider, model }),
    onSuccess: (data) => setMessages((prev) => [...prev, { role: "assistant", content: data.content }]),
    onError: (err) => setMessages((prev) => [...prev, { role: "assistant", content: `Erreur: ${err.message}` }]),
  });

  function handleSend() {
    if (!input.trim() || chatMutation.isPending) return;
    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    chatMutation.mutate(updated);
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex gap-3">
        <select value={provider} onChange={(e) => setProvider(e.target.value)}
          className="rounded-lg border border-border-glass bg-surface-card px-3 py-1.5 text-xs text-text-primary">
          <option value="ollama">Ollama</option>
          <option value="claude">Claude</option>
          <option value="openai">OpenAI</option>
          <option value="mistral">Mistral</option>
        </select>
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="model name"
          className="rounded-lg border border-border-glass bg-surface-card px-3 py-1.5 text-xs text-text-primary" />
      </div>
      <div className="flex-1 space-y-3 overflow-auto">
        {messages.map((m, i) => (
          <GlassCard key={i} className={m.role === "user" ? "ml-12" : "mr-12"}>
            <p className="mb-1 text-[9px] uppercase text-text-muted">{m.role === "user" ? "Vous" : `${provider}/${model}`}</p>
            <p className="whitespace-pre-wrap text-sm">{m.content}</p>
          </GlassCard>
        ))}
        {chatMutation.isPending && (
          <GlassCard className="mr-12"><p className="animate-pulse text-sm text-text-muted">Réflexion...</p></GlassCard>
        )}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Votre message..."
          className="flex-1 rounded-lg border border-border-glass bg-surface-card px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green focus:outline-none" />
        <button onClick={handleSend} disabled={chatMutation.isPending}
          className="rounded-lg bg-accent-green/20 px-4 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-accent-green/30 disabled:opacity-50">
          Envoyer
        </button>
      </div>
    </div>
  );
}
