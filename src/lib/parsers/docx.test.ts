import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { parseDocx } from "./docx";

describe("parseDocx", () => {
  it("extracts text and style-based headings from docx structure", async () => {
    const zip = new JSZip();
    const documentXml = `
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Heading1"/>
            </w:pPr>
            <w:r>
              <w:t>Heading Chapter</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:r>
              <w:t>First sentence content.</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>
    `;
    zip.file("word/document.xml", documentXml);
    const blob = await zip.generateAsync({ type: "blob" });
    const file = new File([blob], "test.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const result = await parseDocx(file);
    expect(result.text).toContain("Heading Chapter");
    expect(result.text).toContain("First sentence content");
    expect(result.headings).toHaveLength(1);
    expect(result.headings?.[0].title).toBe("Heading Chapter");
    expect(result.headings?.[0].level).toBe(1);
  });
});
