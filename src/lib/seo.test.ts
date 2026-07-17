import { describe, expect, it } from "vitest";
import { pageMetadata } from "./seo";
import { SITE } from "./site";

describe("pageMetadata", () => {
  it("uses the bare title on the home page and canonical '/'", () => {
    // Act
    const meta = pageMetadata({
      title: "MK VoiceKit",
      description: "A local-first text-to-speech workspace.",
    });

    // Assert
    expect(meta.title).toBe("MK VoiceKit");
    expect(meta.alternates?.canonical).toBe("/");
  });

  it("suffixes the site name and sets the path canonical for inner pages", () => {
    // Act
    const meta = pageMetadata({
      title: "Workspace",
      description: "The listening workspace.",
      path: "/tool",
    });

    // Assert
    expect(meta.title).toBe(`Workspace · ${SITE.name}`);
    expect(meta.alternates?.canonical).toBe("/tool");
  });

  it("mirrors title and description into Open Graph and Twitter cards", () => {
    // Act
    const meta = pageMetadata({
      title: "FAQ",
      description: "Common questions.",
      path: "/faq",
    });

    // Assert
    expect(meta.openGraph?.title).toBe(`FAQ · ${SITE.name}`);
    expect(meta.openGraph?.description).toBe("Common questions.");
    // Next's Twitter metadata is a union; narrow to read the card/title fields.
    const twitter = meta.twitter as { card?: string; title?: string } | null;
    expect(twitter?.card).toBe("summary_large_image");
    expect(twitter?.title).toBe(`FAQ · ${SITE.name}`);
  });
});
