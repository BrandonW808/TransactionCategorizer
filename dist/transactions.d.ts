import { Transaction, Categories, SharedTransaction } from "./types";
export type OutputRow = (string | number)[];
/**
 * Categorizes a list of transactions based on keyword rules.
 * Returns rows structured like the output spreadsheet.
 */
export declare function categorizeTransactions(transactions: Transaction[], categories: Categories, autoAssignUnknown?: boolean): OutputRow[];
export declare function processSharedTransactions(output: OutputRow[], shared: SharedTransaction[]): OutputRow[];
export declare function getDefaultCategories(): Categories;
