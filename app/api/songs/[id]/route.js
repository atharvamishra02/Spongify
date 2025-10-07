export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(request, context) {
  try {
    const params = await context.params; // ✅ await params
    const { id } = params;

    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);

    const result = await db.collection("songs").deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Song deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, context) {
  try {
    const params = await context.params; // ✅ await params
    const { id } = params;

    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);
    const song = await db.collection("songs").findOne({ _id: objectId });

    if (!song || !song.audio) {
      return new Response("Audio not found", { status: 404 });
    }

    return new Response(song.audio.buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": song.audio.buffer.length,
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error(`/api/songs/${context?.params?.id || "<id>"} GET failed:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
