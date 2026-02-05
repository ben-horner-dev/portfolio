import { describe, expect, it, vi } from "vitest";
import { AgentGraphError } from "@/lib/explore/errors";

vi.mock("@/lib/explore/vector/getEmbeddings", () => ({
  getEmbeddings: vi.fn().mockResolvedValue({
    embedDocuments: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
  }),
}));

vi.mock("@/lib/neo4j", () => ({
  RELATIONSHIP_TYPES: {
    USES: "USES",
    DEMONSTRATES: "DEMONSTRATES",
    IMPLEMENTS: "IMPLEMENTS",
  },
}));

vi.mock("@/lib/logger", () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

describe("vectorSearch error handling", () => {
  it("should use embedDocuments fallback when embedQuery is not a function", async () => {
    const { embedQuery } = await import("../vectorSearch");

    const result = await embedQuery("test-model", "test query");

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it("should throw AgentGraphError when performVectorSearch fails", async () => {
    const { performVectorSearch } = await import("../vectorSearch");

    const mockSession = {
      run: vi.fn().mockRejectedValue(new Error("Query execution failed")),
      close: vi.fn(),
    };

    await expect(
      performVectorSearch(mockSession as never, [0.1], 10, {}),
    ).rejects.toThrow(AgentGraphError);

    await expect(
      performVectorSearch(mockSession as never, [0.1], 10, {}),
    ).rejects.toThrow("Vector search failed");
  });

  it("should handle non-Error throws in performVectorSearch", async () => {
    const { performVectorSearch } = await import("../vectorSearch");

    const mockSession = {
      run: vi.fn().mockRejectedValue("string error"),
      close: vi.fn(),
    };

    await expect(
      performVectorSearch(mockSession as never, [0.1], 10, {}),
    ).rejects.toThrow("Unknown error");
  });

  it("should merge results when existing entry found in mergeSearchResults", async () => {
    const { mergeSearchResults } = await import("../vectorSearch");

    const vectorResults = [
      {
        id: "shared-id",
        title: "Shared Project",
        description: "Desc",
        role: "dev",
        completedDate: "2024-01-01",
        complexity: 5,
        fileCount: 10,
        technologies: [],
        skills: [],
        patterns: [],
        resultType: "project",
        score: 0.8,
        matchType: "semantic" as const,
      },
    ];

    const graphResults = [
      {
        id: "shared-id",
        title: "Shared Project",
        description: "Desc",
        role: "dev",
        completedDate: "2024-01-01",
        complexity: 5,
        fileCount: 10,
        technologies: [],
        skills: [],
        patterns: [],
        resultType: "project",
        score: 0.6,
        matchType: "graph" as const,
      },
    ];

    const merged = mergeSearchResults(vectorResults, graphResults);

    expect(merged.length).toBe(1);
    expect(merged[0].matchType).toBe("hybrid");
    expect(merged[0].score).toBeGreaterThan(0.8);
  });
});
