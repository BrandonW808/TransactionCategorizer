import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserRequest, UpdateUserRequest } from '../types';

const router = Router();

/**
 * GET /api/users
 * Get all users
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/users/search?q=query
 * Search users by name
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

    const users = await UserService.searchUsers(query);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/users/:id
 * Get a user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email }: CreateUserRequest = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const user = await UserService.createUser({ name, email });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/users/:id
 * Update a user
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: UpdateUserRequest = req.body;
    const user = await UserService.updateUser(req.params.id, updateData);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await UserService.deleteUser(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({ success: true, data: { message: 'User deleted successfully' } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
