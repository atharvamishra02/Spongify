import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all songs
    const allSongs = await db.collection("songs").find({}).toArray();
    
    // Group songs by name to find duplicates
    const songGroups = {};
    allSongs.forEach(song => {
      if (!songGroups[song.name]) {
        songGroups[song.name] = [];
      }
      songGroups[song.name].push(song);
    });
    
    // Find duplicates (songs with same name)
    const duplicates = [];
    Object.keys(songGroups).forEach(songName => {
      if (songGroups[songName].length > 1) {
        // Keep the first one, mark the rest as duplicates
        duplicates.push(...songGroups[songName].slice(1));
      }
    });
    
    // Remove duplicates
    let deletedCount = 0;
    for (const duplicate of duplicates) {
      const result = await db.collection("songs").deleteOne({ _id: duplicate._id });
      if (result.deletedCount > 0) {
        deletedCount++;
      }
    }
    
    return NextResponse.json({ 
      message: `Cleanup completed. Removed ${deletedCount} duplicate songs.`,
      duplicatesRemoved: deletedCount,
      totalSongsBefore: allSongs.length,
      totalSongsAfter: allSongs.length - deletedCount
    });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 