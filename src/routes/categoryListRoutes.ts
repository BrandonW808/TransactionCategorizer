import { Router, Request, Response } from 'express';
import {
  createCategoryList,
  deleteCategoryList,
  getAllCategoryLists,
  getCategoryListById,
  getDefaultCategoryList,
  searchCategoryLists,
  updateCategoryList
} from '../services/categoryListService';
import { CreateCategoryListRequest, UpdateCategoryListRequest } from '../types';

const router = Router();

/**
 * GET /api/category-lists
 * Get all category lists
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const categoryLists = await getAllCategoryLists();
    res.json({ success: true, data: categoryLists });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve category lists',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/category-lists/default
 * Get the default category list
 */
router.get('/default', async (req: Request, res: Response) => {
  try {
    const defaultList = await getDefaultCategoryList();
    if (!defaultList) {
      return res.status(404).json({
        success: false,
        error: 'No default category list found'
      });
    }
    res.json({ success: true, data: defaultList });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve default category list',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/category-lists/search?q=query
 * Search category lists by name
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const categoryLists = await searchCategoryLists(query);
    res.json({ success: true, data: categoryLists });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search category lists',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/category-lists/:id
 * Get a category list by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const categoryList = await getCategoryListById(req.params.id);
    if (!categoryList) {
      return res.status(404).json({
        success: false,
        error: 'Category list not found'
      });
    }
    res.json({ success: true, data: categoryList });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve category list',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/category-lists
 * Create a new category list
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, categories, isDefault }: CreateCategoryListRequest = req.body;

    if (!name || !categories) {
      return res.status(400).json({
        success: false,
        error: 'Name and categories are required'
      });
    }

    const categoryList = await createCategoryList({ name, categories, isDefault });
    res.status(201).json({ success: true, data: categoryList });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: 'Failed to create category list',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/category-lists/:id
 * Update a category list
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: UpdateCategoryListRequest = req.body;
    const categoryList = await updateCategoryList(req.params.id, updateData);

    if (!categoryList) {
      return res.status(404).json({
        success: false,
        error: 'Category list not found'
      });
    }

    res.json({ success: true, data: categoryList });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: 'Failed to update category list',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/category-lists/:id
 * Delete a category list
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteCategoryList(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Category list not found'
      });
    }

    res.json({ success: true, data: { message: 'Category list deleted successfully' } });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('Cannot delete') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: 'Failed to delete category list',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
