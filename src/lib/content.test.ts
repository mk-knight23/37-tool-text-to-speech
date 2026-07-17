import { describe, expect, it } from "vitest";
import { GUIDES, USE_CASES, getGuide, getUseCase } from "./content";

describe("content registry invariants", () => {
  it("has at least 8 guides (STANDARDS §4)", () => {
    expect(GUIDES.length).toBeGreaterThanOrEqual(8);
  });

  it("has at least 5 use-cases (STANDARDS §4)", () => {
    expect(USE_CASES.length).toBeGreaterThanOrEqual(5);
  });

  it("uses unique slugs across the whole registry", () => {
    // Arrange
    const slugs = [...GUIDES, ...USE_CASES].map((entry) => entry.slug);

    // Act
    const unique = new Set(slugs);

    // Assert
    expect(unique.size).toBe(slugs.length);
  });

  it("gives every entry a non-empty title, description and excerpt", () => {
    for (const entry of [...GUIDES, ...USE_CASES]) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.excerpt.length).toBeGreaterThan(0);
      expect(entry.minutes).toBeGreaterThan(0);
    }
  });

  it("uses unique descriptions per entry (unique meta descriptions for SEO)", () => {
    const descriptions = [...GUIDES, ...USE_CASES].map((e) => e.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("dates every entry as an ISO YYYY-MM-DD string", () => {
    for (const entry of [...GUIDES, ...USE_CASES]) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("getGuide / getUseCase", () => {
  it("finds an existing guide by slug", () => {
    expect(getGuide("choosing-a-voice")?.slug).toBe("choosing-a-voice");
  });

  it("returns undefined for an unknown guide slug", () => {
    expect(getGuide("does-not-exist")).toBeUndefined();
  });

  it("finds an existing use-case by slug", () => {
    expect(getUseCase("proofreading-by-ear")?.slug).toBe("proofreading-by-ear");
  });

  it("returns undefined for an unknown use-case slug", () => {
    expect(getUseCase("nope")).toBeUndefined();
  });
});
