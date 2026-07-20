import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function isPrivateUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  ) {
    return true;
  }
  
  // Exclude private IP ranges (10.x.x.x, 192.168.x.x, 169.254.x.x)
  if (
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("169.254.")
  ) {
    return true;
  }
  
  // Exclude 172.16.0.0 - 172.31.255.255
  const parts = hostname.split(".");
  if (parts.length === 4 && parts[0] === "172") {
    const secondPart = parseInt(parts[1], 10);
    if (secondPart >= 16 && secondPart <= 31) {
      return true;
    }
  }
  
  return false;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrlStr = searchParams.get("url");

  if (!targetUrlStr) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter." },
      { status: 400 }
    );
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(targetUrlStr);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL format." },
      { status: 400 }
    );
  }

  // Enforce HTTP/HTTPS protocol
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return NextResponse.json(
      { error: "URL protocol must be http or https." },
      { status: 400 }
    );
  }

  // SSRF Protection
  if (isPrivateUrl(targetUrl)) {
    return NextResponse.json(
      { error: "Fetching from internal or private network addresses is forbidden." },
      { status: 403 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 MKVoiceKit/2.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL. Server returned status: ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml") &&
      !contentType.includes("text/plain")
    ) {
      return NextResponse.json(
        { error: "Requested resource is not a readable HTML webpage." },
        { status: 415 }
      );
    }

    const html = await response.text();

    // Enforce size limit (2MB max page text size)
    if (html.length > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Webpage exceeds maximum allowed size (2 MB)." },
        { status: 413 }
      );
    }

    // Extract Title
    let title = targetUrl.hostname;
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = decodeEntities(titleMatch[1].trim());
    }

    // Clean HTML content
    let text = html;
    
    // Strip non-content blocks
    text = text.replace(
      /<(script|style|noscript|svg|iframe|header|footer|nav|form|aside)[^>]*>([\s\S]*?)<\/\1>/gi,
      ""
    );
    
    // Replace structural tags with double newlines
    text = text.replace(
      /<\/(p|div|h[1-6]|li|tr|blockquote|section|article|ol|ul|thead|tbody)>/gi,
      "\n\n"
    );
    text = text.replace(/<br\s*\/?>/gi, "\n");

    // Strip remaining tags
    text = text.replace(/<[^>]+>/g, "");

    // Decode HTML entities
    text = decodeEntities(text);

    // Normalize spacing and empty lines
    text = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n\n");

    if (text.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any readable text from this webpage." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      title,
      text,
      url: targetUrl.toString(),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Webpage fetch timed out after 6 seconds." },
        { status: 504 }
      );
    }
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: msg || "An unexpected error occurred while extracting the URL." },
      { status: 500 }
    );
  }
}
