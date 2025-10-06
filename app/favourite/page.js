"use client";

import { useEffect, useState } from "react";
import Player from "../components/Player";
import { FaHeartBroken } from "react-icons/fa";

export default function FavouritePage() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullScreenPlayer, setShowFullScreenPlayer] = useState(false);
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);

  // Fetch favourites from DB
  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await fetch("/api/favourites");
        const data = await res.json();
        setFavourites(data.songs || []); // your API returns { songs: [...] }
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  // Remove song from favourites in DB
  const removeFromFavourites = async (songId) => {
    try {
      await fetch(`/api/favourites/${songId}`, {
        method: "DELETE",
      });

      setFavourites((prev) => prev.filter((song) => song._id !== songId));
    } catch (err) {
      console.error("Failed to remove favourite:", err);
    }
  };

  const handleSongPlay = (song) => {
    setCurrentPlayingSong(song);
    setShowFullScreenPlayer(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-300">
        Loading favourites...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center">
          ❤️ Your Favourite Songs
        </h1>

        {favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FaHeartBroken className="text-6xl text-red-400 mb-4" />
            <p className="text-lg text-gray-400">
              You haven’t liked any songs yet. Go back and tap the ❤️ to save
              your favourites!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favourites.map((song) => {
              console.log("Song object:", song); // ✅ Log each song

              return (
                <div
                  key={song._id}
                  className="relative bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <img
                    src={
                      song.image
                        ? `data:image/*;base64,${song.image}`
                        : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                    }
                    alt={song.name}
                    className="w-full h-40 object-cover"
                  />

                  <div className="p-4 flex flex-col gap-3">
                    <h2 className="font-semibold text-lg truncate">
                      {song.name}
                    </h2>

                    <Player
                      songId={song.songId || song._id} // fallback
                      compact
                      src={`/api/songs/${song.songId || song._id}`} // fallback
                      title={song.name}
                      cover={
                        song.image
                          ? `data:image/*;base64,${song.image}`
                          : undefined
                      }
                      onPlay={() => handleSongPlay(song)}
                    />

                    <button
                      onClick={() => removeFromFavourites(song._id)}
                      className="mt-2 text-sm text-red-400 hover:text-red-500 transition-colors"
                    >
                      Remove from Favourites
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Full-screen player overlay */}
      {showFullScreenPlayer && currentPlayingSong && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowFullScreenPlayer(false)}
          />
          <div className="relative z-50 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-700 shadow-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-white text-lg font-semibold">Now Playing</h2>
                <button
                  onClick={() => setShowFullScreenPlayer(false)}
                  className="p-2 text-white hover:bg-white/10 rounded-full"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col items-center text-white">
                <div className="w-40 h-40 sm:w-48 sm:h-48 mb-4 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={
                      currentPlayingSong.image
                        ? `data:image/*;base64,${currentPlayingSong.image}`
                        : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                    }
                    alt="Album Art"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">{currentPlayingSong.name}</h3>
                  {currentPlayingSong.artist && (
                    <p className="text-gray-300">{currentPlayingSong.artist}</p>
                  )}
                </div>
                <div className="w-full">
                  <Player
                    key={currentPlayingSong._id || currentPlayingSong.songId}
                    src={`/api/songs/${currentPlayingSong._id || currentPlayingSong.songId}`}
                    title={currentPlayingSong.name}
                    cover={
                      currentPlayingSong.image
                        ? `data:image/*;base64,${currentPlayingSong.image}`
                        : undefined
                    }
                    songId={currentPlayingSong._id || currentPlayingSong.songId}
                    compact={false}
                    autoPlay={true}
                    className="bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
