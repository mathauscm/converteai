import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUniqueFilename } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a Word document from extracted text
 * @param {string} text - Text content to convert
 * @param {object} options - Formatting options
 * @returns {Promise<string>} - Path to the created Word document
 */
export async function createWordDocument(text, options = {}) {
    try {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text content provided');
        }

        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
            throw new Error('Text content is empty');
        }

        logger.info(`Creating Word document from ${trimmedText.length} characters`);

        // Parse text into structured content
        const content = parseTextContent(trimmedText, options);

        // Create document with metadata
        const doc = new Document({
            creator: 'ConverteAI',
            title: options.title || 'PDF Conversion',
            description: 'Document converted from PDF using ConverteAI',
            sections: [{
                properties: {},
                children: content
            }]
        });

        // Generate unique filename
        const filename = generateUniqueFilename('converted.docx');
        const convertedDir = path.join(__dirname, '..', '..', 'uploads', 'converted');
        const outputPath = path.join(convertedDir, filename);

        // Convert document to buffer
        const buffer = await Packer.toBuffer(doc);

        // Write file
        fs.writeFileSync(outputPath, buffer);

        logger.info(`Word document created successfully: ${filename}`);

        return outputPath;

    } catch (error) {
        logger.error('Error creating Word document:', error);
        throw error;
    }
}

/**
 * Parse text content into structured paragraphs
 * @param {string} text - Raw text content
 * @param {object} options - Parsing options
 * @returns {Array} - Array of document elements
 */
function parseTextContent(text, options = {}) {
    const lines = text.split('\n');
    const content = [];
    
    // Default formatting options
    const defaultOptions = {
        fontSize: 24, // 12pt (docx uses half-points)
        fontFamily: 'Calibri',
        lineSpacing: 1.2,
        preserveLineBreaks: true,
        detectHeadings: true,
        ...options
    };

    let currentParagraph = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines but preserve paragraph breaks
        if (line.length === 0) {
            if (currentParagraph.length > 0) {
                content.push(createParagraph(currentParagraph.join(' '), defaultOptions));
                currentParagraph = [];
            }
            continue;
        }

        // Detect potential headings
        if (defaultOptions.detectHeadings && isLikelyHeading(line, lines[i + 1])) {
            // Finish current paragraph if exists
            if (currentParagraph.length > 0) {
                content.push(createParagraph(currentParagraph.join(' '), defaultOptions));
                currentParagraph = [];
            }
            
            // Add heading
            content.push(createHeading(line, defaultOptions));
            continue;
        }

        // Accumulate lines for regular paragraphs
        currentParagraph.push(line);

        // If line ends with punctuation, create paragraph
        if (defaultOptions.preserveLineBreaks && 
            (line.endsWith('.') || line.endsWith('!') || line.endsWith('?') || line.endsWith(':'))) {
            content.push(createParagraph(currentParagraph.join(' '), defaultOptions));
            currentParagraph = [];
        }
    }

    // Add remaining content as final paragraph
    if (currentParagraph.length > 0) {
        content.push(createParagraph(currentParagraph.join(' '), defaultOptions));
    }

    // Ensure we have at least one paragraph
    if (content.length === 0) {
        content.push(createParagraph(text, defaultOptions));
    }

    return content;
}

/**
 * Create a regular paragraph
 * @param {string} text - Paragraph text
 * @param {object} options - Formatting options
 * @returns {Paragraph} - Docx Paragraph object
 */
function createParagraph(text, options) {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                size: options.fontSize,
                font: options.fontFamily
            })
        ],
        spacing: {
            line: Math.round(options.lineSpacing * 240), // Convert to twips
            after: 120 // 6pt spacing after paragraph
        }
    });
}

/**
 * Create a heading paragraph
 * @param {string} text - Heading text
 * @param {object} options - Formatting options
 * @returns {Paragraph} - Docx Paragraph object
 */
function createHeading(text, options) {
    return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_1,
        spacing: {
            before: 240, // 12pt before
            after: 120   // 6pt after
        }
    });
}

/**
 * Detect if a line is likely a heading
 * @param {string} line - Current line
 * @param {string} nextLine - Next line (for context)
 * @returns {boolean} - True if likely a heading
 */
function isLikelyHeading(line, nextLine) {
    // Skip very long lines (likely not headings)
    if (line.length > 100) return false;
    
    // Check for common heading patterns
    const headingPatterns = [
        /^[A-Z][A-Z\s]{2,}$/, // ALL CAPS
        /^\d+\.\s+[A-Z]/, // Numbered headings (1. Title)
        /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/, // Title Case
        /^Chapter\s+\d+/i, // Chapter X
        /^Section\s+\d+/i, // Section X
        /^[A-Z]+\s*:$/ // CATEGORY:
    ];

    // Check if line matches heading patterns
    const matchesPattern = headingPatterns.some(pattern => pattern.test(line));
    
    // Additional heuristics
    const isShort = line.length < 80;
    const noEndPunctuation = !line.endsWith('.') && !line.endsWith(',');
    const nextLineEmpty = !nextLine || nextLine.trim().length === 0;
    
    return matchesPattern || (isShort && noEndPunctuation && nextLineEmpty);
}

/**
 * Create a Word document with custom styling
 * @param {string} text - Text content
 * @param {object} style - Custom styling options
 * @returns {Promise<string>} - Path to created document
 */
export async function createStyledWordDocument(text, style = {}) {
    const options = {
        fontSize: style.fontSize || 24,
        fontFamily: style.fontFamily || 'Calibri',
        lineSpacing: style.lineSpacing || 1.2,
        title: style.title || 'Converted Document',
        preserveLineBreaks: style.preserveLineBreaks !== false,
        detectHeadings: style.detectHeadings !== false,
        ...style
    };

    return await createWordDocument(text, options);
}