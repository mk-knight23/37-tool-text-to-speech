import { describe, expect, it } from "vitest";
import {
  CAPABILITIES,
  CAPABILITY_IDS,
  DAILY_AI_LIMIT,
  MAX_INPUT_CHARS,
  capabilityGroups,
  getCapabilityMeta,
  isCapabilityId,
} from "./catalog";

describe("isCapabilityId", () => {
  it("accepts a known capability id", () => {
    expect(isCapabilityId("summarize")).toBe(true);
  });

  it("rejects an unknown id", () => {
    expect(isCapabilityId("make-coffee")).toBe(false);
  });
});

describe("CAPABILITIES catalog integrity", () => {
  it("defines one meta entry per declared id", () => {
    expect(CAPABILITIES).toHaveLength(CAPABILITY_IDS.length);
  });

  it("uses unique capability ids", () => {
    const ids = CAPABILITIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sets objectKind exactly when mode is 'object'", () => {
    for (const capability of CAPABILITIES) {
      if (capability.mode === "object") {
        expect(capability.objectKind).toBeDefined();
      } else {
        expect(capability.objectKind).toBeUndefined();
      }
    }
  });

  it("gives every capability a non-empty label and description", () => {
    for (const capability of CAPABILITIES) {
      expect(capability.label.length).toBeGreaterThan(0);
      expect(capability.description.length).toBeGreaterThan(0);
      expect(["fast", "quality"]).toContain(capability.tier);
    }
  });

  it("exposes sane shared limits", () => {
    expect(MAX_INPUT_CHARS).toBeGreaterThan(0);
    expect(DAILY_AI_LIMIT).toBeGreaterThan(0);
  });
});

describe("getCapabilityMeta", () => {
  it("returns the meta for a known id", () => {
    expect(getCapabilityMeta("translate").id).toBe("translate");
  });

  it("throws for an unknown id", () => {
    // @ts-expect-error deliberately passing an invalid id
    expect(() => getCapabilityMeta("nope")).toThrow(/Unknown capability/);
  });
});

describe("capabilityGroups", () => {
  it("groups capabilities without dropping or duplicating any", () => {
    // Act
    const groups = capabilityGroups();
    const flattened = groups.flatMap((g) => g.items);

    // Assert
    expect(flattened).toHaveLength(CAPABILITIES.length);
  });

  it("keeps group headings unique and in first-seen order", () => {
    const headings = capabilityGroups().map((g) => g.group);
    expect(new Set(headings).size).toBe(headings.length);
    expect(headings[0]).toBe(CAPABILITIES[0].group);
  });
});
