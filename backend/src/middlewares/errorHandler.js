import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;

    // Log the error
    logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        details = error.details || error.message;
    } else if (error.name === 'MulterError') {
        statusCode = 400;
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File size exceeds maximum allowed limit';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field';
                break;
            default:
                message = 'File upload error';
        }
    } else if (error.code === 'INVALID_FILE_TYPE') {
        statusCode = 400;
        message = 'Invalid file type. Only PDF files are allowed';
    } else if (error.code === 'INVALID_FILE_EXTENSION') {
        statusCode = 400;
        message = 'Invalid file extension. File must have .pdf extension';
    } else if (error.message.includes('PDF')) {
        statusCode = 400;
        message = error.message;
    } else if (error.message.includes('No text content')) {
        statusCode = 400;
        message = 'The PDF file contains no readable text content';
    } else if (error.message.includes('Password')) {
        statusCode = 400;
        message = 'Password-protected PDFs are not supported';
    } else if (error.message.includes('corrupted')) {
        statusCode = 400;
        message = 'The PDF file appears to be corrupted or invalid';
    } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        statusCode = 400;
        message = 'Invalid JSON in request body';
    } else if (error.code === 'ENOENT') {
        statusCode = 404;
        message = 'File not found';
    } else if (error.code === 'EACCES') {
        statusCode = 403;
        message = 'Permission denied';
    } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
        statusCode = 503;
        message = 'Server temporarily unavailable - too many open files';
    } else if (error.code === 'ENOSPC') {
        statusCode = 507;
        message = 'Insufficient storage space';
    }

    // Handle rate limiting errors
    if (error.message && error.message.includes('Too many requests')) {
        statusCode = 429;
        message = 'Too many requests. Please try again later.';
    }

    // Handle CORS errors
    if (error.message && error.message.includes('CORS')) {
        statusCode = 403;
        message = 'Cross-origin request blocked';
    }

    // Create error response
    const errorResponse = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };

    // Add details in development mode
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
        
        if (details) {
            errorResponse.details = details;
        }
    }

    // Add request ID if available
    if (req.id) {
        errorResponse.requestId = req.id;
    }

    // Security: Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        errorResponse.message = 'An unexpected error occurred. Please try again later.';
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors for unmatched routes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const notFoundHandler = (req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};

/**
 * Async error wrapper to catch async errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default errorHandler;