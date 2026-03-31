import { GlassCard } from "../../components/ui/GlassCard";

export function ChatConversations() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <GlassCard>
        <p className="text-sm text-text-muted">
          Les conversations persistées apparaîtront ici une fois les endpoints backend implémentés.
        </p>
      </GlassCard>
    </div>
  );
}
