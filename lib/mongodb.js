import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local or Vercel env (MONGODB_URI)");
}

// Build options dynamically; allow optional insecure TLS via env for self-hosted Mongo
const options = (() => {
  const base = {};
  if (process.env.MONGODB_TLS_INSECURE === 'true') {
    base.tls = true;
    base.tlsAllowInvalidCertificates = true;
    base.tlsAllowInvalidHostnames = true;
  }
  return base;
})();

let client;
let clientPromise;

// Use a global cached connection in all environments (works for serverless cold starts)
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB; // optional
  const db = dbName ? client.db(dbName) : client.db();
  return { client, db };
}