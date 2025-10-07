export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Get all favourite songs
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const favourites = await db.collection("favourites").find({}).toArray();

    // fetch full song details for each favourite
    const songIds = favourites.map(f => new ObjectId(f.songId));
    const songs = await db.collection("songs").find({ _id: { $in: songIds } }).toArray();

    // Convert image buffer for frontend
    songs.forEach(song => {
      if (song.image && song.image.buffer) {
        song.image = song.image.buffer.toString("base64");
      }
    });

    return NextResponse.json({ songs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add a favourite song
export async function POST(request) {
  try {
    const { songId } = await request.json();
    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Prevent duplicates
    const exists = await db.collection("favourites").findOne({ songId });
    if (exists) {
      return NextResponse.json({ message: "Already in favourites" }, { status: 200 });
    }

    await db.collection("favourites").insertOne({
      songId,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Song added to favourites" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
