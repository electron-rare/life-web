import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postChat } from "../api/lifeApi";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");

  const chatMutation = useMutation({
    mutationFn: postChat
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;

    chatMutation.mutate({
      message: message.trim(),
      model: model.trim() || undefined
    });
  };

  const answer =
    chatMutation.data?.text ||
    chatMutation.data?.response ||
    chatMutation.data?.content ||
    "";

  return (
    <section className="stack">
      <form onSubmit={handleSubmit} className="stack">
        <input
          className="input"
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder="Modèle (optionnel)"
        />
        <textarea
          className="textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Écris ton message"
        />
        <button className="button" type="submit" disabled={chatMutation.isPending}>
          {chatMutation.isPending ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      {chatMutation.isError && (
        <p className="muted">Échec de la requête chat. Vérifie l&apos;URL de l&apos;API.</p>
      )}

      {answer && (
        <article className="card">
          <h3>Réponse</h3>
          <p>{answer}</p>
        </article>
      )}
    </section>
  );
}
