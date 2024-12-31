<<<<<<< HEAD
# converteai
Conversor de formatos
=======
# **Converte AI**

**Converte AI** é uma aplicação que permite converter arquivos PDF em documentos Word de forma rápida e fácil. A aplicação possui uma interface intuitiva em React no frontend e uma API Node.js no backend para processar os arquivos.

---

## 🌟 **Funcionalidades**
- Upload de arquivos PDF.
- Conversão de PDFs para Word.
- Download do arquivo convertido.

---

## 🛠️ **Pré-requisitos**
Certifique-se de ter as ferramentas abaixo instaladas:
- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **Git**

---

## 📁 **Estrutura do Projeto**
```plaintext
ConverteAI/
├── backend/          # API em Node.js para conversão de arquivos
│   ├── src/
│   │   └── server.js # Lógica do servidor
│   ├── files/        # Armazena arquivos temporários gerados
│   ├── package.json
│   └── ...
├── frontend/         # Interface do usuário em React
│   ├── src/
│   │   ├── App.js
│   │   ├── services/
│   │   │   └── api.js # Chamadas à API do backend
│   │   └── styles/
│   │       └── App.css
│   ├── package.json
│   └── ...
├── .gitignore        # Ignora arquivos desnecessários para o repositório
└── README.md         # Este arquivo



🚀 Como Rodar o Projeto
1. Clone o Repositório

git clone https://github.com/seu-usuario/converte-ai.git

cd converte-ai

2. Configuração do Backend
Navegue até a pasta backend:

cd backend

Instale as dependências:

npm install
Inicie o servidor:

npm start
O servidor será iniciado em http://localhost:5000.

3. Configuração do Frontend
Navegue até a pasta frontend:

cd ../frontend

Instale as dependências:

npm install

Inicie o servidor:

npm start
Acesse o frontend em http://localhost:3000.


💻 Tecnologias Utilizadas
Frontend: React, Axios, HTML, CSS.
Backend: Node.js, Express, pdf-lib, docx.
Outros: CORS, File Upload.


🤝 Como Contribuir

Faça um fork do repositório.

Crie uma nova branch para suas alterações:
git checkout -b minha-feature

Faça suas alterações e adicione os commits:
git commit -m "Minha nova feature"

Envie suas alterações:
git push origin minha-feature

Abra um pull request.


📄 Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para mais informações.

📬 Contato
Em caso de dúvidas ou sugestões, entre em contato:

Email: developer@mathaus.dev
© 2024 mathaus.dev
>>>>>>> e7201cc (Primeiro commit do projeto ConverteAI)
