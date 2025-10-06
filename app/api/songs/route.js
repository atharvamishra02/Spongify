import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    // Exclude large audio blob from list endpoint
    const docs = await db
      .collection("songs")
      .find({}, { projection: { name: 1, artist: 1, category: 1, image: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    const songs = docs.map((doc) => {
      let imageBase64 = null;
      if (doc.image) {
        try {
          // doc.image may be a Buffer or BSON Binary with a .buffer property
          const buf = Buffer.isBuffer(doc.image) ? doc.image : (doc.image.buffer ? doc.image.buffer : null);
          if (buf) imageBase64 = Buffer.from(buf).toString("base64");
        } catch {}
      }
      return {
        _id: String(doc._id),
        name: doc.name,
        artist: doc.artist || null,
        category: doc.category || null,
        image: imageBase64,
        createdAt: doc.createdAt,
      };
    });
    return NextResponse.json({ songs });
  } catch (error) {
    console.error("/api/songs GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
  const name = formData.get('name');
  const artist = formData.get('artist');
  const audioFile = formData.get('audio');
  const imageFile = formData.get('image');
    const category = formData.get('category') || null;
    const language = formData.get('language') || null;

    if (!name || !audioFile) {
      return NextResponse.json({ error: "Missing name or audio file" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const existing = await db.collection("songs").findOne({ name });
    if (existing) {
      return NextResponse.json({ error: "A song with this name already exists." }, { status: 409 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    let imageBuffer = null;
    if (imageFile) {
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    }

    const song = {
      name,
      artist: artist || null,
      audio: audioBuffer,
      image: imageBuffer,
      category,   // ✅ store category
      language,   // ✅ store language
      createdAt: new Date(),
    };

  const result = await db.collection("songs").insertOne(song);

    // Prepare minimal JSON-safe response, convert image to base64
    let imageBase64 = null;
    if (imageBuffer) {
      imageBase64 = Buffer.from(imageBuffer).toString("base64");
    }
    return NextResponse.json({
      song: {
        _id: String(result.insertedId),
        name,
        artist: artist || null,
        category,
        language,
        image: imageBase64,
        createdAt: song.createdAt,
      },
    });
  } catch (error) {
    console.error("/api/songs POST failed:", error);
    return NextResponse.json({ error: `Failed to upload song: ${error?.message || 'unknown error'}` }, { status: 500 });
  }
}
