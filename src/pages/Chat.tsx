import { useState } from "react";
import { sendChat } from "../api";

type Message = { role: string; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChat(updated);
      setMessages([...updated, { role: "assistant", content: response.content }]);
    } catch (err) {
      setMessages([...updated, { role: "assistant", content: `Erreur: ${err}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Chat</h1>
      <div style={{ maxHeight: "60vh", overflow: "auto", border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <strong>{m.role === "user" ? "Vous" : "IA"}:</strong> {m.content}
          </div>
        ))}
        {loading && <p><em>Reflexion...</em></p>}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Votre message..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSend} disabled={loading}>
          Envoyer
        </button>
      </div>
    </div>
  );
}
