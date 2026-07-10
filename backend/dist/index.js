"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const db_1 = require("./config/db");
const error_middleware_1 = require("./middleware/error.middleware");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const pet_routes_1 = __importDefault(require("./routes/pet.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const emergency_routes_1 = __importDefault(require("./routes/emergency.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: '*', // In production, replace with specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting: 100 requests per 15 minutes per IP
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
    }
});
app.use('/api/', limiter);
// Express body parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Multipart file uploads
app.use((0, express_fileupload_1.default)({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    abortOnLimit: true,
}));
// Serve local static uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Connect Database
(0, db_1.connectDB)();
// Mount Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/pets', pet_routes_1.default);
app.use('/api/bookings', booking_routes_1.default);
app.use('/api/emergencies', emergency_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
// Base route for diagnostics
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});
// Error handling middleware
app.use(error_middleware_1.errorHandler);
// Listen
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
