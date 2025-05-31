import fs from 'fs';
import pdfParse from 'pdf-parse';
import logger from '../utils/logger.js';

/**
 * Extract text content from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractPdf(filePath) {
    try {
        // Validate file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('PDF file not found');
        }

        // Read PDF buffer
        const pdfBuffer = fs.readFileSync(filePath);
        
        // Validate buffer
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('PDF file is empty or corrupted');
        }

        logger.info(`Extracting text from PDF: ${filePath}`);

        // Parse PDF with options
        const options = {
            // Limit the number of pages to process (prevent memory issues)
            max: 100,
            // Version of PDF.js to use
            version: 'v1.10.100'
        };

        const data = await pdfParse(pdfBuffer, options);

        if (!data || !data.text) {
            throw new Error('No text content found in PDF');
        }

        const extractedText = data.text.trim();
        
        if (extractedText.length === 0) {
            throw new Error('PDF contains no readable text content');
        }

        logger.info(`Successfully extracted ${extractedText.length} characters from PDF`);
        
        // Log metadata for debugging
        logger.info(`PDF metadata:`, {
            pages: data.numpages,
            info: data.info,
            textLength: extractedText.length
        });

        return extractedText;

    } catch (error) {
        logger.error('Error extracting PDF:', {
            filePath,
            error: error.message,
            stack: error.stack
        });

        // Provide more specific error messages
        if (error.message.includes('Invalid PDF structure')) {
            throw new Error('The PDF file appears to be corrupted or invalid');
        } else if (error.message.includes('Password')) {
            throw new Error('Password-protected PDFs are not supported');
        } else if (error.message.includes('No text content')) {
            throw new Error('This PDF contains no readable text. It may be a scanned document or image-based PDF');
        }

        throw error;
    }
}

/**
 * Validate PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<boolean>} - True if valid PDF
 */
export async function validatePdf(filePath) {
    try {
        const pdfBuffer = fs.readFileSync(filePath);
        
        // Check PDF magic number (PDF files start with %PDF-)
        const magicNumber = pdfBuffer.slice(0, 4).toString();
        if (magicNumber !== '%PDF') {
            return false;
        }

        // Try to parse without extracting text (faster validation)
        await pdfParse(pdfBuffer, { max: 1 });
        
        return true;
    } catch (error) {
        logger.warn(`PDF validation failed for ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Get PDF metadata
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<object>} - PDF metadata
 */
export async function getPdfMetadata(filePath) {
    try {
        const pdfBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(pdfBuffer, { max: 1 });
        
        return {
            pages: data.numpages,
            info: data.info,
            fileSize: pdfBuffer.length,
            version: data.version
        };
    } catch (error) {
        logger.error('Error getting PDF metadata:', error);
        throw error;
    }
}