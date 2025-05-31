import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define level colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        
        // Handle additional data
        const additionalData = Object.keys(args).length ? JSON.stringify(args, null, 2) : '';
        
        return `${timestamp} [${level}]: ${message} ${additionalData}`;
    })
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }),
    
    // Error log file
    new winston.transports.File({
        filename: path.join(__dirname, '..', '..', 'logs', 'error.log'),
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
        filename: path.join(__dirname, '..', '..', 'logs', 'combined.log'),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    levels,
    format,
    transports,
    exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
    logger.exceptions.handle(
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        })
    );

    logger.rejections.handle(
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        })
    );
}

// Add request logging method
logger.request = (req, res, responseTime) => {
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    logger.http(`${method} ${url}`, {
        ip,
        statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent') || '',
    });
};

// Add performance logging method
logger.performance = (operation, duration, metadata = {}) => {
    logger.info(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        ...metadata
    });
};

// Add security logging method
logger.security = (event, details = {}) => {
    logger.warn(`Security: ${event}`, details);
};

export default logger;