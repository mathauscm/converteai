import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  File, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  Loader2
} from 'lucide-react';

import { uploadFile } from '../../services/api';
import { formatFileSize, validateFileType } from '../../utils/fileUtils';
// LoadingSpinner removido temporariamente - usando Loader2 do Lucide React

import styles from './FileUpload.module.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('Arquivo muito grande. Máximo permitido: 10MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('Apenas arquivos PDF são aceitos');
      } else {
        toast.error('Erro ao processar arquivo');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Additional client-side validation
      if (!validateFileType(selectedFile)) {
        toast.error('Apenas arquivos PDF são aceitos');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
      toast.success('Arquivo selecionado com sucesso!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await uploadFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setResult(response.data);
        setUploading(false);
        toast.success('Conversão realizada com sucesso!');
      }, 500);

    } catch (error) {
      setUploading(false);
      setProgress(0);
      
      const errorMessage = error.response?.data?.message || 
                          'Erro ao converter arquivo. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setUploading(false);
  };

  const handleDownload = () => {
    if (result?.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename || 'converted.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download iniciado!');
    }
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!file && !result && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${
                isDragActive ? styles.dragActive : ''
              }`}
            >
              <input {...getInputProps()} />
              <div className={styles.dropzoneContent}>
                <motion.div
                  animate={{ 
                    scale: isDragActive ? 1.1 : 1,
                    rotate: isDragActive ? 5 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload size={48} className={styles.uploadIcon} />
                </motion.div>
                
                <h3>
                  {isDragActive
                    ? 'Solte o arquivo aqui'
                    : 'Arraste um PDF ou clique para selecionar'
                  }
                </h3>
                
                <p className={styles.dropzoneSubtext}>
                  Máximo 10MB • Apenas arquivos PDF
                </p>
                
                <button type="button" className={styles.selectButton}>
                  Selecionar Arquivo
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {file && !result && (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.fileCard}
          >
            <div className={styles.fileInfo}>
              <FileText size={32} className={styles.fileIcon} />
              <div className={styles.fileDetails}>
                <h4>{file.name}</h4>
                <p>{formatFileSize(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={handleReset}
                  className={styles.removeButton}
                  aria-label="Remover arquivo"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {uploading && (
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <motion.div
                    className={styles.progressFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className={styles.progressText}>
                  {Math.round(progress)}%
                </span>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.errorMessage}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <div className={styles.actions}>
              {!uploading && !error && (
                <button
                  onClick={handleUpload}
                  className={styles.convertButton}
                >
                  <Upload size={20} />
                  Converter para Word
                </button>
              )}

              {uploading && (
                <button className={styles.convertButton} disabled>
                  <Loader2 size={20} className={styles.spinner} />
                  Convertendo...
                </button>
              )}

              {error && (
                <button
                  onClick={handleUpload}
                  className={styles.retryButton}
                >
                  Tentar Novamente
                </button>
              )}
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.resultCard}
          >
            <div className={styles.successHeader}>
              <CheckCircle size={32} className={styles.successIcon} />
              <div>
                <h3>Conversão Concluída!</h3>
                <p>Seu arquivo está pronto para download</p>
              </div>
            </div>

            <div className={styles.resultInfo}>
              <div className={styles.resultStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Arquivo original:</span>
                  <span className={styles.statValue}>
                    {formatFileSize(result.originalSize)}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Texto extraído:</span>
                  <span className={styles.statValue}>
                    {result.textLength?.toLocaleString()} caracteres
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                onClick={handleDownload}
                className={styles.downloadButton}
              >
                <Download size={20} />
                Baixar Word
              </button>
              
              <button
                onClick={handleReset}
                className={styles.newConversionButton}
              >
                Nova Conversão
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;