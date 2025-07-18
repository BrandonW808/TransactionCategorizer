"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const parser_1 = require("./parser");
const transactions_1 = require("./transactions");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});
// Get default categories
router.get('/categories', (req, res) => {
    try {
        const categories = (0, transactions_1.getDefaultCategories)();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get default categories',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Categorize transactions (JSON input)
router.post('/categorize', (req, res) => {
    try {
        const { transactions, categories, sharedTransactions } = req.body;
        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: transactions array is required'
            });
        }
        const categoriesToUse = categories || (0, transactions_1.getDefaultCategories)();
        let output = (0, transactions_1.categorizeTransactions)(transactions, categoriesToUse);
        if (sharedTransactions && sharedTransactions.length > 0) {
            output = (0, transactions_1.processSharedTransactions)(output, sharedTransactions);
        }
        res.json({ success: true, data: output });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to categorize transactions',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Upload and categorize CSV files
router.post('/categorize-csv', upload.fields([
    { name: 'transactions', maxCount: 1 },
    { name: 'shared', maxCount: 1 }
]), (req, res) => {
    try {
        const files = req.files;
        if (!files || !files.transactions || files.transactions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No transactions CSV file uploaded'
            });
        }
        const transactionsCsv = files.transactions[0].buffer.toString('utf-8');
        const sharedCsv = files.shared && files.shared[0] ? files.shared[0].buffer.toString('utf-8') : null;
        const transactions = (0, parser_1.parseTransactionCSV)(transactionsCsv);
        const sharedTransactions = sharedCsv ? (0, parser_1.parseSharedCsv)(sharedCsv) : [];
        // Use custom categories if provided in request body
        const customCategories = req.body.categories ? JSON.parse(req.body.categories) : null;
        const categories = customCategories || (0, transactions_1.getDefaultCategories)();
        let output = (0, transactions_1.categorizeTransactions)(transactions, categories);
        if (sharedTransactions.length > 0) {
            output = (0, transactions_1.processSharedTransactions)(output, sharedTransactions);
        }
        res.json({ success: true, data: output });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to process CSV files',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Parse CSV without categorization (for testing/validation)
router.post('/parse-csv', upload.fields([
    { name: 'transactions', maxCount: 1 },
    { name: 'shared', maxCount: 1 }
]), (req, res) => {
    try {
        const files = req.files;
        if (!files || !files.transactions || files.transactions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No transactions CSV file uploaded'
            });
        }
        const transactionsCsv = files.transactions[0].buffer.toString('utf-8');
        const sharedCsv = files.shared && files.shared[0] ? files.shared[0].buffer.toString('utf-8') : null;
        const transactions = (0, parser_1.parseTransactionCSV)(transactionsCsv);
        const sharedTransactions = sharedCsv ? (0, parser_1.parseSharedCsv)(sharedCsv) : [];
        res.json({
            success: true,
            data: {
                transactions,
                sharedTransactions,
                counts: {
                    transactions: transactions.length,
                    shared: sharedTransactions.length
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to parse CSV files',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get CSV output as downloadable file
router.post('/export-csv', (req, res) => {
    try {
        const { transactions, categories, sharedTransactions } = req.body;
        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: transactions array is required'
            });
        }
        const categoriesToUse = categories || (0, transactions_1.getDefaultCategories)();
        let output = (0, transactions_1.categorizeTransactions)(transactions, categoriesToUse);
        if (sharedTransactions && sharedTransactions.length > 0) {
            output = (0, transactions_1.processSharedTransactions)(output, sharedTransactions);
        }
        // Convert to CSV format
        const csvContent = output.map(row => row.map(cell => typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell).join(",")).join("\n");
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="categorized_transactions_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to export CSV',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=routes.js.map