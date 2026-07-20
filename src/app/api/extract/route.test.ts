import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("GET /api/extract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 if url query parameter is missing", async () => {
    const req = new NextRequest("https://example.com/api/extract");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing 'url' query parameter");
  });

  it("returns 403 for private SSRF IP ranges", async () => {
    const req = new NextRequest("https://example.com/api/extract?url=http://127.0.0.1/admin");
    const res = await GET(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("forbidden");
  });

  it("extracts text and strips header/footer from html page", async () => {
    const mockHtml = `
      <html>
        <head><title>Clean Article Title</title></head>
        <body>
          <header>Navbar links</header>
          <main>
            <h1>Web Title</h1>
            <p>Readable context text block.</p>
          </main>
          <footer>Copyright rules</footer>
        </body>
      </html>
    `;
    const mockResponse = new Response(mockHtml, {
      headers: { "content-type": "text/html" },
      status: 200,
    });
    
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    const req = new NextRequest("https://example.com/api/extract?url=https://example.com/clean-article");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.title).toBe("Clean Article Title");
    expect(body.text).toContain("Web Title");
    expect(body.text).toContain("Readable context text block");
    expect(body.text).not.toContain("Navbar links");
    expect(body.text).not.toContain("Copyright rules");

    fetchSpy.mockRestore();
  });
});
