import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Performance monitoring
if (import.meta.env.DEV) {
    console.log('🚀 ConverteAI rodando em modo desenvolvimento com Vite')
}

// Verificar se elemento root existe
const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('Failed to find the root element')
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)