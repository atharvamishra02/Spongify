import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();
    const playlist = await db.collection("playlists").findOne({ _id: new ObjectId(id) });
    if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ playlist });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, songIds } = body || {};
    const { db } = await connectToDatabase();
    const update = {};
    if (typeof name === 'string') update.name = name;
    if (Array.isArray(songIds)) update.songIds = songIds;
    const result = await db.collection("playlists").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result.value) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ playlist: result.value });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();
    const res = await db.collection("playlists").deleteOne({ _id: new ObjectId(id) });
    if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


