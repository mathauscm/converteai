import fs from "fs/promises";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function createWordDocument(pdfText) {
    const lines = pdfText.split("\n");
    const content = lines.map((line) =>
        new Paragraph({
            children: [
                new TextRun({
                    text: line,
                    size: 24, // Ajuste o tamanho conforme necessário
                }),
            ],
        })
    );

    const doc = new Document({
        sections: [{ children: content }],
    });

    const outputFilePath = `uploads/converted/converted-${Date.now()}.docx`;
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputFilePath, buffer);
    console.log("Documento criado com sucesso:", outputFilePath);
    return outputFilePath;
}