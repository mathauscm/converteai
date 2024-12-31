import React from 'react';
import ReactDOM from 'react-dom/client'; // Atualizado para React 18
import './index.css';
import App from './App';

// Use createRoot em vez de render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
