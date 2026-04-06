import { useState, useCallback } from "react";
import { getAccessToken } from "../lib/auth";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useChatStream(apiBase: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);

  const send = useCallback(
    async (text: string, model: string, useRag: boolean) => {
      const userMsg: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
      setStreaming(true);

      try {
        const token = await getAccessToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/chat/stream`, {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify({
            messages: [...messages, userMsg],
            model,
            use_rag: useRag,
          }),
        });

        if (!res.body) {
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") {
              setStreaming(false);
              return;
            }
            try {
              const { delta } = JSON.parse(payload) as { delta?: string };
              if (delta) {
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    ...copy[copy.length - 1],
                    content: copy[copy.length - 1].content + delta,
                  };
                  return copy;
                });
              }
            } catch {
              // skip malformed
            }
          }
        }
      } finally {
        setStreaming(false);
      }
    },
    [messages, apiBase],
  );

  return { messages, setMessages, streaming, send };
}
