import mongoose from "mongoose";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache = globalForMongoose.mongooseCache ?? {
  connection: null,
  promise: null,
};

globalForMongoose.mongooseCache = cache;

export async function connectMongo(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error("MONGODB_URI is required to connect to MongoDB.");
  }

  if (cache.connection) {
    return cache.connection;
  }

  cache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
  });

  cache.connection = await cache.promise;
  return cache.connection;
}
