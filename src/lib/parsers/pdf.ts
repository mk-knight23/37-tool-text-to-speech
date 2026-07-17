/**
 * Client-side PDF text extraction via pdfjs-dist.
 * The worker is served same-origin from /pdf.worker.min.mjs (vendored copy
 * of node_modules/pdfjs-dist/build/pdf.worker.min.mjs) so the strict CSP
 * (`worker-src 'self'`) holds. Scanned/no-text PDFs return empty text and
 * the UI shows an honest "no extractable text" state — no OCR in v1.
 */

export interface PdfExtraction {
  text: string;
  pages: number;
}

export async function extractPdfText(data: ArrayBuffer): Promise<PdfExtraction> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const loadingTask = pdfjs.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  try {
    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText.length > 0) pageTexts.push(pageText);
      page.cleanup();
    }
    return {
      text: pageTexts.join("\n\n").trim(),
      pages: pdfDocument.numPages,
    };
  } finally {
    // Destroying the loading task tears down the document and its worker.
    await loadingTask.destroy();
  }
}
