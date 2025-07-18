import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseTransactionCSV, parseSharedCsv, parseMultipleFiles } from './parser';
import { categorizeTransactions, processSharedTransactions, getDefaultCategories, getCategoriesList, addToCategoriesList } from './transactions';
import { CategorizeRequest, ApiResponse, Categories, Transaction, SharedTransaction } from './types';
import fs from 'fs';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

// Get default categories
router.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = getDefaultCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get default categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get default categories
router.get('/categoriesList', (req: Request, res: Response) => {
  try {
    const list = getCategoriesList();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get default categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Categorize transactions (JSON input)
router.post('/categoriesList', (req: Request, res: Response) => {
  try {
    const { name, categories } = req.body;
    if (!name || !categories) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: name and categories are required'
      });
    }

    addToCategoriesList(name, categories).then((fileName: string) => {
      res.json({ success: true, data: fileName });
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to categorize transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get default categories
router.get('/users', (req: Request, res: Response) => {
  try {
    fs.readdir('/users', { withFileTypes: true }, (err, files) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      // Filter only regular files (exclude directories)
      const fileList = files
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name);
      res.json({ success: true, data: fileList });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get default categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Categorize transactions (JSON input)
router.post('/users', (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: name and email are required'
      });
    }

    // Save user
    const fileName = `categories/${name}.json`;
    const jsonData = JSON.stringify({ name: name, email: email }, null, 2); // Pretty print with 2-space indent
    fs.writeFile(fileName, jsonData, function () {
      res.send(fileName);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to categorize transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Categorize transactions (JSON input)
router.post('/categorize', (req: Request, res: Response) => {
  try {
    const { transactions, categories, sharedTransactions }: CategorizeRequest = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: transactions array is required'
      });
    }

    const categoriesToUse = categories || getDefaultCategories();
    let output = categorizeTransactions(transactions, categoriesToUse);

    if (sharedTransactions && sharedTransactions.length > 0) {
      output = processSharedTransactions(output, sharedTransactions);
    }

    res.json({ success: true, data: output });
  } catch (error) {
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
]), (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.transactions || files.transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No transactions CSV file uploaded'
      });
    }

    const transactionsCsv = files.transactions[0].buffer.toString('utf-8');
    const sharedCsv = files.shared && files.shared[0] ? files.shared[0].buffer.toString('utf-8') : null;

    const transactions = parseTransactionCSV(transactionsCsv);
    const sharedTransactions = sharedCsv ? parseSharedCsv(sharedCsv) : [];

    // Use custom categories if provided in request body
    const customCategories = req.body.categories ? JSON.parse(req.body.categories) : null;
    const categories = customCategories || getDefaultCategories();

    let output = categorizeTransactions(transactions, categories);

    if (sharedTransactions.length > 0) {
      output = processSharedTransactions(output, sharedTransactions);
    }

    res.json({ success: true, data: output });
  } catch (error) {
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
]), (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.transactions || files.transactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No transactions CSV file uploaded'
      });
    }

    const transactionsCsv = files.transactions[0].buffer.toString('utf-8');
    const sharedCsv = files.shared && files.shared[0] ? files.shared[0].buffer.toString('utf-8') : null;

    const transactions = parseTransactionCSV(transactionsCsv);
    const sharedTransactions = sharedCsv ? parseSharedCsv(sharedCsv) : [];

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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to parse CSV files',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get CSV output as downloadable file
router.post('/export-csv', (req: Request, res: Response) => {
  try {
    const { transactions, categories, sharedTransactions }: CategorizeRequest = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: transactions array is required'
      });
    }

    const categoriesToUse = categories || getDefaultCategories();
    let output = categorizeTransactions(transactions, categoriesToUse);

    if (sharedTransactions && sharedTransactions.length > 0) {
      output = processSharedTransactions(output, sharedTransactions);
    }

    // Convert to CSV format
    const csvContent = output.map(row =>
      row.map(cell => typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell).join(",")
    ).join("\n");

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="categorized_transactions_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
