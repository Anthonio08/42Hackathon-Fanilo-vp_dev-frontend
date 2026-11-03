"use client";

import Config from "@/core/config";
import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://10.11.5.3:8000";

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Collez un texte ou une rumeur, et je vous indique les signaux d'alerte à vérifier.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      console.log("res")

      const res = await fetch(`${Config.API_URL}/news/ask_grok/${text}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Obligatoire pour éviter une 422
        },
        body: JSON.stringify({
            // Remplacez 'message' par la clé exacte que votre backend attend
            prompt: text, 
        }),
        });
      console.log(res)
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      // La réponse peut être du texte brut ou du JSON : on gère les deux
      const raw = await res.text();
      let answer = raw;
      try {
        const data = JSON.parse(raw);
        answer =
          typeof data === "string"
            ? data
            : data.response ?? data.answer ?? data.message ?? data.result ?? JSON.stringify(data);
      } catch {
        // pas du JSON : on garde le texte tel quel
      }

      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Impossible de joindre le service. Réessayez." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-125 max-h-[70vh] w-full flex-col overflow-hidden rounded-2xl shadow-md border border-white bg-white">
      {/* En-tête */}
      <div className="flex items-center gap-3 bg-red-600 px-4 py-3 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold">
          F
        </div>
        <div>
          <p className="font-semibold leading-tight">Fanilo</p>
          <p className="text-xs text-red-100">Assistant de vérification</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-red-600 text-white"
                  : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-gray-400 shadow-sm">
              Le bot écrit...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="flex gap-2 border-t border-gray-200 light:bg-white p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Collez un texte à vérifier..."
          className="flex-1 rounded-full dark:text-black border border-gray-200 px-4 py-2 text-sm outline-none focus:border-red-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || loading}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}