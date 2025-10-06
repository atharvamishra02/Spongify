  "use client";
  import React, { useEffect, useState } from "react";

  export default function TopStreams({ compact, view }) {
    const [local, setLocal] = useState(0);
    const [global, setGlobal] = useState(0);

    useEffect(() => {
      const fetchSongs = async () => {
        try {
          const res = await fetch("/api/songs");
          const data = await res.json();

          if (!data.songs) return;

          let localCount = 0;
          let globalCount = 0;

          data.songs.forEach((song) => {
            // If category is explicitly set
            if (song.category === "global") {
              globalCount++;
            } else if (song.category === "local") {
              localCount++;
            }
            // OR check language for English songs
            else if (
              song.language?.toLowerCase() === "english" ||
              song.name?.match(/[a-zA-Z]/) // fallback check
            ) {
              globalCount++;
            } else {
              localCount++;
            }
          });

          setLocal(localCount);
          setGlobal(globalCount);
        } catch (error) {
          console.error("Failed to fetch songs for streams:", error);
        }
      };

      fetchSongs();
      const interval = setInterval(fetchSongs, 10000); // refresh every 10s
      return () => clearInterval(interval);
    }, []);

    if (compact) {
      return (
        <div className="flex gap-4 bg-blue-100 dark:bg-blue-800 rounded-lg px-3 py-2 shadow text-xs">
          {view === "local" ? (
            <div className="flex flex-col items-center">
              <span className="font-semibold text-blue-700 dark:text-blue-200">Local</span>
              <span className="font-bold">{local}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="font-semibold text-blue-700 dark:text-blue-200">Global</span>
              <span className="font-bold">{global}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full flex justify-center gap-8 py-4 bg-blue-50 dark:bg-blue-900 rounded-xl mb-6 shadow">
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-blue-700 dark:text-blue-200">
            Local Top Streams
          </span>
          <span className="text-2xl font-bold">{local}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold text-blue-700 dark:text-blue-200">
            Global Top Streams
          </span>
          <span className="text-2xl font-bold">{global}</span>
        </div>
      </div>
    );
  }
