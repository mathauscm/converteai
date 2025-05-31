import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUniqueFilename, ensureDirectory } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'temp');
    
    // Ensure directory exists
    ensureDirectory(uploadPath);
    
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Generate unique filename to avoid conflicts
    const uniqueName = generateUniqueFilename(file.originalname);
    
    logger.info(`File upload: ${file.originalname} -> ${uniqueName}`);
    
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype !== 'application/pdf') {
    const error = new Error('Only PDF files are allowed');
    error.code = 'INVALID_FILE_TYPE';
    logger.warn(`Invalid file type uploaded: ${file.mimetype}`, {
      originalname: file.originalname,
      ip: req.ip
    });
    return cb(error, false);
  }
  
  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (fileExtension !== '.pdf') {
    const error = new Error('File must have .pdf extension');
    error.code = 'INVALID_FILE_EXTENSION';
    logger.warn(`Invalid file extension: ${fileExtension}`, {
      originalname: file.originalname,
      ip: req.ip
    });
    return cb(error, false);
  }
  
  // Additional security checks
  const suspiciousPatterns = [
    /\.\./,           // Directory traversal
    /[<>:"|?*]/,      // Invalid characters
    /^\./,            // Hidden files
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
    const error = new Error('Invalid filename');
    error.code = 'SUSPICIOUS_FILENAME';
    logger.security('Suspicious filename detected', {
      filename: file.originalname,
      ip: req.ip
    });
    return cb(error, false);
  }
  
  cb(null, true);
};

// Multer configuration
const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1, // Only one file at a time
    fields: 1, // Only one field
    fieldSize: 1024 * 1024, // 1MB field size limit
    headerPairs: 20 // Limit header pairs
  },
  
  // Error handling
  onError: (error, next) => {
    logger.error('Multer error:', error);
    next(error);
  }
};

// Create multer instance
const upload = multer(uploadConfig);

// Export configured multer instance
export default upload;

// Export single file upload middleware
export const uploadSingle = upload.single('file');

// Export error handler for multer errors
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File size exceeds maximum allowed limit of ${Math.round((uploadConfig.limits.fileSize) / (1024 * 1024))}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      default:
        message = `Upload error: ${error.message}`;
    }
    
    logger.warn('Multer error:', {
      code: error.code,
      message: error.message,
      field: error.field,
      ip: req.ip
    });
    
    return res.status(statusCode).json({
      success: false,
      message,
      code: error.code
    });
  }
  
  // Handle custom file filter errors
  if (error.code === 'INVALID_FILE_TYPE' || 
      error.code === 'INVALID_FILE_EXTENSION' || 
      error.code === 'SUSPICIOUS_FILENAME') {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }
  
  next(error);
};

// Middleware to log upload attempts
export const logUploadAttempt = (req, res, next) => {
  logger.info('File upload attempt', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
};

// Middleware to clean up files on error
export const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override response methods to cleanup on error
  res.send = function(data) {
    if (res.statusCode >= 400 && req.file) {
      // Clean up uploaded file on error
      import('../utils/fileUtils.js').then(({ cleanupFile }) => {
        cleanupFile(req.file.path);
      });
    }
    originalSend.call(this, data);
  };
  
  res.json = function(data) {
    if (res.statusCode >= 400 && req.file) {
      // Clean up uploaded file on error
      import('../utils/fileUtils.js').then(({ cleanupFile }) => {
        cleanupFile(req.file.path);
      });
    }
    originalJson.call(this, data);
  };
  
  next();
};