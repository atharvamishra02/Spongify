"use client";
import React, { useEffect, useMemo, useState } from "react";
import PlaylistPlayer from "../components/PlaylistPlayer";

export default function LibraryPage() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p] = await Promise.all([
          fetch("/api/songs").then((r) => r.json()),
          fetch("/api/playlists").then((r) => r.json()),
        ]);
        setSongs(s.songs || []);
        setPlaylists(p.playlists || []);
      } catch (e) {
        setError("Failed to load data");
      }
    };
    load();
  }, []);

  const selectedSongs = useMemo(
    () => songs.filter((s) => selected[s._id]),
    [songs, selected]
  );

  const toggleSelect = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const createPlaylist = async () => {
    setError("");
    if (!name.trim()) {
      setError("Enter a playlist name");
      return;
    }
    const songIds = selectedSongs.map((s) => String(s._id));
    if (songIds.length === 0) {
      setError("Select at least one song");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), songIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setPlaylists((prev) => [...prev, data.playlist]);
      setName("");
      setSelected({});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const [activePlaylist, setActivePlaylist] = useState(null);
  const activePlaylistSongs = useMemo(() => {
    if (!activePlaylist) return [];
    const map = new Map(songs.map((s) => [String(s._id), s]));
    return (activePlaylist.songIds || [])
      .map((id) => map.get(String(id)))
      .filter(Boolean);
  }, [activePlaylist, songs]);

  return (
    <div className="flex flex-col gap-6 min-h-screen py-8 px-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Library</h1>

      <div className="bg-gray-900/60 rounded-xl p-4 border border-white/10">
        <h2 className="font-semibold mb-3">Create Playlist</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="block text-sm text-white/70 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-white/10"
              placeholder="My Playlist"
            />
          </div>
          <button
            onClick={createPlaylist}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Playlist"}
          </button>
        </div>
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {songs.map((s) => (
            <label key={s._id} className="flex items-center gap-2 p-2 rounded bg-gray-800/60 border border-white/10">
              <input
                type="checkbox"
                checked={!!selected[s._id]}
                onChange={() => toggleSelect(s._id)}
              />
              <span className="text-white/90 truncate">{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/60 rounded-xl p-4 border border-white/10">
        <h2 className="font-semibold mb-3">Playlists</h2>
        {playlists.length === 0 ? (
          <div className="text-white/60">No playlists yet.</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {playlists.map((p) => (
              <li key={p._id} className="flex items-center justify-between p-2 rounded bg-gray-800/60 border border-white/10">
                <div className="text-white/90 font-medium truncate">{p.name}</div>
                <button
                  onClick={() => setActivePlaylist(p)}
                  className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20"
                >
                  Play
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {activePlaylist && (
        <div className="bg-gray-900/60 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Playing: {activePlaylist.name}</h3>
            <button className="text-white/60 hover:text-white" onClick={() => setActivePlaylist(null)}>Close</button>
          </div>
          <PlaylistPlayer songs={activePlaylistSongs} />
        </div>
      )}
    </div>
  );
}

