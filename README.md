# Transaction Categorizer API

A REST API for categorizing bank transactions from CSV files. This API automatically categorizes transactions based on configurable keyword rules and supports shared expense processing.

## Features

- **Transaction Categorization**: Automatically categorizes bank transactions using keyword matching
- **CSV File Upload**: Upload transaction and shared expense CSV files
- **Configurable Categories**: Use default categories or provide custom categorization rules
- **Shared Expense Processing**: Handle shared expenses with custom allocation
- **Multiple Output Formats**: Get results as JSON or downloadable CSV
- **RESTful API**: Clean REST endpoints with proper error handling

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
```http
GET /api/health
```

Returns the API health status.

### Get Default Categories
```http
GET /api/categories
```

Returns the default categorization rules.

### Categorize Transactions (JSON)
```http
POST /api/categorize
Content-Type: application/json

{
  "transactions": [
    {
      "date": "2024-01-15",
      "description": "WALMART",
      "subDescription": "GROCERY PURCHASE",
      "type": "Debit",
      "amount": -45.67,
      "balance": 1234.56
    }
  ],
  "categories": {
    "Expenses": {
      "Groceries": ["walmart", "superstore", "loblaws"]
    }
  },
  "sharedTransactions": [
    {
      "description": "Shared grocery expense",
      "total": 45.67,
      "brandon": 22.84,
      "expense": "groceries"
    }
  ]
}
```

### Upload and Categorize CSV Files
```http
POST /api/categorize-csv
Content-Type: multipart/form-data

Form fields:
- transactions: CSV file (required)
- shared: CSV file (optional)
- categories: JSON string (optional)
```

#### Transaction CSV Format
```csv
Date,Description,Sub-Description,Type of Transaction,Amount,Balance
2024-01-15,WALMART,GROCERY PURCHASE,Debit,-45.67,1234.56
```

#### Shared Expenses CSV Format
```csv
Date,Expense,Description,Total,Brandon
2024-01-15,groceries,Shared grocery expense,45.67,22.84
```

### Parse CSV (No Categorization)
```http
POST /api/parse-csv
Content-Type: multipart/form-data

Form fields:
- transactions: CSV file (required)
- shared: CSV file (optional)
```

Returns parsed transaction data without categorization.

### Export Categorized CSV
```http
POST /api/export-csv
Content-Type: application/json

{
  "transactions": [...],
  "categories": {...},
  "sharedTransactions": [...]
}
```

Returns a downloadable CSV file with categorized transactions.

## Default Categories

The API comes with pre-configured categories including:

- **Income**: Kinect, Other
- **Expenses**: Living Expenses, Groceries, Pets, Subscriptions, Phone Bill, Alcohol, Non-Grocery Food, Misc Spending, Automotive, Gifts, Dates, Loans, Trips, Sailboat Work

Each category has associated keywords for automatic matching.

## Custom Categories

You can provide custom categorization rules:

```json
{
  "categories": {
    "Income": {
      "Salary": ["payroll", "salary", "wage"],
      "Freelance": ["contract", "freelance", "consulting"]
    },
    "Expenses": {
      "Food": ["restaurant", "grocery", "food"],
      "Transport": ["gas", "transit", "uber", "taxi"]
    }
  }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (in development mode)"
}
```

## Response Format

Success responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (if configured)

### Project Structure

```
src/
├── server.ts          # Express server setup
├── routes.ts          # API route definitions
├── transactions.ts    # Transaction categorization logic
├── parser.ts          # CSV parsing functions
└── types.ts          # TypeScript type definitions
```

## Docker Support

You can also run this API using Docker:

```dockerfile
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
