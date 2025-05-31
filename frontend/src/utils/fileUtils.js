/**
 * Frontend file utilities
 */

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file type is valid PDF
 * @param {File} file - File to check
 * @returns {boolean} - True if valid PDF
 */
export const validateFileType = (file) => {
  if (!file) return false;
  
  // Check MIME type
  if (file.type !== 'application/pdf') return false;
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.pdf')) return false;
  
  return true;
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension (lowercase)
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} - Validation result
 */
export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  const errors = [];
  
  if (!file) {
    errors.push('Nenhum arquivo selecionado');
    return { valid: false, errors };
  }
  
  // Check file type
  if (!validateFileType(file)) {
    errors.push('Apenas arquivos PDF são aceitos');
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`);
  }
  
  // Check minimum size
  if (file.size < 100) {
    errors.push('Arquivo muito pequeno ou corrompido');
  }
  
  // Check filename length
  if (file.name.length > 255) {
    errors.push('Nome do arquivo muito longo');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generate a safe filename
 * @param {string} filename - Original filename
 * @returns {string} - Safe filename
 */
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

/**
 * Get file info object
 * @param {File} file - File object
 * @returns {Object} - File information
 */
export const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
    formattedSize: formatFileSize(file.size),
    extension: getFileExtension(file.name),
    isValid: validateFileType(file)
  };
};

/**
 * Create download link and trigger download
 * @param {string} url - Download URL
 * @param {string} filename - Filename for download
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Convert File to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} - File content as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Check if browser supports File API
 * @returns {boolean} - True if supported
 */
export const isFileAPISupported = () => {
  return window.File && window.FileReader && window.FileList && window.Blob;
};

/**
 * Get MIME type from file extension
 * @param {string} filename - Filename
 * @returns {string} - MIME type
 */
export const getMimeTypeFromExtension = (filename) => {
  const extension = getFileExtension(filename);
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};