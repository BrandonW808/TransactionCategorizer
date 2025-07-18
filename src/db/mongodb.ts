import { MongoClient, Db, Collection } from 'mongodb';
import { User, CategoryList } from '../types';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'transaction_categorizer';

    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db(dbName);
    console.log(`Connected to MongoDB database: ${dbName}`);
    
    // Create indexes
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes() {
  if (!db) return;

  try {
    // Create unique index on user email
    const usersCollection = db.collection<User>('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Create unique index on category list name
    const categoryListsCollection = db.collection<CategoryList>('categoryLists');
    await categoryListsCollection.createIndex({ name: 1 }, { unique: true });
    
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return db;
}

export function getUsersCollection(): Collection<User> {
  return getDb().collection<User>('users');
}

export function getCategoryListsCollection(): Collection<CategoryList> {
  return getDb().collection<CategoryList>('categoryLists');
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}
