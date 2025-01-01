// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Rota de upload (simulada)
// app.post('/upload', (req, res) => {
//     res.json({ downloadUrl: 'http://localhost:5000/download/sample.docx' });
// });

// // Rota de download
// app.get('/download/:filename', (req, res) => {
//     const filename = req.params.filename;
//     const filePath = path.join(__dirname, 'files', filename);

//     res.download(filePath, (err) => {
//         if (err) {
//             console.error(err);
//             res.status(404).send('File not found');
//         }
//     });
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });