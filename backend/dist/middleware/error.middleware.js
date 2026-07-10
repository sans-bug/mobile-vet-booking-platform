"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Error Log:', err);
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }
    // Mongoose cast errors (invalid ObjectIds)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid field path: ${err.path} with value: ${err.value}`;
    }
    // Mongoose duplicate key errors
    if (err.code === 11000) {
        statusCode = 400;
        const duplicatedField = Object.keys(err.keyValue)[0];
        message = `A record with this ${duplicatedField} already exists.`;
    }
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
