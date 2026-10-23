"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    statusCode;
    details;
    constructor(message, statusCode = 400, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    if (statusCode >= 500) {
        console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        details: err.details,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
}
