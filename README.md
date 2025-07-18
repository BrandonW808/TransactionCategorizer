# Transaction Categorizer API v2.0

A REST API for categorizing bank transactions with MongoDB storage for users and category lists.

## What's New in v2.0

- **MongoDB Integration**: Users and category lists are now stored in MongoDB instead of the file system
- **Separate API Endpoints**: Clean RESTful API design with separate endpoints for users, category lists, and transactions
- **Better Data Management**: Full CRUD operations for users and category lists
- **Backward Compatibility**: Legacy endpoints redirect to new API structure

## Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 4.4 or higher
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection details

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a user by ID
- `GET /api/users/search?q=query` - Search users by name
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

#### Create User Example:
```json
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Category Lists
- `GET /api/category-lists` - Get all category lists
- `GET /api/category-lists/:id` - Get a category list by ID
- `GET /api/category-lists/default` - Get the default category list
- `GET /api/category-lists/search?q=query` - Search category lists by name
- `POST /api/category-lists` - Create a new category list
- `PUT /api/category-lists/:id` - Update a category list
- `DELETE /api/category-lists/:id` - Delete a category list

#### Create Category List Example:
```json
POST /api/category-lists
{
  "name": "Personal Budget",
  "categories": {
    "Income": {
      "Salary": ["payroll", "salary"],
      "Freelance": ["consulting", "contract"]
    },
    "Expenses": {
      "Groceries": ["walmart", "superstore"],
      "Transportation": ["gas", "uber", "transit"]
    }
  },
  "isDefault": false
}
```

### Transactions
- `POST /api/transactions/categorize` - Categorize transactions (JSON input)
- `POST /api/transactions/categorize-csv` - Categorize transactions (CSV upload)
- `POST /api/transactions/parse-csv` - Parse CSV without categorization
- `POST /api/transactions/export-csv` - Export categorized transactions as CSV

#### Categorize Transactions Example:
```json
POST /api/transactions/categorize
{
  "transactions": [
    {
      "date": "2024-01-15",
      "description": "WALMART SUPERCENTER",
      "subDescription": "Grocery shopping",
      "type": "Debit",
      "amount": -85.50
    }
  ],
  "categoryListId": "507f1f77bcf86cd799439011"  // Optional: use specific category list
}
```

## MongoDB Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Lists Collection
```javascript
{
  _id: ObjectId,
  name: String (unique),
  categories: {
    [mainCategory]: {
      [subCategory]: [keywords]
    }
  },
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Migration from v1.0

The new version maintains backward compatibility through redirects:
- `/api/categories` → `/api/category-lists/default`
- `/api/categoriesList` → `/api/category-lists`
- `/api/categorize` → `/api/transactions/categorize`
- `/api/categorize-csv` → `/api/transactions/categorize-csv`

However, it's recommended to update your integrations to use the new endpoints directly.

## Environment Variables

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `MONGODB_DB_NAME`: Database name (default: `transaction_categorizer`)
- `PORT`: Server port (default: `3000`)
- `NODE_ENV`: Environment mode (`development` or `production`)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (in development mode)"
}
```

Success responses follow the format:

```json
{
  "success": true,
  "data": { ... }
}
```

## Development

- Run tests: `npm test`
- Build: `npm run build`
- Development server: `npm run dev`

## License

MIT
