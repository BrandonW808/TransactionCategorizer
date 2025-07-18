import { ObjectId } from 'mongodb';

export interface Transaction {
  date: string;
  description: string;
  subDescription: string;
  type: string; // e.g., "Debit" or "Credit"
  amount: number;
  balance?: number;
}

export interface Categories {
  [mainCategory: string]: {
    [subCategory: string]: string[]; // array of keywords
  };
}

export interface SharedTransaction {
  description: string;
  total: number;
  brandon: number;
  expense: string;
}

export interface CategorizeRequest {
  transactions: Transaction[];
  categories?: Categories;
  sharedTransactions?: SharedTransaction[];
}

export interface CategorizeResponse {
  success: boolean;
  data?: (string | number)[][];
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// New interfaces for MongoDB storage
export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryList {
  _id?: ObjectId;
  name: string;
  categories: Categories;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface CreateCategoryListRequest {
  name: string;
  categories: Categories;
  isDefault?: boolean;
}

export interface UpdateCategoryListRequest {
  name?: string;
  categories?: Categories;
  isDefault?: boolean;
}
