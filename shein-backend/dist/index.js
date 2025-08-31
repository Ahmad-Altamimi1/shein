"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
(0, database_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use((0, helmet_1.default)());
app.use(limiter);
app.use((0, morgan_1.default)('combined'));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:19006').split(',');
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SHEIN Shopping API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
app.use('/api/products', products_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/users', users_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(error.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
});
app.listen(PORT, () => {
    console.log(`🚀 SHEIN Shopping API server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map