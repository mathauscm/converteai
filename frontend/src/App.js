import React, { useState } from 'react';
import './styles/App.css';
import axios from 'axios';

import { uploadPdf } from './services/api'; // Importe a função

function App() {
    const [file, setFile] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== "application/pdf") {
            setResponseMessage("Apenas arquivos PDF são aceitos.");
            return;
        }
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setResponseMessage("Por favor, selecione um arquivo antes de enviar.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("https://converteai.io/backend/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setResponseMessage(
                `Upload realizado com sucesso! <a href="${response.data.downloadUrl}" target="_blank">Baixar arquivo</a>`
            );
        } catch (error) {
            console.error("Erro no upload:", error);
            setResponseMessage("Erro ao realizar o upload. Verifique o arquivo e tente novamente.");
        }
    }


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
                <p>© 2024 mathaus.dev </p>
            </footer>
        </div>
    );
}

export default App;
