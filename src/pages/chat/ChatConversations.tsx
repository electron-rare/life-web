import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "@finefab/ui";

export function ChatConversations() {
  const convs = useQuery({
    queryKey: ["conversations"],
    queryFn: api.conversations.list,
  });
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.conversations.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });

  const conversations = convs.data?.conversations ?? [];

  return (
    <div className="flex flex-col gap-3 p-4">
      {conversations.length === 0 && (
        <GlassCard>
          <p className="text-sm text-text-muted">Aucune conversation sauvegardée.</p>
        </GlassCard>
      )}
      {conversations.map((c) => (
        <GlassCard key={c.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{c.title}</p>
            <p className="text-xs text-text-muted">{c.provider} — {c.message_count} messages — {c.created_at}</p>
          </div>
          <button
            onClick={() => deleteMutation.mutate(c.id)}
            className="text-xs text-accent-red hover:text-accent-red/80"
          >
            Supprimer
          </button>
        </GlassCard>
      ))}
    </div>
  );
}
