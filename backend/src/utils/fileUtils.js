import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sanitize from 'sanitize-filename';
import logger from './logger.js';

const unlinkAsync = promisify(fs.unlink);

/**
 * Generate a unique filename with timestamp
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
export function generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    // Sanitize the filename
    const sanitizedBaseName = sanitize(baseName).substring(0, 50); // Limit length
    
    return `${sanitizedBaseName}-${timestamp}-${randomSuffix}${extension}`;
}

/**
 * Clean up (delete) a file safely
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function cleanupFile(filePath) {
    try {
        if (!filePath || !fs.existsSync(filePath)) {
            return false;
        }

        await unlinkAsync(filePath);
        logger.info(`File cleaned up: ${filePath}`);
        return true;
    } catch (error) {
        logger.error(`Error cleaning up file ${filePath}:`, error);
        return false;
    }
}

/**
 * Clean up old files in a directory
 * @param {string} directory - Directory path
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {Promise<number>} - Number of files cleaned up
 */
export async function cleanupOldFiles(directory, maxAge = 3600000) { // 1 hour default
    try {
        if (!fs.existsSync(directory)) {
            return 0;
        }

        const files = fs.readdirSync(directory);
        const now = Date.now();
        let cleanedCount = 0;

        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                const deleted = await cleanupFile(filePath);
                if (deleted) cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            logger.info(`Cleaned up ${cleanedCount} old files from ${directory}`);
        }

        return cleanedCount;
    } catch (error) {
        logger.error(`Error cleaning up old files in ${directory}:`, error);
        return 0;
    }
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {number} - File size in bytes
 */
export function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        logger.error(`Error getting file size for ${filePath}:`, error);
        return 0;
    }
}

/**
 * Check if file exists and is readable
 * @param {string} filePath - Path to file
 * @returns {boolean} - True if file exists and is readable
 */
export function isFileAccessible(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK | fs.constants.R_OK);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension (lowercase)
 */
export function getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
}

/**
 * Validate file type by extension and mime type
 * @param {string} filename - Filename
 * @param {string} mimetype - MIME type
 * @param {Array<string>} allowedExtensions - Allowed file extensions
 * @param {Array<string>} allowedMimeTypes - Allowed MIME types
 * @returns {boolean} - True if valid
 */
export function validateFileType(filename, mimetype, allowedExtensions = ['.pdf'], allowedMimeTypes = ['application/pdf']) {
    const extension = getFileExtension(filename);
    
    return allowedExtensions.includes(extension) && allowedMimeTypes.includes(mimetype);
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 * @returns {boolean} - True if directory exists or was created
 */
export function ensureDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            logger.info(`Created directory: ${dirPath}`);
        }
        return true;
    } catch (error) {
        logger.error(`Error creating directory ${dirPath}:`, error);
        return false;
    }
}

/**
 * Get human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable size
 */
export function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Schedule file cleanup after delay
 * @param {string} filePath - Path to file
 * @param {number} delay - Delay in milliseconds
 */
export function scheduleCleanup(filePath, delay = 60000) { // 1 minute default
    setTimeout(async () => {
        await cleanupFile(filePath);
    }, delay);
}

/**
 * Copy file to new location
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<boolean>} - True if copied successfully
 */
export async function copyFile(source, destination) {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(destination);
        ensureDirectory(destDir);
        
        fs.copyFileSync(source, destination);
        logger.info(`File copied from ${source} to ${destination}`);
        return true;
    } catch (error) {
        logger.error(`Error copying file from ${source} to ${destination}:`, error);
        return false;
    }
}