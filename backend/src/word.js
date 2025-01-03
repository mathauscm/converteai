// word.js
import { Document, Packer, Paragraph } from "docx";
import fs from "fs";
import path from "path";

export async function createWordDocument(textoExtraido) {
  // 1. Criar uma instância do Document
  const doc = new Document({
    sections: [
      {
        children: [
          // 2. Criar parágrafos com o texto
          new Paragraph(textoExtraido || "Sem conteúdo extraído..."),
        ],
      },
    ],
  });

  // 3. Converter em Buffer com o Packer
  const buffer = await Packer.toBuffer(doc);

  // 4. Definir nome e caminho do arquivo final
  const fileName = `converted-${Date.now()}.docx`;
  const convertedDir = path.join(path.resolve(), "uploads", "converted");
  const filePath = path.join(convertedDir, fileName);

  // 5. Escrever o buffer no arquivo .docx
  fs.writeFileSync(filePath, buffer);

  // 6. Retornar o caminho completo do arquivo
  return filePath;
}



// import fs from "fs/promises";
// import { Document, Packer, Paragraph, TextRun } from "docx";

// export async function createWordDocument(pdfText) {
//     const lines = pdfText.split("\n");
//     const content = lines.map((line) =>
//         new Paragraph({
//             children: [
//                 new TextRun({
//                     text: line,
//                     size: 24, // Ajuste o tamanho conforme necessário
//                 }),
//             ],
//         })
//     );

//     const doc = new Document({
//         sections: [{ children: content }],
//     });

//     const outputFilePath = `uploads/converted/converted-${Date.now()}.docx`;
//     const buffer = await Packer.toBuffer(doc);
//     await fs.writeFile(outputFilePath, buffer);
//     console.log("Documento criado com sucesso:", outputFilePath);
//     return outputFilePath;
// }