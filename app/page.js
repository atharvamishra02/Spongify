"use client";
import { useEffect, useState } from "react";
import UploadMusic from "./components/UploadMusic";
import Player from "./components/Player";

const isIndianSong = (name, artist) => {
  const keywords = [
    // Hindi/Bollywood keywords
    "hindi", "bollywood", "desi", "bhojpuri", "haryanvi",
    // Regional languages
    "punjabi", "tamil", "telugu", "malayalam", "kannada", "bengali", 
    "gujarati", "marathi", "assamese", "odia", "urdu",
    // Common Hindi/Indian words
    "meri", "tera", "tere", "mere", "pyaar", "pyar", "ishq", "dil", "mohabbat", 
    "jaan", "sanam", "aashiq", "bewafa", "judaai", "milna", "bichhna", 
    "yaad", "sapna", "khushi", "gham", "zindagi", "jindagi", "main", "tu", "tum",
    "hum", "wo", "woh", "ye", "yeh", "hai", "hoon", "ho", "ka", "ki", "ke", "se", "me",
    // Popular Indian artists and composers
    "rahman", "shankar", "ehsaan", "loy", "vishal", "shekhar", "pritam", "anirudh",
    "ilaiyaraaja", "harris", "jayaram", "devi", "prasad", "kumar", "sanu", 
    "mangeshkar", "lata", "asha", "bhosle", "rafi", "kishore", "mukesh", "udit", "alka",
    // Indian film industries
    "tollywood", "kollywood", "mollywood", "sandalwood",
    // Common Indian song patterns
    "aaj", "kal", "raat", "din", "subah", "shaam", "chand", "sitare", "sapne"
  ];
  const text = `${name} ${artist || ""}`.toLowerCase();
  const isIndian = keywords.some(keyword => text.includes(keyword));
  
  // Debug logging to see what is happening
  console.log(`Song: "${name}" by "${artist}" - Text: "${text}" - Is Indian: ${isIndian}`);
  
  return isIndian;
};

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [category, setCategory] = useState("local");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showFullScreenPlayer, setShowFullScreenPlayer] = useState(false);
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const fetchSongs = async () => {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (showMobileSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileSidebar]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowMobileSidebar(false);
        setShowFullScreenPlayer(false);
      }
    };
    if (showMobileSidebar || showFullScreenPlayer) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showMobileSidebar, showFullScreenPlayer]);

  // Track viewport size to render only one overlay Player at a time
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLargeScreen(mql.matches);
    update();
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  const handleRemoveSong = async (index) => {
    try {
      const songToRemove = songs[index];
      if (!songToRemove._id) return;
      const response = await fetch(`/api/songs/${songToRemove._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSongs(songs.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error("Failed to remove song:", error);
    }
  };

  const handleSongPlay = (song) => {
    setCurrentPlayingSong(song);
    setShowFullScreenPlayer(true);
  };

  const handleCloseFullScreenPlayer = () => {
    setShowFullScreenPlayer(false);
    setCurrentPlayingSong(null);
  };

  const localSongs = songs.filter((song) => {
    if (song.category) {
      console.log(`Song "${song.name}" has explicit category: ${song.category}`);
      return song.category === "local";
    }
    const isLocal = isIndianSong(song.name, song.artist);
    console.log(`Song "${song.name}" auto-detected as: ${isLocal ? "Local" : "Global"}`);
    return isLocal;
  });
  
  const globalSongs = songs.filter((song) => {
    if (song.category) return song.category === "global";
    return !isIndianSong(song.name, song.artist);
  });
  
  // Debug: Log categorization results
  console.log(`Total songs: ${songs.length}, Local: ${localSongs.length}, Global: ${globalSongs.length}`);
  
  const categorySongs = category === "local" ? localSongs : globalSongs;

  return (
    <div className="min-h-screen bg-black text-white px-2 sm:px-4 lg:px-6 py-6 sm:py-10 relative">
      {/* Mobile Hamburger Button */}
      <button
        className="fixed top-4 right-4 lg:hidden z-[60] bg-red-500 hover:bg-red-600 active:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 touch-manipulation"
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        aria-label="Toggle music sidebar"
      >
        <div className="w-5 h-5 flex flex-col justify-center items-center">
          <div className={`w-4 h-0.5 bg-white transition-all duration-300 ${showMobileSidebar ? "rotate-45 translate-y-1" : "mb-1"}`}></div>
          <div className={`w-4 h-0.5 bg-white transition-all duration-300 ${showMobileSidebar ? "opacity-0" : "mb-1"}`}></div>
          <div className={`w-4 h-0.5 bg-white transition-all duration-300 ${showMobileSidebar ? "-rotate-45 -translate-y-1" : ""}`}></div>
        </div>
      </button>

  {/* Main Content Area - Mobile Responsive */}
  <div className="flex flex-col items-start w-full lg:pr-[340px]">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
          Your Gallery!
        </h2>
        
        <div className="w-full">
          <UploadMusic songs={songs} readOnly onRemove={handleRemoveSong} onPlay={handleSongPlay} />
        </div>
      </div>

      {/* Desktop Floating Sidebar */}
      <div className="fixed top-4 right-4 w-[320px]  backdrop-blur-sm text-white rounded-2xl shadow-2xl p-4 border border-gray-700 z-50 max-h-[calc(100vh-2rem)] overflow-hidden hidden lg:block">
        <div className="flex gap-2 mb-4 justify-center">
          <button
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              category === "local"
                ? "bg-red-500 text-white shadow-lg transform scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setCategory("local")}
          > 
            Local ({localSongs.length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              category === "global"
                ? "bg-red-500 text-white shadow-lg transform scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setCategory("global")}
          >
            Global ({globalSongs.length})
          </button>
        </div>

        <div className="w-full max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          {categorySongs.length === 0 ? (
            <div className="text-gray-400 text-center py-8 text-sm">
              <div className="mb-2"></div>
              <p>No {category} songs yet.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {categorySongs.map((song, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3  hover:bg-gray-800 text-white rounded-xl p-3 shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleSongPlay(song)}
                >
                  <img
                    src={
                      song.image
                        ? `data:image/*;base64,${song.image}`
                        : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                    }
                    alt="Cover"
                    className="w-10 h-10 object-cover rounded-lg border border-gray-600 shadow-sm"
                  />
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="block truncate text-sm font-medium text-white">
                      {song.name}
                    </span>
                    {song.artist && (
                      <span className="block truncate text-xs text-gray-400">
                        {song.artist}
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-32">
                    <Player
                      compact
                      src={song._id ? `/api/songs/${song._id}` : song.url}
                      title={song.name}
                      cover={song.image ? `data:image/*;base64,${song.image}` : undefined}
                      songId={song._id}
                      onPlay={() => handleSongPlay(song)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ${
          showMobileSidebar ? "opacity-100 visible" : "opacity-0 invisible"
        }`} 
        onClick={() => setShowMobileSidebar(false)}
      >
        <div 
          className={`fixed top-2 right-2 bottom-2 w-[85%] max-w-[320px] bg-gray-900/98 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-gray-600 overflow-hidden transition-all duration-300 transform ${
            showMobileSidebar ? "translate-x-0 scale-100" : "translate-x-full scale-95"
          }`} 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Sidebar Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Music Library</h3>
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors touch-manipulation"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Sidebar Content */}
          <div className="p-4">
            <div className="flex gap-2 mb-4 justify-center">
              <button
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 touch-manipulation ${
                  category === "local"
                    ? "bg-red-500 text-white shadow-lg transform scale-105"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600"
                }`}
                onClick={() => setCategory("local")}
              > 
                Local ({localSongs.length})
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 touch-manipulation ${
                  category === "global"
                    ? "bg-red-500 text-white shadow-lg transform scale-105"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-600"
                }`}
                onClick={() => setCategory("global")}
              >
                Global ({globalSongs.length})
              </button>
            </div>

            <div className="w-full max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
              {categorySongs.length === 0 ? (
                <div className="text-gray-400 text-center py-12 text-sm">
                  <div className="mb-3 text-3xl"></div>
                  <p className="text-base">No {category} songs yet.</p>
                  <p className="text-xs mt-2 opacity-70">Upload some music to get started!</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {categorySongs.map((song, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 bg-gray-800/70 hover:bg-gray-700/80 active:bg-gray-700 text-white rounded-xl p-3 shadow-lg transition-all duration-200 touch-manipulation cursor-pointer"
                      onClick={() => handleSongPlay(song)}
                    >
                      <img
                        src={
                          song.image
                            ? `data:image/*;base64,${song.image}`
                            : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                        }
                        alt="Cover"
                        className="w-10 h-10 object-cover rounded-lg border border-gray-600 shadow-sm"
                      />
                      <div className="flex-1 min-w-0 mr-3">
                        <span className="block truncate text-sm font-medium text-white">
                          {song.name}
                        </span>
                        {song.artist && (
                          <span className="block truncate text-xs text-gray-400">
                            {song.artist}
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-32">
                        <Player
                          compact
                          src={song._id ? `/api/songs/${song._id}` : song.url}
                          title={song.name}
                          cover={song.image ? `data:image/*;base64,${song.image}` : undefined}
                          songId={song._id}
                          onPlay={() => handleSongPlay(song)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Player Overlay */}
      {showFullScreenPlayer && currentPlayingSong && (
        <>
          {/* Mobile: Full Screen Overlay */}
          {!isLargeScreen && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-y-auto">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-gray-900 to-transparent">
              <button
                onClick={handleCloseFullScreenPlayer}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-white text-lg font-semibold">Now Playing</h2>
              <div className="w-10 h-10" />
            </div>

            {/* Main Player Section */}
            <div className="flex flex-col items-center justify-center p-6 text-white">
              {/* Album Art */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 mb-6 rounded-2xl overflow-hidden shadow-2xl">
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

              {/* Song Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {currentPlayingSong.name}
                </h1>
                {currentPlayingSong.artist && (
                  <p className="text-lg text-gray-300">
                    {currentPlayingSong.artist}
                  </p>
                )}
              </div>

              {/* Mobile Player Controls (mirrors desktop controls) */}
              <div className="w-full max-w-md">
                <Player
                  key={currentPlayingSong._id || currentPlayingSong.url}
                  src={
                    currentPlayingSong._id
                      ? `/api/songs/${currentPlayingSong._id}`
                      : currentPlayingSong.url
                  }
                  title={currentPlayingSong.name}
                  cover={
                    currentPlayingSong.image
                      ? `data:image/*;base64,${currentPlayingSong.image}`
                      : undefined
                  }
                  songId={currentPlayingSong._id}
                  compact={false}
                  className="bg-transparent"
                  autoPlay={true}
                />
              </div>
            </div>

            {/* All Songs List */}
            <div className="p-4 bg-gray-900/50">
              <h3 className="text-white text-lg font-semibold mb-4">All Songs</h3>
              <div className="grid grid-cols-1 gap-3">
                {songs.map((song, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      currentPlayingSong._id === song._id
                        ? "bg-red-500/20 border border-red-500/50"
                        : "bg-gray-800/70 hover:bg-gray-700/80"
                    }`}
                    onClick={() => handleSongPlay(song)}
                  >
                    <img
                      src={
                        song.image
                          ? `data:image/*;base64,${song.image}`
                          : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                      }
                      alt="Cover"
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{song.name}</p>
                      {song.artist && (
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentPlayingSong._id === song._id ? "Playing" : "Tap to play"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Desktop: Content Area Player */}
          {isLargeScreen && (
          <div className="block">
            {/* Backdrop for desktop */}
            <div className="fixed inset-0 bg-black/50 z-[90]" onClick={handleCloseFullScreenPlayer} />
            
            {/* Desktop Player Container */}
            <div className="fixed top-0 left-0 right-0 bottom-0 lg:left-64 lg:right-[340px] bg-gradient-to-br from-gray-900 via-black to-gray-900 z-[95] flex flex-col">
              {/* Close button for desktop */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-b from-gray-800 to-transparent">
                <h2 className="text-white text-xl font-semibold">Now Playing</h2>
                <button
                  onClick={handleCloseFullScreenPlayer}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Desktop Player Content */}
              <div className="flex-1 flex flex-col items-center justify-start p-6 text-white overflow-y-auto">
                {/* Big Album Art */}
                <div className="w-40 h-40 lg:w-56 lg:h-40 mb-6 rounded-2xl overflow-hidden shadow-2xl">
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

                {/* Player Controls */}
                <div className="w-full max-w-2xl mb-6">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold mb-1">
                      {currentPlayingSong.name}
                    </h1>
                    {currentPlayingSong.artist && (
                      <p className="text-gray-300 mb-4">
                        {currentPlayingSong.artist}
                      </p>
                    )}
                  </div>
                  
                  {/* Player Controls */}
                  <Player
                    key={currentPlayingSong._id || currentPlayingSong.url}
                    src={currentPlayingSong._id ? `/api/songs/${currentPlayingSong._id}` : currentPlayingSong.url}
                    title={currentPlayingSong.name}
                    cover={currentPlayingSong.image ? `data:image/*;base64,${currentPlayingSong.image}` : undefined}
                    songId={currentPlayingSong._id}
                    compact={false}
                    className="bg-transparent"
                    autoPlay={true}
                  />
                </div>

                {/* All Songs Grid */}
                <div className="w-full max-w-6xl">
                  <h3 className="text-white text-lg font-semibold mb-4">All Songs</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {songs.map((song, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          currentPlayingSong._id === song._id
                            ? "bg-red-500/20 border border-red-500/50"
                            : "bg-gray-800/70 hover:bg-gray-700/80"
                        }`}
                        onClick={() => handleSongPlay(song)}
                      >
                        <img
                          src={
                            song.image
                              ? `data:image/*;base64,${song.image}`
                              : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png"
                          }
                          alt="Cover"
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{song.name}</p>
                          {song.artist && (
                            <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentPlayingSong._id === song._id ? "♪ Playing" : "Click to play"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}
