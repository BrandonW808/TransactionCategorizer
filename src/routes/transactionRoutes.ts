import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseTransactionCSV, parseSharedCsv } from '../parser';
import { categorizeTransactions, processSharedTransactions } from '../transactions';
import { CategoryListService } from '../services/categoryListService';
import { CategorizeRequest, Categories } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/transactions/categorize
 * Categorize transactions using JSON input
 */
router.post('/categorize', async (req: Request, res: Response) => {
  try {
    const { transactions, categories, sharedTransactions, categoryListId }: CategorizeRequest & { categoryListId?: string } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: transactions array is required'
      });
    }

    let categoriesToUse: Categories;

    // If categoryListId is provided, use that category list
    if (categoryListId) {
      const categoryList = await CategoryListService.getCategoryListById(categoryListId);
      if (!categoryList) {
        return res.status(404).json({
          success: false,
          error: 'Category list not found'
        });
      }
      categoriesToUse = categoryList.categories;
    }
    // If categories are provided directly, use those
    else if (categories) {
      categoriesToUse = categories;
    }
    // Otherwise, use the default category list
    else {
      const defaultList = await CategoryListService.getDefaultCategoryList();
      if (!defaultList) {
        return res.status(500).json({
          success: false,
          error: 'No default category list found'
        });
      }
      categoriesToUse = defaultList.categories;
    }

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

/**
 * POST /api/transactions/categorize-csv
 * Upload and categorize CSV files
 */
router.post('/categorize-csv', upload.fields([
  { name: 'transactions', maxCount: 1 },
  { name: 'shared', maxCount: 1 }
]), async (req: Request, res: Response) => {
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

    let categoriesToUse: Categories;
    const { categoryListId } = req.body;

    // If categoryListId is provided, use that category list
    if (categoryListId) {
      const categoryList = await CategoryListService.getCategoryListById(categoryListId);
      if (!categoryList) {
        return res.status(404).json({
          success: false,
          error: 'Category list not found'
        });
      }
      categoriesToUse = categoryList.categories;
    }
    // If custom categories are provided, use those
    else if (req.body.categories) {
      try {
        categoriesToUse = JSON.parse(req.body.categories);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid categories JSON format'
        });
      }
    }
    // Otherwise, use the default category list
    else {
      const defaultList = await CategoryListService.getDefaultCategoryList();
      if (!defaultList) {
        return res.status(500).json({
          success: false,
          error: 'No default category list found'
        });
      }
      categoriesToUse = defaultList.categories;
    }

    let output = categorizeTransactions(transactions, categoriesToUse);

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

/**
 * POST /api/transactions/parse-csv
 * Parse CSV without categorization (for testing/validation)
 */
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

/**
 * POST /api/transactions/export-csv
 * Get categorized transactions as downloadable CSV file
 */
router.post('/export-csv', async (req: Request, res: Response) => {
  try {
    const { transactions, categories, sharedTransactions, categoryListId }: CategorizeRequest & { categoryListId?: string } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: transactions array is required'
      });
    }

    let categoriesToUse: Categories;

    // If categoryListId is provided, use that category list
    if (categoryListId) {
      const categoryList = await CategoryListService.getCategoryListById(categoryListId);
      if (!categoryList) {
        return res.status(404).json({
          success: false,
          error: 'Category list not found'
        });
      }
      categoriesToUse = categoryList.categories;
    }
    // If categories are provided directly, use those
    else if (categories) {
      categoriesToUse = categories;
    }
    // Otherwise, use the default category list
    else {
      const defaultList = await CategoryListService.getDefaultCategoryList();
      if (!defaultList) {
        return res.status(500).json({
          success: false,
          error: 'No default category list found'
        });
      }
      categoriesToUse = defaultList.categories;
    }

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
