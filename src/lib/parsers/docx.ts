import JSZip from "jszip";
import type { ImportResult } from "./file";

export async function parseDocx(file: File): Promise<ImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  const docXmlFile = zip.file("word/document.xml");
  if (!docXmlFile) {
    throw new Error("Invalid DOCX file: word/document.xml not found.");
  }
  
  const xmlText = await docXmlFile.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  
  // Verify xml document parsed successfully
  const parserError = xmlDoc.getElementsByTagName("parsererror");
  if (parserError.length > 0) {
    throw new Error("Error parsing DOCX XML document.");
  }

  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  let text = "";
  const headings: Array<{ title: string; charIndex: number; level: number }> = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    
    // Extract text in this paragraph
    const textElements = p.getElementsByTagName("w:t");
    let pText = "";
    for (let j = 0; j < textElements.length; j++) {
      pText += textElements[j].textContent || "";
    }
    
    if (pText.trim()) {
      // Check if it's a heading
      const pPr = p.getElementsByTagName("w:pPr")[0];
      let isHeading = false;
      let headingLevel = 1;
      
      if (pPr) {
        const pStyle = pPr.getElementsByTagName("w:pStyle")[0];
        if (pStyle) {
          const styleVal = pStyle.getAttribute("w:val") || "";
          const match = styleVal.match(/Heading(\d)/i);
          if (match) {
            isHeading = true;
            headingLevel = parseInt(match[1], 10);
          }
        }
      }
      
      if (isHeading) {
        headings.push({
          title: pText.trim(),
          charIndex: text.length,
          level: headingLevel,
        });
      }
      
      text += pText + "\n\n";
    }
  }
  
  return {
    text: text.trim(),
    chapters: [],
    kind: "docx",
    fileName: file.name,
    headings,
  };
}
