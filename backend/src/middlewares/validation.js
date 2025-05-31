import { body, param, validationResult } from 'express-validator';
import { validateFileType, getFileSize, formatFileSize } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';

/**
 * Validation middleware for file uploads
 */
export const uploadValidation = [
    // Custom validation for file upload
    (req, res, next) => {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const file = req.file;
        const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

        // Validate file type
        if (!validateFileType(file.originalname, file.mimetype)) {
            logger.security('Invalid file type upload attempt', {
                filename: file.originalname,
                mimetype: file.mimetype,
                ip: req.ip
            });
            
            return res.status(400).json({
                success: false,
                message: 'Only PDF files are allowed'
            });
        }

        // Validate file size
        if (file.size > maxSize) {
            logger.warn('File size exceeded', {
                filename: file.originalname,
                size: formatFileSize(file.size),
                maxSize: formatFileSize(maxSize),
                ip: req.ip
            });
            
            return res.status(400).json({
                success: false,
                message: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`
            });
        }

        // Validate filename
        if (file.originalname.length > 255) {
            return res.status(400).json({
                success: false,
                message: 'Filename is too long'
            });
        }

        // Check for potentially malicious filenames
        const suspiciousPatterns = [
            /\.\./,           // Directory traversal
            /[<>:"|?*]/,      // Invalid characters
            /^\./,            // Hidden files
            /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i // Executable files
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
            logger.security('Suspicious filename detected', {
                filename: file.originalname,
                ip: req.ip
            });
            
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }

        next();
    }
];

/**
 * Validation middleware for download requests
 */
export const downloadValidation = [
    param('filename')
        .isString()
        .trim()
        .isLength({ min: 1, max: 255 })
        .matches(/^[a-zA-Z0-9\-_\.]+$/)
        .withMessage('Invalid filename format'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.security('Invalid download request', {
                filename: req.params.filename,
                errors: errors.array(),
                ip: req.ip
            });
            
            return res.status(400).json({
                success: false,
                message: 'Invalid filename',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * General request validation middleware
 */
export const requestValidation = [
    // Rate limiting headers validation
    (req, res, next) => {
        // Check for suspicious headers
        const suspiciousHeaders = [
            'x-forwarded-for',
            'x-real-ip',
            'x-cluster-client-ip'
        ];

        // Log potential proxy bypass attempts
        suspiciousHeaders.forEach(header => {
            if (req.headers[header] && req.headers[header] !== req.ip) {
                logger.security('Potential IP spoofing attempt', {
                    header,
                    value: req.headers[header],
                    realIp: req.ip
                });
            }
        });

        next();
    }
];

/**
 * Sanitize input middleware
 */
export const sanitizeInput = (req, res, next) => {
    // Sanitize query parameters
    Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
            req.query[key] = req.query[key].trim();
        }
    });

    // Sanitize body parameters
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    next();
};

/**
 * Check if request is from allowed origin
 */
export const originValidation = (req, res, next) => {
    const origin = req.get('origin');
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

    if (origin && !allowedOrigins.includes(origin)) {
        logger.security('Request from unauthorized origin', {
            origin,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    }

    next();
};

/**
 * Validate file metadata
 */
export const validateFileMetadata = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const file = req.file;
    
    // Check for empty files
    if (file.size === 0) {
        return res.status(400).json({
            success: false,
            message: 'Empty files are not allowed'
        });
    }

    // Log file upload for monitoring
    logger.info('File upload received', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: formatFileSize(file.size),
        ip: req.ip
    });

    next();
};

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', {
            errors: errors.array(),
            url: req.url,
            method: req.method,
            ip: req.ip
        });
        
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    next();
};