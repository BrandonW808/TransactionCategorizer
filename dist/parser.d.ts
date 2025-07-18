import { Transaction, SharedTransaction } from "./types";
export declare function parseTransactionCSV(csvText: string): Transaction[];
export declare function parseSharedCsv(csvText: string): SharedTransaction[];
export declare function parseMultipleFiles(files: {
    transactions?: string;
    shared?: string;
}): {
    transactions: Transaction[];
    shared: SharedTransaction[];
};
