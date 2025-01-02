import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import { extractPdf } from './app.js';
import { createWordDocument } from './word.js';

const app = express();

// Middleware de segurança
app.use(helmet());

// Configurar CORS para ambiente hospedado
app.use(cors({
    origin: 'https://converteai.io', // Permitir requisições do domínio hospedado
    methods: ['POST', 'GET'],       // Métodos permitidos
    allowedHeaders: ['Content-Type'], // Cabeçalhos permitidos
}));

// Garantir que o diretório uploads/converted exista
const __dirname = path.resolve(); // Resolve o diretório atual
const convertedDir = path.join(__dirname, 'uploads', 'converted');
const uploadDir = path.join(__dirname, 'uploads');

// Criar os diretórios necessários se não existirem
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Middleware
app.use(express.json());

// Configuração do armazenamento com Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Apenas arquivos PDF são permitidos."));
        }
        cb(null, true);
    }
});

// Rota de upload
app.post('/upload', upload.single('file'), async (req, res) => {
    console.log('Requisição recebida na rota /upload');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    try {
        const filePath = path.join(uploadDir, req.file.filename);

        // Extrai texto do PDF
        const pdfText = await extractPdf(filePath);

        // Cria o arquivo Word com o texto extraído
        const wordFilePath = await createWordDocument(pdfText);

        res.json({
            message: 'Conversão realizada com sucesso!',
            downloadUrl: `https://converteai.io/download/${path.basename(wordFilePath)}`
        });
    } catch (error) {
        console.error('Erro durante o processamento:', error.message, error.stack);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota de download
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(convertedDir, filename);

    res.download(filePath, (err) => {
        if (err) {
            console.error('Erro ao baixar o arquivo:', err);
            res.status(404).send('Arquivo não encontrado');
        }
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro capturado pelo middleware:', err.message);
    if (err instanceof multer.MulterError || err.message) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

// Iniciar o servidor
const PORT = 5000; // Certifique-se de que a porta 5000 esteja aberta no firewall
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
