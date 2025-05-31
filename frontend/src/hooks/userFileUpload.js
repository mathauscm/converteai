import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { uploadFile } from '../services/api';
import { validateFile, getFileInfo } from '../utils/fileUtils';

/**
 * Custom hook para gerenciar upload de arquivos
 * Centraliza toda a lógica de upload, validação e estados
 */
const useFileUpload = () => {
  // Estados do upload
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Selecionar arquivo para upload
   */
  const selectFile = useCallback((selectedFile) => {
    if (!selectedFile) {
      setError('Nenhum arquivo selecionado');
      return false;
    }

    // Validar arquivo
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      const errorMessage = validation.errors[0];
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }

    // Arquivo válido
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setProgress(0);
    
    toast.success('Arquivo selecionado com sucesso!');
    return true;
  }, []);

  /**
   * Fazer upload do arquivo
   */
  const startUpload = useCallback(async () => {
    if (!file) {
      const errorMsg = 'Selecione um arquivo primeiro';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Callback para atualizar progresso
      const onProgress = (progressValue) => {
        setProgress(progressValue);
      };

      // Fazer upload
      const response = await uploadFile(file, onProgress);
      
      // Upload bem-sucedido
      setProgress(100);
      setResult(response.data);
      setUploading(false);
      
      toast.success('Conversão realizada com sucesso!');
      return true;

    } catch (uploadError) {
      setUploading(false);
      setProgress(0);
      
      const errorMessage = uploadError.response?.data?.message || 
                          uploadError.message || 
                          'Erro ao converter arquivo. Tente novamente.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [file]);

  /**
   * Resetar estado do upload
   */
  const resetUpload = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setUploading(false);
  }, []);

  /**
   * Remover arquivo selecionado
   */
  const removeFile = useCallback(() => {
    setFile(null);
    setError(null);
    setProgress(0);
  }, []);

  /**
   * Baixar arquivo convertido
   */
  const downloadResult = useCallback(() => {
    if (!result?.downloadUrl) {
      toast.error('Nenhum arquivo disponível para download');
      return false;
    }

    try {
      // Criar link de download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename || 'converted.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download iniciado!');
      return true;
    } catch (downloadError) {
      toast.error('Erro ao fazer download do arquivo');
      return false;
    }
  }, [result]);

  /**
   * Validar arquivo sem selecioná-lo
   */
  const validateFileOnly = useCallback((fileToValidate) => {
    return validateFile(fileToValidate);
  }, []);

  /**
   * Obter informações do arquivo atual
   */
  const getFileDetails = useCallback(() => {
    if (!file) return null;
    return getFileInfo(file);
  }, [file]);

  /**
   * Verificar se pode fazer upload
   */
  const canUpload = useCallback(() => {
    return file && !uploading && !result;
  }, [file, uploading, result]);

  /**
   * Verificar se upload está em progresso
   */
  const isUploading = useCallback(() => {
    return uploading;
  }, [uploading]);

  /**
   * Verificar se há resultado disponível
   */
  const hasResult = useCallback(() => {
    return Boolean(result);
  }, [result]);

  /**
   * Verificar se há erro
   */
  const hasError = useCallback(() => {
    return Boolean(error);
  }, [error]);

  /**
   * Obter progresso formatado
   */
  const getFormattedProgress = useCallback(() => {
    return `${Math.round(progress)}%`;
  }, [progress]);

  /**
   * Obter status atual do upload
   */
  const getUploadStatus = useCallback(() => {
    if (uploading) return 'uploading';
    if (result) return 'completed';
    if (error) return 'error';
    if (file) return 'ready';
    return 'idle';
  }, [uploading, result, error, file]);

  // Retornar API do hook
  return {
    // Estados
    file,
    uploading,
    progress,
    result,
    error,
    
    // Ações principais
    selectFile,
    startUpload,
    resetUpload,
    removeFile,
    downloadResult,
    
    // Utilitários
    validateFileOnly,
    getFileDetails,
    
    // Verificações de estado
    canUpload,
    isUploading,
    hasResult,
    hasError,
    getFormattedProgress,
    getUploadStatus
  };
};

export default useFileUpload;