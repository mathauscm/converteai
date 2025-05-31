import axios from 'axios';
import { toast } from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const MAX_FILE_SIZE = parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10 * 1024 * 1024;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add request timestamp for performance monitoring
    config.metadata = { startTime: new Date() };
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate response time
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`);
    }
    
    return response;
  },
  (error) => {
    // Calculate response time for errors too
    if (error.config?.metadata?.startTime) {
      const endTime = new Date();
      const duration = endTime - error.config.metadata.startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ API Error: ${error.response?.status || 'Network'} ${error.config.url} (${duration}ms)`);
      }
    }
    
    // Handle different types of errors
    const errorMessage = getErrorMessage(error);
    
    // Don't show toast for certain errors (handled by components)
    const silentErrors = ['VALIDATION_ERROR', 'FILE_TOO_LARGE', 'INVALID_FILE_TYPE'];
    if (!silentErrors.includes(error.code)) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Extract user-friendly error message from error response
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
function getErrorMessage(error) {
  if (error.code === 'ECONNABORTED') {
    return 'Tempo limite da requisição excedido. Tente novamente.';
  }
  
  if (error.code === 'ERR_NETWORK') {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Dados inválidos enviados.';
      case 401:
        return 'Não autorizado. Faça login novamente.';
      case 403:
        return 'Acesso negado.';
      case 404:
        return 'Recurso não encontrado.';
      case 413:
        return 'Arquivo muito grande. Máximo permitido: 10MB.';
      case 429:
        return 'Muitas tentativas. Aguarde um momento e tente novamente.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      case 502:
      case 503:
      case 504:
        return 'Serviço temporariamente indisponível. Tente novamente.';
      default:
        return data.message || 'Erro inesperado. Tente novamente.';
    }
  }
  
  return 'Erro de conexão. Verifique sua internet.';
}

/**
 * Upload file for conversion
 * @param {File} file - PDF file to upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise} - Upload promise
 */
export const uploadFile = async (file, onProgress) => {
  // Validate file before upload
  const validation = validateFile(file);
  if (!validation.valid) {
    const error = new Error(validation.message);
    error.code = validation.code;
    throw error;
  }
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    
    return response;
  } catch (error) {
    // Add specific error handling for upload errors
    if (error.response?.status === 413) {
      error.code = 'FILE_TOO_LARGE';
    } else if (error.response?.data?.message?.includes('PDF')) {
      error.code = 'INVALID_FILE_TYPE';
    }
    
    throw error;
  }
};

/**
 * Download converted file
 * @param {string} filename - Name of the file to download
 * @returns {Promise} - Download promise
 */
export const downloadFile = async (filename) => {
  try {
    const response = await api.get(`/api/download/${filename}`, {
      responseType: 'blob',
      timeout: 30000, // 30 seconds for download
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response;
  } catch (error) {
    if (error.response?.status === 404) {
      toast.error('Arquivo não encontrado. Tente converter novamente.');
    }
    throw error;
  }
};

/**
 * Get API health status
 * @returns {Promise} - Health check promise
 */
export const getHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateFile = (file) => {
  if (!file) {
    return {
      valid: false,
      message: 'Nenhum arquivo selecionado.',
      code: 'NO_FILE'
    };
  }
  
  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      message: 'Apenas arquivos PDF são aceitos.',
      code: 'INVALID_FILE_TYPE'
    };
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.pdf')) {
    return {
      valid: false,
      message: 'Arquivo deve ter extensão .pdf.',
      code: 'INVALID_FILE_EXTENSION'
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `Arquivo muito grande. Máximo permitido: ${formatFileSize(MAX_FILE_SIZE)}.`,
      code: 'FILE_TOO_LARGE'
    };
  }
  
  // Check minimum file size
  if (file.size < 100) {
    return {
      valid: false,
      message: 'Arquivo muito pequeno ou corrompido.',
      code: 'FILE_TOO_SMALL'
    };
  }
  
  // Check filename length
  if (file.name.length > 255) {
    return {
      valid: false,
      message: 'Nome do arquivo muito longo.',
      code: 'FILENAME_TOO_LONG'
    };
  }
  
  return { valid: true };
};

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
 * Check if file type is valid
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
 * Get file information
 * @param {File} file - File to analyze
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
    isValid: validateFile(file).valid
  };
};

// Export the axios instance for direct use if needed
export default api;