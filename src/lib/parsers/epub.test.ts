import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { parseEpub } from "./epub";

describe("parseEpub", () => {
  it("resolves container, spine manifest, and extracts text and headings", async () => {
    const zip = new JSZip();
    
    const containerXml = `
      <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>
    `;
    
    const opfXml = `
      <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
        <metadata>
          <title>Mock Book</title>
        </metadata>
        <manifest>
          <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
        </manifest>
        <spine>
          <itemref idref="ch1"/>
        </spine>
      </package>
    `;
    
    const ch1Html = `
      <?xml version="1.0" encoding="utf-8"?>
      <!DOCTYPE html>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><title>Chapter 1</title></head>
        <body>
          <h1>First Chapter Title</h1>
          <p>This is the first chapter body content.</p>
        </body>
      </html>
    `;
    
    zip.file("META-INF/container.xml", containerXml.trim());
    zip.file("OEBPS/content.opf", opfXml.trim());
    zip.file("OEBPS/ch1.xhtml", ch1Html.trim());
    
    const blob = await zip.generateAsync({ type: "blob" });
    const file = new File([blob], "test.epub", {
      type: "application/epub+zip",
    });
    
    const result = await parseEpub(file);
    expect(result.text).toContain("First Chapter Title");
    expect(result.text).toContain("first chapter body content");
    expect(result.headings).toHaveLength(1);
    expect(result.headings?.[0].title).toBe("First Chapter Title");
    expect(result.headings?.[0].level).toBe(1);
  });
});
