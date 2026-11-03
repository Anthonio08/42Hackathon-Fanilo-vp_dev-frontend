"use client";
import { useState } from "react";
import ChatBot from "../chatbot/chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fenêtre de chat : toujours montée, juste cachée quand elle est fermée */}
      <div
        className={`fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm ${
          open ? "block" : "hidden"
        }`}
      >
        <ChatBot />
      </div>
        
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        className="fixed bottom-4 right-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-red-700"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}