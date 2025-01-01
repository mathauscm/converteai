import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet'; // Proteção adicional para o servidor
import { extractPdf } from './app.js';
import { createWordDocument } from './word.js';

const app = express();

// Middleware de segurança
app.use(helmet());

// Configurar CORS
app.use(cors({
    origin: 'http://localhost:3000', // Permitir requisições do frontend local
    methods: ['POST', 'GET'],       // Métodos permitidos
    allowedHeaders: ['Content-Type'], // Cabeçalhos permitidos
}));

// Verificar e criar diretórios necessários
const convertedDir = path.join(process.cwd(), 'uploads', 'converted');
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir, { recursive: true });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Middleware
app.use(express.json());

// Configuração do armazenamento com Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
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
    console.log('Headers:', req.headers); // Log dos cabeçalhos
    console.log('Body:', req.body);       // Log do corpo da requisição
    console.log('File:', req.file);       // Log do arquivo recebido

    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    try {
        const filePath = path.join(process.cwd(), 'uploads', req.file.filename);

        // Extrai texto do PDF
        const pdfText = await extractPdf(filePath);

        // Cria o arquivo Word com o texto extraído
        const wordFilePath = await createWordDocument(pdfText);

        res.json({
            message: 'Conversão realizada com sucesso!',
            downloadUrl: `http://localhost:5000/download/${path.basename(wordFilePath)}`
        });
    } catch (error) {
        console.error('Erro durante o processamento:', error.message, error.stack);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota de download
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'converted', filename);

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
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
