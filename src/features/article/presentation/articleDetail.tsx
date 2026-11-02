"use client";

import Image from "next/image";
import { useState } from "react";

const article = {
  category: "Sécurité",
  title: "Incendie à Lyon : la circulation perturbée dans le centre-ville",
  date: "30 octobre 2026 · 10h26",
  image: "/images/incendie.jpg",
  paragraphs: [
    "Un important incendie s'est déclaré ce matin dans le 2e arrondissement de Lyon. Les autorités appellent à éviter le secteur et à suivre les consignes de sécurité.",
    "Les pompiers sont toujours mobilisés sur place pour maîtriser le feu.",
  ],
};

const similar = [
  { id: 1, title: "Inondations : vigilance renforcée", date: "29 oct. 2026", image: "/images/inondation.jpg" },
  { id: 2, title: "Grève des transports", date: "28 oct. 2026", image: "/images/greve.jpg" },
  { id: 3, title: "Météo : alerte cyclonique", date: "28 oct. 2026", image: "/images/cyclone.jpg" },
];

const initialComments = [
  { id: 1, author: "Rado T.", time: "Il y a 2 heures", text: "Merci pour ces informations !", likes: 12 },
];

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </svg>
);

const ChatIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
  </svg>
);

const ThumbIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M7 11v9H4v-9h3zm0 0 4-8c1.5 0 2.5 1 2.5 2.5V9h5.2a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 17.5 19H7" />
  </svg>
);

export default function ArticleDetail() {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const publish = () => {
    if (!newComment.trim()) return;
    setComments([
      { id: Date.now(), author: "Vous", time: "À l'instant", text: newComment, likes: 0 },
      ...comments,
    ]);
    setNewComment("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-4 text-xs text-gray-500">
        Accueil <span className="mx-1">›</span> Actualités <span className="mx-1">›</span>{" "}
        <span className="text-gray-700">Détail</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <article>
          <div className="relative overflow-hidden rounded-xl bg-gray-200">
            <Image
              src={article.image}
              alt={article.title}
              width={1200}
              height={700}
              className="h-72 w-full object-cover sm:h-96"
            />
            <span className="absolute bottom-3 left-3 rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white">
              {article.category}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            {article.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CalendarIcon /> {article.date}
              </span>
              <span className="flex items-center gap-1">
                <ChatIcon /> {comments.length} commentaires
              </span>
            </div>
            <div className="flex gap-2">
              {["f", "X", "in"].map((s) => (
                <button
                  key={s}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
            {article.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Commentaires ({comments.length})</h2>
              <label className="text-xs text-gray-500">
                Trier par :{" "}
                <select className="bg-transparent font-medium text-red-600 outline-none">
                  <option>Plus récents</option>
                  <option>Plus aimés</option>
                </select>
              </label>
            </div>

            <ul className="mt-4 space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3 rounded-lg border border-gray-100 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-300 font-bold text-white">
                    {c.author[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">{c.author}</span>{" "}
                      <span className="text-xs text-gray-400">{c.time}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-700">{c.text}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <button className="flex items-center gap-1 hover:text-red-600">
                        <ThumbIcon /> {c.likes}
                      </button>
                      <button className="hover:text-red-600">Répondre</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-300 font-bold text-white">
                V
              </div>
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold text-gray-900">Ajouter un commentaire</p>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Votre commentaire..."
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-red-400"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={publish}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Publier le commentaire
                  </button>
                </div>
              </div>
            </div>
          </section>
        </article>

        <aside>
          <h2 className="mb-3 text-base font-bold text-gray-900">Articles similaires</h2>
          <ul className="space-y-3">
            {similar.map((a) => (
              <li
                key={a.id}
                className="flex cursor-pointer gap-3 rounded-lg border border-gray-100 p-2 hover:bg-gray-50"
              >
                <Image
                  src={a.image}
                  alt={a.title}
                  width={160}
                  height={120}
                  className="h-16 w-20 shrink-0 rounded-md bg-gray-200 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold leading-snug text-gray-900">{a.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{a.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
