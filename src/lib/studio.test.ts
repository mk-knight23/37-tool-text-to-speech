import { describe, it, expect } from "vitest";
import { libraryItemSchema, type LibraryItem } from "./storage";

describe("Voice Studio Project Schema", () => {
  it("validates a complete project item successfully", () => {
    const mockProject: LibraryItem = {
      id: "proj-1",
      type: "project",
      title: "Marketing Script",
      content: "First line.\n\nSecond line.",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archived: false,
      tags: ["test"],
      scenes: [
        {
          id: "s1",
          text: "First line.",
          voiceURI: "Google US English",
          rate: 1.2,
          pitch: 1.0,
          volume: 0.9,
          pauseAfterSeconds: 2.0,
        },
        {
          id: "s2",
          text: "Second line.",
          voiceURI: "Google UK English Female",
          rate: 1.0,
          pitch: 1.1,
          volume: 1.0,
          pauseAfterSeconds: 0.5,
        },
      ],
      backgroundMusic: {
        fileName: "ambient.mp3",
        volume: 0.25,
        duckPercent: 70,
        loop: true,
        audioBlob: null,
      },
    };

    const result = libraryItemSchema.safeParse(mockProject);
    expect(result.success).toBe(true);
  });

  it("applies schema defaults correctly", () => {
    const mockProject = {
      id: "proj-2",
      type: "project",
      title: "Shorts Mix",
      content: "Script text",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      scenes: [],
      backgroundMusic: {
        fileName: "music.mp3",
        volume: 0.5,
      },
    };

    const result = libraryItemSchema.safeParse(mockProject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.archived).toBe(false);
      expect(result.data.backgroundMusic?.loop).toBe(true);
      expect(result.data.backgroundMusic?.duckPercent).toBe(50);
    }
  });
});

function moveItem<T>(arr: T[], index: number, direction: "up" | "down"): T[] {
  if (direction === "up" && index === 0) return arr;
  if (direction === "down" && index === arr.length - 1) return arr;
  const targetIdx = direction === "up" ? index - 1 : index + 1;
  const updated = [...arr];
  const temp = updated[index];
  updated[index] = updated[targetIdx];
  updated[targetIdx] = temp;
  return updated;
}

describe("Timeline Reordering", () => {
  it("moves items up or down correctly", () => {
    const list = ["A", "B", "C"];

    // Move B up -> should become ["B", "A", "C"]
    expect(moveItem(list, 1, "up")).toEqual(["B", "A", "C"]);

    // Move B down -> should become ["A", "C", "B"]
    expect(moveItem(list, 1, "down")).toEqual(["A", "C", "B"]);

    // Boundaries: A up should do nothing
    expect(moveItem(list, 0, "up")).toEqual(["A", "B", "C"]);

    // Boundaries: C down should do nothing
    expect(moveItem(list, 2, "down")).toEqual(["A", "B", "C"]);
  });
});
