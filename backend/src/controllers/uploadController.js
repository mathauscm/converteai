import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { validationResult } from 'express-validator';

import { extractPdf } from '../services/pdfService.js';
import { createWordDocument } from '../services/wordService.js';
import { cleanupFile, formatFileSize, scheduleCleanup } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controller para upload e conversão de arquivos
 */
class UploadController {
  /**
   * Upload e conversão de PDF para Word
   */
  async uploadAndConvert(req, res, next) {
    let tempFilePath = null;
    let convertedFilePath = null;
    const startTime = Date.now();
    
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Validation errors in upload', {
          errors: errors.array(),
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Verificar se arquivo foi enviado
      if (!req.file) {
        logger.warn('No file uploaded', { ip: req.ip });
        
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      tempFilePath = req.file.path;
      const fileInfo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      };

      logger.info('Processing file upload', {
        ...fileInfo,
        formattedSize: formatFileSize(req.file.size),
        ip: req.ip
      });

      // Extrair texto do PDF
      logger.info('Starting PDF text extraction', { filename: req.file.filename });
      const pdfText = await extractPdf(tempFilePath);
      
      if (!pdfText || pdfText.trim().length === 0) {
        logger.warn('No text content found in PDF', {
          filename: req.file.filename,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          message: 'Nenhum conteúdo de texto foi encontrado no PDF. O arquivo pode estar corrompido ou ser baseado em imagens.'
        });
      }

      logger.info('PDF text extracted successfully', {
        filename: req.file.filename,
        textLength: pdfText.length,
        textPreview: pdfText.substring(0, 100) + '...'
      });

      // Criar documento Word
      logger.info('Starting Word document creation', { filename: req.file.filename });
      convertedFilePath = await createWordDocument(pdfText, {
        title: path.parse(req.file.originalname).name
      });

      const convertedFilename = path.basename(convertedFilePath);
      const downloadUrl = `/api/download/${convertedFilename}`;

      // Calcular tempo de processamento
      const processingTime = Date.now() - startTime;

      logger.info('File conversion completed successfully', {
        originalFile: req.file.filename,
        convertedFile: convertedFilename,
        processingTime: `${processingTime}ms`,
        textLength: pdfText.length,
        ip: req.ip
      });

      // Agendar limpeza do arquivo temporário
      scheduleCleanup(tempFilePath, 5000); // 5 segundos

      // Agendar limpeza do arquivo convertido (1 hora)
      scheduleCleanup(convertedFilePath, 60 * 60 * 1000);

      // Resposta de sucesso
      res.json({
        success: true,
        message: 'Arquivo convertido com sucesso!',
        data: {
          downloadUrl,
          filename: convertedFilename,
          originalFilename: req.file.originalname,
          originalSize: req.file.size,
          formattedSize: formatFileSize(req.file.size),
          textLength: pdfText.length,
          processingTime: `${processingTime}ms`,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Upload processing error:', {
        error: error.message,
        stack: error.stack,
        filename: req.file?.filename,
        ip: req.ip,
        processingTime: `${Date.now() - startTime}ms`
      });

      // Limpar arquivos em caso de erro
      if (tempFilePath) await cleanupFile(tempFilePath);
      if (convertedFilePath) await cleanupFile(convertedFilePath);

      // Tratar erros específicos
      let statusCode = 500;
      let message = 'Erro interno no servidor durante o processamento do arquivo.';

      if (error.message.includes('PDF')) {
        statusCode = 400;
        if (error.message.includes('corrupted') || error.message.includes('invalid')) {
          message = 'O arquivo PDF parece estar corrompido ou inválido.';
        } else if (error.message.includes('Password')) {
          message = 'PDFs protegidos por senha não são suportados.';
        } else if (error.message.includes('No text content')) {
          message = 'Este PDF não contém texto legível. Pode ser um documento escaneado ou baseado em imagens.';
        } else {
          message = 'Erro ao processar o arquivo PDF.';
        }
      } else if (error.message.includes('Word') || error.message.includes('docx')) {
        statusCode = 500;
        message = 'Erro ao criar o documento Word.';
      } else if (error.code === 'ENOSPC') {
        statusCode = 507;
        message = 'Espaço insuficiente no servidor. Tente novamente mais tarde.';
      } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
        statusCode = 503;
        message = 'Servidor temporariamente sobrecarregado. Tente novamente em alguns minutos.';
      }

      res.status(statusCode).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });
    }
  }

  /**
   * Download de arquivo convertido
   */
  async downloadFile(req, res, next) {
    try {
      const { filename } = req.params;

      // Validação básica do filename
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        logger.security('Invalid download filename attempt', {
          filename,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          message: 'Nome de arquivo inválido'
        });
      }

      const convertedDir = path.join(__dirname, '..', '..', 'uploads', 'converted');
      const filePath = path.join(convertedDir, filename);

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        logger.warn('Download requested for non-existent file', {
          filename,
          ip: req.ip
        });
        
        return res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado. O arquivo pode ter expirado.'
        });
      }

      // Verificar se é realmente um arquivo (não diretório)
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        logger.security('Download attempt for non-file', {
          filename,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          message: 'Recurso inválido'
        });
      }

      logger.info('File download started', {
        filename,
        fileSize: formatFileSize(stats.size),
        ip: req.ip
      });

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Stream do arquivo
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        logger.error('File stream error during download:', {
          error: error.message,
          filename,
          ip: req.ip
        });
        
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Erro ao fazer download do arquivo'
          });
        }
      });

      fileStream.on('end', () => {
        logger.info('File download completed', {
          filename,
          ip: req.ip
        });
        
        // Agendar limpeza do arquivo após download (1 minuto)
        scheduleCleanup(filePath, 60000);
      });

      // Pipe do stream para a resposta
      fileStream.pipe(res);

    } catch (error) {
      logger.error('Download error:', {
        error: error.message,
        stack: error.stack,
        filename: req.params.filename,
        ip: req.ip
      });

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erro interno no servidor durante o download'
        });
      }
    }
  }

  /**
   * Verificar status de saúde do serviço
   */
  async healthCheck(req, res) {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      // Verificar diretórios de upload
      const uploadDir = path.join(__dirname, '..', '..', 'uploads');
      const tempDir = path.join(uploadDir, 'temp');
      const convertedDir = path.join(uploadDir, 'converted');
      
      const dirsStatus = {
        uploadDir: fs.existsSync(uploadDir),
        tempDir: fs.existsSync(tempDir),
        convertedDir: fs.existsSync(convertedDir)
      };

      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory: {
          used: formatFileSize(memoryUsage.heapUsed),
          total: formatFileSize(memoryUsage.heapTotal),
          rss: formatFileSize(memoryUsage.rss)
        },
        directories: dirsStatus,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });

    } catch (error) {
      logger.error('Health check error:', error);
      
      res.status(500).json({
        status: 'ERROR',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obter estatísticas do serviço (futuro)
   */
  async getStats(req, res) {
    try {
      // Por enquanto, estatísticas básicas
      // No futuro, pode integrar com banco de dados para métricas mais detalhadas
      
      const stats = {
        totalConversions: 'N/A', // Seria obtido do banco
        averageProcessingTime: 'N/A',
        popularFileTypes: ['PDF'],
        serverStats: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        }
      };

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Stats error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas'
      });
    }
  }
}

// Exportar instância do controller
export default new UploadController();