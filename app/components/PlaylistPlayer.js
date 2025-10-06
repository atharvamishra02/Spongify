"use client";

import React, { useMemo, useState } from "react";
import Player from "./Player";

export default function PlaylistPlayer({ songs = [], startIndex = 0, compact = false, className = "" }) {
  const normalized = useMemo(
    () =>
      (songs || [])
        .filter(Boolean)
        .map((song) => ({
          id: song._id || song.id || song.name,
          title: song.name || song.title || "Untitled",
          cover: song.image
            ? (song.image.startsWith?.("data:") ? song.image : `data:image/*;base64,${song.image}`)
            : undefined,
          src: song.file ? song.url : (song._id ? `/api/songs/${song._id}` : song.url),
        })),
    [songs]
  );

  const [currentIndex, setCurrentIndex] = useState(Math.min(Math.max(0, startIndex), Math.max(0, normalized.length - 1)));

  const hasNext = currentIndex < normalized.length - 1;
  const hasPrev = currentIndex > 0;

  const goNext = () => setCurrentIndex((i) => (i < normalized.length - 1 ? i + 1 : i));
  const goPrev = () => setCurrentIndex((i) => (i > 0 ? i - 1 : i));

  if (normalized.length === 0) return null;

  const active = normalized[currentIndex];

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm text-white/80">
          {currentIndex + 1} / {normalized.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className={`px-2 py-1 rounded bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className={`px-2 py-1 rounded bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Next
          </button>
        </div>
      </div>

      <Player
        key={active.id}
        src={active.src}
        title={active.title}
        cover={active.cover}
        autoPlay
        compact={compact}
        onEnded={goNext}
      />
    </div>
  );
}


