"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { FaHeart, FaRegHeart } from "react-icons/fa6"; // ❤️ / 🤍

let globalAudioRef = null;
let globalSetIsPlaying = null;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function Player({
  src,
  title,
  cover,
  songId,
  autoPlay = false,
  compact = false,
  className = "",
  onEnded,
  onPlay,
}) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);

  // ❤️ Heart (like) state
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onEndedInternal = () => {
      setIsPlaying(false);
      if (typeof onEnded === "function") onEnded();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEndedInternal);

    if (audio.readyState >= 1) setDuration(audio.duration || 0);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEndedInternal);
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false);
    setCurrentTime(0);
    if (autoPlay) {
      // Pause any previously playing global audio before autoplaying this one
      if (globalAudioRef && globalAudioRef !== audio) {
        try {
          globalAudioRef.pause();
        } catch {}
        if (globalSetIsPlaying) globalSetIsPlaying(false);
      }
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          globalAudioRef = audio;
          globalSetIsPlaying = setIsPlaying;
          if (onPlay) onPlay();
        })
        .catch(() => setIsPlaying(false));
    }
  }, [src, autoPlay]);

  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (globalAudioRef && globalAudioRef !== audio) {
        globalAudioRef.pause();
        if (globalSetIsPlaying) globalSetIsPlaying(false);
      }
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          globalAudioRef = audio;
          globalSetIsPlaying = setIsPlaying;
          if (onPlay) onPlay();
        })
        .catch(() => setIsPlaying(false));
    }
  };

  // ✅ handle like/unlike
const toggleLike = async () => {
  try {
    if (!src) return;

    if (liked) {
      // Remove from favourites
      await fetch(`/api/favourites/${songId}`, { method: "DELETE" });
      setLiked(false);
    } else {
      // Add to favourites
      await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId,   // you must pass this from props!
          name: title,
          image: cover,
        }),
      });
      setLiked(true);
    }
  } catch (err) {
    console.error("Failed to update favourites:", err);
  }
};

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const value = Number(e.target.value);
    const nextTime = (value / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (e) => {
    const value = Number(e.target.value) / 100;
    setVolume(value);
    if (value > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted((v) => !v);

  const containerClasses = [
    "relative", // 👈 for absolute positioning of heart
    "w-full",
    compact ? "py-4 px-2" : "py-2 px-3",
    "bg-black/30",
    "backdrop-blur",
    "rounded-lg",
    "border border-white/15",
    "overflow-hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {!compact && <audio ref={audioRef} src={src} preload="metadata" className="hidden" />}

      {/* ❤️ Heart icon top-right - only show in non-compact mode */}
      {!compact && (
        <button
          onClick={toggleLike}
          className="absolute top-2 right-2 text-white hover:scale-110 transition-transform"
        >
          {liked ? (
            <FaHeart className="w-5 h-5 text-red-500" />
          ) : (
            <FaRegHeart className="w-5 h-5 text-gray-300" />
          )}
        </button>
      )}

      {/* --- Your existing Player UI --- */}
      <div className={`flex flex-col ${compact ? "gap-1" : "gap-2"} w-full`}>
        {/* Main row */}
        <div className={`flex items-center ${compact ? "gap-2" : "gap-3"} w-full`}>
          {!compact && (
            <div className="flex flex-col items-center w-12 flex-shrink-0">
              <div className="w-10 h-10 rounded-md overflow-hidden border border-white/20">
                <img
                  src={
                    cover ||
                    "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                  }
                  alt={title || "Cover"}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={togglePlay}
                className={`mt-1 flex items-center justify-center rounded-full text-white bg-white/15 hover:bg-white/25 transition-colors ${
                  compact ? "w-7 h-7" : "w-9 h-9"
                }`}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <FaPause className={compact ? "w-4 h-4" : "w-5 h-5"} />
                ) : (
                  <FaPlay className={compact ? "w-4 h-4" : "w-5 h-5"} />
                )}
              </button>
            </div>
          )}

          {/* Center section */}
          <div className="flex-1 min-w-0">
            {compact ? (
              <div 
                className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onPlay) onPlay();
                }}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                  <img
                    src={
                      cover ||
                      "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                    }
                    alt={title || "Cover"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-8 flex justify-end">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-white/80 hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <FaVolumeMute className="w-5 h-5" />
                    ) : (
                      <FaVolumeUp className="w-5 h-5" />
                    )}
                  </button>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((isMuted ? 0 : volume) * 100)}
                  onChange={handleVolume}
                  className="flex-1 min-w-[80px] h-1.5 cursor-pointer appearance-none bg-white/20 rounded-full accent-white/90"
                />
                <span className="w-8" />
              </div>
            )}
          </div>


        </div>

        {/* Second row (progress bar for non-compact) */}
        {!compact && (
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 invisible flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/70 w-8 text-right tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <input
                  ref={progressRef}
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={handleSeek}
                  className="flex-1 min-w-[80px] h-1.5 cursor-pointer appearance-none bg-white/20 rounded-full accent-white/90"
                />
                <span className="text-[10px] text-white/70 w-8 tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
