import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";

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
  return keywords.some(keyword => text.includes(keyword));
};

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    
    // Find all songs without a category field
    const songsWithoutCategory = await db.collection("songs").find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: "" }
      ]
    }).toArray();

    console.log(`Found ${songsWithoutCategory.length} songs without category`);

    let updatedCount = 0;
    
    // Update each song with the appropriate category
    for (const song of songsWithoutCategory) {
      const category = isIndianSong(song.name, song.artist || "") ? "local" : "global";
      
      await db.collection("songs").updateOne(
        { _id: song._id },
        { 
          $set: { 
            category: category,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log(`Updated "${song.name}" to category: ${category}`);
      updatedCount++;
    }

    return NextResponse.json({ 
      message: `Successfully updated ${updatedCount} songs with categories`,
      updatedCount,
      totalChecked: songsWithoutCategory.length
    });
  } catch (error) {
    console.error("Error updating categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}