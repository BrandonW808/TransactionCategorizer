export interface Transaction {
    date: string;
    description: string;
    subDescription: string;
    type: string;
    amount: number;
    balance?: number;
}
export interface Categories {
    [mainCategory: string]: {
        [subCategory: string]: string[];
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
