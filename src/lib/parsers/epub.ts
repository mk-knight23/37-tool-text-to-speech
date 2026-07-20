import JSZip from "jszip";
import type { ImportResult } from "./file";

export async function parseEpub(file: File): Promise<ImportResult> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // 1. Read container.xml to locate the content.opf file
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) {
    throw new Error("Invalid EPUB: META-INF/container.xml not found.");
  }
  const containerText = await containerFile.async("text");
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerText, "application/xml");
  const rootfile = containerDoc.getElementsByTagName("rootfile")[0];
  if (!rootfile) {
    throw new Error("Invalid EPUB: rootfile not found in container.");
  }
  const opfPath = rootfile.getAttribute("full-path");
  if (!opfPath) {
    throw new Error("Invalid EPUB: rootfile full-path not specified.");
  }

  // 2. Read content.opf
  const opfFile = zip.file(opfPath);
  if (!opfFile) {
    throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`);
  }
  const opfText = await opfFile.async("text");
  const opfDoc = parser.parseFromString(opfText, "application/xml");

  // Resolve directories
  const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/")) || "";
  const resolvePath = (relative: string) => {
    if (!opfDir) return relative;
    const parts = (opfDir + "/" + relative).split("/");
    const stack: string[] = [];
    for (const part of parts) {
      if (part === "." || part === "") continue;
      if (part === "..") {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return stack.join("/");
  };

  // 3. Map manifest elements
  const items = opfDoc.getElementsByTagName("item");
  const manifest: Record<string, string> = {};
  for (let i = 0; i < items.length; i++) {
    const id = items[i].getAttribute("id");
    const href = items[i].getAttribute("href");
    if (id && href) {
      manifest[id] = resolvePath(decodeURIComponent(href));
    }
  }

  // 4. Resolve spine ordering
  const itemrefs = opfDoc.getElementsByTagName("itemref");
  const spinePaths: string[] = [];
  for (let i = 0; i < itemrefs.length; i++) {
    const idref = itemrefs[i].getAttribute("idref");
    if (idref && manifest[idref]) {
      spinePaths.push(manifest[idref]);
    }
  }

  // 5. Compile content from XHTML documents
  const headings: Array<{ title: string; charIndex: number; level: number }> = [];
  let cumulativeText = "";

  function walkNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      cumulativeText += node.textContent || "";
      return;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tagName = el.tagName.toUpperCase();
      
      if (tagName === "SCRIPT" || tagName === "STYLE" || tagName === "HEAD") {
        return;
      }
      
      const headingMatch = tagName.match(/^H([1-6])$/);
      let headingStart = -1;
      if (headingMatch) {
        headingStart = cumulativeText.length;
      }
      
      const isBlock = [
        "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", 
        "LI", "BR", "BLOCKQUOTE", "SECTION", "ARTICLE", "TITLE"
      ].includes(tagName);
      
      for (let i = 0; i < el.childNodes.length; i++) {
        walkNode(el.childNodes[i]);
      }
      
      if (headingMatch && headingStart >= 0) {
        const headingText = cumulativeText.substring(headingStart).trim();
        if (headingText) {
          headings.push({
            title: headingText,
            charIndex: headingStart,
            level: parseInt(headingMatch[1], 10),
          });
        }
      }
      
      if (isBlock && !cumulativeText.endsWith("\n\n")) {
        if (cumulativeText.endsWith("\n")) {
          cumulativeText += "\n";
        } else if (cumulativeText.length > 0) {
          cumulativeText += "\n\n";
        }
      }
    }
  }

  for (const path of spinePaths) {
    const spineFile = zip.file(path);
    if (!spineFile) continue;
    
    const htmlText = await spineFile.async("text");
    const doc = parser.parseFromString(htmlText, "text/html");
    const body = doc.body || doc.documentElement;
    
    walkNode(body);
    
    // Add page separator spacing
    if (cumulativeText.length > 0 && !cumulativeText.endsWith("\n\n")) {
      cumulativeText += "\n\n";
    }
  }

  return {
    text: cumulativeText.trim(),
    chapters: [],
    kind: "epub",
    fileName: file.name,
    headings,
  };
}
