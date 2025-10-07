export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";

// POST /api/favourites
export async function POST(request) {
  try {
    const { songId, name, image } = await request.json();

    if (!songId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if already exists to prevent duplicates
    const existing = await db.collection("favourites").findOne({ songId });
    if (existing) {
      return NextResponse.json({ message: "Already in favourites" }, { status: 200 });
    }

    await db.collection("favourites").insertOne({
      songId,
      name,
      image: image || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Added to favourites" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
