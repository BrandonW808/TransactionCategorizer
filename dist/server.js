"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Routes
app.use('/api', routes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Transaction Categorizer API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            categories: 'GET /api/categories',
            categorize: 'POST /api/categorize',
            categorizeCsv: 'POST /api/categorize-csv',
            parseCsv: 'POST /api/parse-csv',
            exportCsv: 'POST /api/export-csv'
        }
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Transaction Categorizer API running on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
});
exports.default = app;
//# sourceMappingURL=server.js.map