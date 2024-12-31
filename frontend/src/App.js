import React, { useState } from 'react';
import './styles/App.css';

import { uploadPdf } from './services/api'; // Importe a função

function App() {
    const [file, setFile] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponseMessage('Uploading and converting...');

        try {
            const response = await uploadPdf(file); // Use a função aqui
            setResponseMessage(
                `Conversion complete! <a href="${response.data.downloadUrl}" target="_blank">Download here</a>`
            );
        } catch (error) {
            console.error(error);
            setResponseMessage('Failed to connect to the server. Please try again later.');
        }
    };

    return (
        <div className="App">
            <header>
                <h1>Converte Ai</h1>
                <p>Converta seus PDFs para Word de forma rápida e fácil!</p>
            </header>
            <main>
                <section>
                    <h2>Envie seu PDF</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />
                        <button type="submit">Converter</button>
                    </form>
                    {responseMessage && (
                        <p dangerouslySetInnerHTML={{ __html: responseMessage }} />
                    )}
                </section>
            </main>
            <footer>
                <p>© 2024 Converte AI - Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}

export default App;
