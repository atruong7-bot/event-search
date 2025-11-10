import { getDatabase } from '../config/db.js';

const COLLECTION_NAME = 'favorites';

export class Favorite {
  static async getCollection() {
    const db = getDatabase();
    return db.collection(COLLECTION_NAME);
  }

  static async getAll() {
    try {
      const collection = await this.getCollection();
      const favorites = await collection.find({}).sort({ createdAt: 1 }).toArray();
      return favorites;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  static async add(eventData) {
    try {
      const collection = await this.getCollection();

      // Check if event already exists
      const existing = await collection.findOne({ eventId: eventData.eventId });
      if (existing) {
        return { alreadyExists: true, data: existing };
      }

      const favorite = {
        ...eventData,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(favorite);
      return { inserted: true, data: { ...favorite, _id: result.insertedId } };
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  static async remove(eventId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ eventId });
      return { deleted: result.deletedCount > 0, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  static async exists(eventId) {
    try {
      const collection = await this.getCollection();
      const favorite = await collection.findOne({ eventId });
      return favorite !== null;
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw error;
    }
  }
}
