import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { 
    uploadSingle, 
    handleMulterError, 
    logUploadAttempt, 
    cleanupOnError 
} from '../config/multer.js';
import { 
    uploadValidation, 
    downloadValidation,
    sanitizeInput,
    validateFileMetadata
} from '../middlewares/validation.js';
import { 
    uploadLimiter, 
    downloadLimiter 
} from '../middlewares/rateLimiter.js';

const router = express.Router();

// Upload and convert endpoint
router.post('/upload', 
    uploadLimiter,           // Rate limiting específico para uploads
    logUploadAttempt,        // Log da tentativa
    uploadSingle,            // Multer middleware
    handleMulterError,       // Error handling do multer
    cleanupOnError,          // Cleanup em caso de erro
    validateFileMetadata,    // Validação de metadata
    uploadValidation,        // Validação customizada
    sanitizeInput,           // Sanitização de input
    uploadController.uploadAndConvert
);

// Download endpoint
router.get('/download/:filename', 
    downloadLimiter,         // Rate limiting para downloads
    downloadValidation,      // Validação do filename
    uploadController.downloadFile
);

// Health check endpoint
router.get('/health', 
    uploadController.healthCheck
);

// Stats endpoint (opcional)
router.get('/stats', 
    uploadController.getStats
);

export default router;