# 🚀 ConverteAI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%3E%3D18.0.0-blue)](https://reactjs.org/)

**ConverteAI** é uma aplicação web moderna que permite converter arquivos PDF em documentos Word (.docx) de forma rápida, segura e eficiente. Com uma interface intuitiva e processamento otimizado, é a solução ideal para suas necessidades de conversão de documentos.

## ✨ Funcionalidades

- 📄 **Conversão PDF para Word** - Mantém formatação e estrutura
- 🚀 **Upload rápido** - Interface drag-and-drop intuitiva
- 🔒 **Segurança** - Rate limiting e validação robusta
- 📱 **Responsivo** - Funciona em desktop e mobile
- ⚡ **Performance** - Processamento otimizado e cache inteligente
- 🐳 **Docker** - Deploy simplificado com containers

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **pdf-parse** - Extração de texto de PDFs
- **docx** - Geração de documentos Word
- **Multer** - Upload de arquivos
- **Helmet** - Segurança HTTP

### Frontend
- **React 18** - Interface de usuário
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilização modular
- **React Hooks** - Gerenciamento de estado

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **GitHub Actions** - CI/CD
- **ESLint** - Linting de código

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js (v18.0.0 ou superior)
- npm ou yarn
- Docker (opcional)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/converteai.git
cd converteai
```

### 2. Configuração com Docker (Recomendado)

```bash
# Copie o arquivo de exemplo das variáveis de ambiente
cp .env.example .env

# Execute com docker-compose
docker-compose up --build
```

A aplicação estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### 3. Configuração Manual

#### Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute o servidor
npm run dev
```

#### Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute a aplicação
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAX_FILE_SIZE=10485760
```

## 📖 API Documentation

### POST /api/upload

Converte um arquivo PDF para Word.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (arquivo PDF)

**Response:**
```json
{
  "success": true,
  "message": "Conversão realizada com sucesso!",
  "downloadUrl": "/api/download/filename.docx",
  "fileId": "unique-file-id"
}
```

### GET /api/download/:filename

Baixa o arquivo convertido.

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Body: Arquivo Word binário

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Testes de integração
npm run test:integration
```

## 📦 Deploy

### Produção com Docker

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy Manual

1. Configure as variáveis de ambiente para produção
2. Build do frontend: `npm run build`
3. Execute o backend: `npm start`
4. Configure nginx ou apache como proxy reverso

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📋 Roadmap

- [ ] Suporte a múltiplos formatos (Excel, PowerPoint)
- [ ] OCR para PDFs escaneados
- [ ] API de conversão em lote
- [ ] Dashboard de usuário
- [ ] Integração com cloud storage
- [ ] Conversão em tempo real

## 🐛 Problemas Conhecidos

- Arquivos PDF muito grandes (>10MB) podem demorar para processar
- PDFs com imagens complexas podem perder formatação

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Matheus Carvalho**
- Website: [mathaus.dev](https://mathaus.dev)
- Email: developer@mathaus.dev
- GitHub: [mathauscm](https://github.com/mathauscm)

## 🙏 Agradecimentos

- [pdf-parse](https://github.com/modesty/pdf-parse) - Extração de texto de PDFs
- [docx](https://github.com/dolanmiu/docx) - Geração de documentos Word
- [React](https://reactjs.org/) - Framework frontend

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**