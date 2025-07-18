import { ObjectId } from 'mongodb';
import { getCategoryListsCollection } from '../db/mongodb';
import { CategoryList, CreateCategoryListRequest, UpdateCategoryListRequest, Categories } from '../types';

export class CategoryListService {
  /**
   * Get all category lists
   */
  static async getAllCategoryLists(): Promise<CategoryList[]> {
    const collection = getCategoryListsCollection();
    return await collection.find({}).toArray();
  }

  /**
   * Get a category list by ID
   */
  static async getCategoryListById(id: string): Promise<CategoryList | null> {
    const collection = getCategoryListsCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  /**
   * Get a category list by name
   */
  static async getCategoryListByName(name: string): Promise<CategoryList | null> {
    const collection = getCategoryListsCollection();
    return await collection.findOne({ name });
  }

  /**
   * Get the default category list
   */
  static async getDefaultCategoryList(): Promise<CategoryList | null> {
    const collection = getCategoryListsCollection();
    return await collection.findOne({ isDefault: true });
  }

  /**
   * Create a new category list
   */
  static async createCategoryList(data: CreateCategoryListRequest): Promise<CategoryList> {
    const collection = getCategoryListsCollection();

    // Check if category list with name already exists
    const existingList = await this.getCategoryListByName(data.name);
    if (existingList) {
      throw new Error('Category list with this name already exists');
    }

    // If this is set as default, unset any existing default
    if (data.isDefault) {
      await collection.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const newCategoryList: CategoryList = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newCategoryList);
    return { ...newCategoryList, _id: result.insertedId };
  }

  /**
   * Update a category list
   */
  static async updateCategoryList(id: string, data: UpdateCategoryListRequest): Promise<CategoryList | null> {
    const collection = getCategoryListsCollection();

    // Check if name is being updated and if it's already taken
    if (data.name) {
      const existingList = await this.getCategoryListByName(data.name);
      if (existingList && existingList._id!.toString() !== id) {
        throw new Error('Category list with this name already exists');
      }
    }

    // If this is set as default, unset any existing default
    if (data.isDefault) {
      await collection.updateMany(
        { isDefault: true, _id: { $ne: new ObjectId(id) } },
        { $set: { isDefault: false } }
      );
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
   * Delete a category list
   */
  static async deleteCategoryList(id: string): Promise<boolean> {
    const collection = getCategoryListsCollection();

    // Don't allow deletion of default category list
    const categoryList = await this.getCategoryListById(id);
    if (categoryList?.isDefault) {
      throw new Error('Cannot delete the default category list');
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  /**
   * Search category lists by name
   */
  static async searchCategoryLists(query: string): Promise<CategoryList[]> {
    const collection = getCategoryListsCollection();
    return await collection.find({
      name: { $regex: query, $options: 'i' }
    }).toArray();
  }

  /**
   * Initialize default categories if none exist
   */
  static async initializeDefaultCategories(): Promise<void> {
    const defaultList = await this.getDefaultCategoryList();
    if (!defaultList) {
      const defaultCategories: Categories = {
        Income: {
          Kinect: ["dataannotation", "kinect"],
          Other: ["e-transfer", "deposit", "income"]
        },
        Expenses: {
          "Living Expenses": ["rent", "hydro", "utility", "insurance", "bill", "property tax"],
          "Groceries": ["walmart", "superstore", "loblaws", "costco", "iga", "super c", "the village store", "freshmarket", "athens fresh market"],
          "Pets": ["vet", "petco", "petland"],
          "Subscriptions": ["spotify", "netflix", "crave", "subscription", "prime", "virgin plus", "disney", "github"],
          "Phone Bill": ["rogers", "bell", "fido", "koodo", "phone"],
          "Alcohol": ["liquor", "beer store", "lcbo", "fpos Saq"],
          "Non-Grocery Food": ["restaurant", "ubereats", "skipthe", "fast food", "mcdonalds", "tim hortons", "coffee", "couchetard", "convenien", "A & W", "Picton On vic social", "Picton On metro", "Kettleman'S"],
          "Misc Spending": ["service charge", "fee", "bank charge", "big al's aquarium", "value village", "amzn", "affirm canada", "physio outaouais", "amazon.ca", "sail",
            "kindle", " L'As Des Jeux ", "sessions cannabis", "interest charges", "justice quebec amendes", "dollarama", "cdkeys"],
          "Automotive": ["petro-canada", "esso", "shell", "gas", "car", "tire", "maintenance", "pioneer", "macewen"],
          "Gifts": [],
          "Dates": ["cinema", "famous players", "dinner", "flower", "midtown brewing", "currah's cafe", "karlo estates", "prince eddy"],
          "Loans": ["loan", "student", "repayment", "nslsc"],
          "Trips": ["airbnb", "flight", "air canada", "hotel", "expedia", "mecp-ontpark-int-resorill"],
          "Sailboat Work": ["marine", "boat", "chandlery"]
        }
      };

      await this.createCategoryList({
        name: 'Default Categories',
        categories: defaultCategories,
        isDefault: true
      });
    }
  }
}
