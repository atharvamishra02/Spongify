export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const playlists = await db.collection("playlists").find({}).toArray();
    return NextResponse.json({ playlists });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, songIds } = await request.json();
    if (!name || !Array.isArray(songIds)) {
      return NextResponse.json({ error: "Missing name or songIds" }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const existing = await db.collection("playlists").findOne({ name });
    if (existing) {
      return NextResponse.json({ error: "A playlist with this name already exists." }, { status: 409 });
    }
    const doc = { name, songIds, createdAt: new Date() };
    const result = await db.collection("playlists").insertOne(doc);
    return NextResponse.json({ playlist: { ...doc, _id: result.insertedId } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


