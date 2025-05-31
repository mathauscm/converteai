import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// Performance monitoring
if (import.meta.env.DEV) {
    console.log('🚀 ConverteAI rodando em modo desenvolvimento com Vite')
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)