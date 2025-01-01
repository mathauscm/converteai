import { createRequire } from "module";
import fs from "fs";
import path from "path";

// Carrega e patcha o pdf-parse
function loadPdfParsePatched() {
    const require = createRequire(import.meta.url);
    const pdfParsePath = require.resolve("pdf-parse");
    let content = fs.readFileSync(pdfParsePath, "utf8");
    const dir = path.dirname(pdfParsePath);
    const patchedPath = path.join(dir, "pdf-parse-patched.js");
    fs.writeFileSync(patchedPath, content, "utf8");
    return require(patchedPath);
}

// Agora carregamos o pdf-parse “remendado”
const pdfParse = loadPdfParsePatched();

export async function extractPdf(filePath) {
    try {
        const pdfBuffer = fs.readFileSync(filePath);
        const textResult = await pdfParse(pdfBuffer);
        return textResult.text; // Retorna o texto extraído
    } catch (error) {
        console.error('Erro ao processar o PDF:', error);
        throw error;
    }
}