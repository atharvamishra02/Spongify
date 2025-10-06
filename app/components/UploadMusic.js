"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

// Clean UploadMusic component
// - showOnlyUpload=true: render upload form only
// - otherwise: render a gallery of big posters; clicking a poster triggers onPlay(song)
// - no local audio playback here (avoid double audio); full-screen player should handle audio
export default function UploadMusic({
  onSongsChange,
  readOnly = false,
  songs: propSongs,
  showOnlyUpload = false,
  onBackHome,
  onRemove,
  onPlay,
}) {
  const [songs, setSongs] = useState(() => (Array.isArray(propSongs) ? propSongs : []));
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [songName, setSongName] = useState("");
  const [artistName, setArtistName] = useState("");
  const fileInputRef = useRef(null); // audio file input

  useEffect(() => {
    // Keep local state in sync with parent-provided songs so the gallery updates
    // Guard: only run when parent actually provides the prop; avoid default [] identity churn.
    if (typeof propSongs === "undefined") return;
    // Avoid redundant state updates when reference is identical
    if (songs === propSongs) return;
    setSongs(Array.isArray(propSongs) ? propSongs : []);
  }, [propSongs, songs]);

  const imageSrc = (img) => {
    if (!img) return "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png";
    if (typeof img === "string" && img.startsWith("data:")) return img;
    return typeof img === "string" ? `data:image/*;base64,${img}` : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Music_Icon.png";
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Lightweight heuristic to categorize
  const isIndianSong = (name, artist) => {
    const keywords = [
      "hindi","bollywood","desi","bhojpuri","punjabi","haryanvi",
      "tamil","telugu","malayalam","kannada","bengali","gujarati","marathi","assamese","odia","urdu",
      "meri","tera","pyaar","ishq","dil","mohabbat","jaan","sanam","aashiq","bewafa","judaai","yaad","sapna","main","tu","tum"
    ];
    const txt = `${name || ""} ${artist || ""}`.toLowerCase();
    return keywords.some(k => txt.includes(k));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const audioFile = fileInputRef.current?.files?.[0];
    if (!songName || !artistName || !imageFile || !audioFile) {
      alert("Please fill all fields and select files.");
      return;
    }

    setIsUploading(true);
    try {
      const category = isIndianSong(songName, artistName) ? "local" : "global";
      const formData = new FormData();
      formData.append("name", songName);
      formData.append("artist", artistName);
      formData.append("audio", audioFile);
      formData.append("category", category);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/songs", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.song) throw new Error(data.error || "Upload failed");

      const newSong = {
        _id: data.song._id,
        name: data.song.name,
        artist: data.song.artist,
        category: data.song.category,
        image: data.song.image || null, // base64 (no prefix)
        url: data.song._id ? undefined : URL.createObjectURL(audioFile),
      };

      setSongs(prev => {
        const updated = [...prev, newSong];
        onSongsChange?.(updated);
        return updated;
      });

      // Reset form
      setSongName("");
      setArtistName("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Error uploading song");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index) => {
    onRemove?.(index);
  };

  // Upload form only
  if (showOnlyUpload) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-xs sm:max-w-md lg:max-w-2xl mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-orange-900 via-red-800 to-pink-900 rounded-2xl sm:rounded-3xl shadow-2xl items-center">
        <input
          type="text"
          placeholder="Song Name"
          className="mb-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          disabled={isUploading}
          required
        />
        <input
          type="text"
          placeholder="Artist Name"
          className="mb-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg w-full bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          disabled={isUploading}
          required
        />
        <label className={`block cursor-pointer py-2 sm:py-3 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg shadow-lg transition mb-4 sm:mb-6 ${isUploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 active:bg-green-700"} text-white`}>
          {isUploading ? "Uploading..." : "Upload Song"}
          <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} disabled={isUploading} required />
        </label>
        <label className="block cursor-pointer py-2 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg transition mb-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white">
          {imagePreview ? "Change Cover Image" : "Upload Cover Image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} required />
        </label>
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 object-cover rounded-xl mb-2 shadow-lg border-2 border-gray-700" />
        )}
        <button type="submit" className="w-full py-2 sm:py-3 px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg font-semibold text-sm sm:text-base mt-2 disabled:opacity-50">
          {isUploading ? "Uploading..." : "Submit"}
        </button>
        {onBackHome && (
          <button type="button" className="w-full py-2 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold text-sm sm:text-base mt-2" onClick={onBackHome}>
            Back to Home
          </button>
        )}
      </form>
    );
  }

  // Gallery of big posters; clicking opens main player via onPlay(song)
  return (
    <div className="w-full lg:max-w-none flex flex-col gap-3 sm:gap-5 lg:gap-6 p-3 sm:p-5 lg:p-6 xl:p-8 bg-gradient-to-br from-orange-900 via-red-800 to-pink-900 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl">
      <ul className="w-full min-h-[180px] sm:min-h-[240px] lg:min-h-[300px] grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 lg:gap-6">
        {songs.length === 0 ? (
          <li className="col-span-full py-8 sm:py-12 lg:py-16 text-center text-gray-300 text-sm sm:text-base lg:text-xl font-semibold">
            <div className="mb-4 text-4xl sm:text-5xl lg:text-6xl">🎵</div>
            <p>No songs uploaded yet.</p>
            <p className="text-xs sm:text-sm lg:text-base opacity-70 mt-2">Start building your music collection!</p>
          </li>
        ) : (
          songs.map((song, idx) => (
            <li key={song._id || song.url || idx} className="flex flex-col items-center bg-gray-800/80 hover:bg-gray-800/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg transition-all duration-200 w-full">
              {/* Remove button */}
              {readOnly && onRemove && (
                <button
                  onClick={() => handleRemove(idx)}
                  className="self-end mb-2 p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full"
                  title="Remove song"
                >
                  <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Big poster */}
              <div
                className="relative group w-full cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay?.(song);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay?.(song);
                }}
              >
                <img src={imageSrc(song.image)} alt={song.name || "Cover"} className="w-full max-h-60 object-cover rounded-lg sm:rounded-xl shadow-lg border border-gray-700" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded-lg sm:rounded-xl">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-3xl">▶️</span>
                  </div>
                </div>
              </div>

              {/* Title/Artist */}
              <div className="w-full mt-3 text-center">
                <span className="block truncate max-w-full text-sm sm:text-base lg:text-lg font-semibold text-white mb-1">{song.name}</span>
                {song.artist && <span className="block truncate max-w-full text-xs sm:text-sm text-gray-300">{song.artist}</span>}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
