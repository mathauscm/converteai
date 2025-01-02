import axios from 'axios';

export const uploadPdf = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Altere para o IP público da sua VPS ou o domínio
    const response = await axios.post('https://converteai.io/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response;
};
