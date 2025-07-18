import { ObjectId } from 'mongodb';
import { getUsersCollection } from '../db/mongodb';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    const collection = getUsersCollection();
    return await collection.find({}).toArray();
  }

  /**
   * Get a user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    const collection = getUsersCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Get a user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const collection = getUsersCollection();
    return await collection.findOne({ email });
  }

  /**
   * Create a new user
   */
  static async createUser(data: CreateUserRequest): Promise<User> {
    const collection = getUsersCollection();

    // Check if user with email already exists
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  }

  /**
   * Update a user
   */
  static async updateUser(id: string, data: UpdateUserRequest): Promise<User | null> {
    const collection = getUsersCollection();

    // Check if email is being updated and if it's already taken
    if (data.email) {
      const existingUser = await this.getUserByEmail(data.email);
      if (existingUser && existingUser._id!.toString() !== id) {
        throw new Error('User with this email already exists');
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<boolean> {
    const collection = getUsersCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  /**
   * Search users by name
   */
  static async searchUsers(query: string): Promise<User[]> {
    const collection = getUsersCollection();
    return await collection.find({
      name: { $regex: query, $options: 'i' }
    }).toArray();
  }
}
