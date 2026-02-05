import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentGraphError } from "@/lib/explore/errors";

let mockGetNeogmaThrows = false;

vi.mock("@/lib/neo4j", () => ({
  getNeogma: vi.fn(() => {
    if (mockGetNeogmaThrows) {
      throw new Error("Connection failed");
    }
    return {
      driver: {
        session: vi.fn(() => ({
          run: vi.fn(),
          close: vi.fn(),
        })),
      },
    };
  }),
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

vi.mock("cohere-ai", () => ({
  CohereClient: class {
    rerank = vi.fn().mockResolvedValue({
      results: [{ index: 1 }, { index: 0 }, { index: 2 }],
    });
  },
}));

describe("utils error handling", () => {
  beforeEach(() => {
    mockGetNeogmaThrows = false;
    vi.clearAllMocks();
  });

  it("should throw AgentGraphError when getNeogma throws", async () => {
    mockGetNeogmaThrows = true;

    const { createNeo4jSession } = await import("../utils");

    expect(() => createNeo4jSession()).toThrow(AgentGraphError);
    expect(() => createNeo4jSession()).toThrow("Connection failed");
  });

  it("should throw AgentGraphError with default message for non-Error throws", async () => {
    const neo4jModule = await import("@/lib/neo4j");
    vi.mocked(neo4jModule.getNeogma).mockImplementation(() => {
      throw "string error";
    });

    const { createNeo4jSession } = await import("../utils");

    expect(() => createNeo4jSession()).toThrow(AgentGraphError);
    expect(() => createNeo4jSession()).toThrow(
      "Failed to initialize Neo4j connection",
    );
  });

  it("should rerank and reorder results with Cohere API", async () => {
    const originalEnv = process.env.COHERE_API_KEY;
    process.env.COHERE_API_KEY = "test-api-key";

    try {
      const { rerankResults } = await import("../utils");

      const mockResults = [
        {
          id: "0",
          title: "First",
          description: "First desc",
          role: "dev",
          completedDate: "2024-01-01",
          complexity: 5,
          fileCount: 10,
          technologies: ["React"],
          skills: ["Frontend"],
          patterns: [],
          resultType: "project",
          score: 0.9,
        },
        {
          id: "1",
          title: "Second",
          description: "Second desc",
          role: "dev",
          completedDate: "2024-01-02",
          complexity: 4,
          fileCount: 8,
          technologies: ["TypeScript"],
          skills: ["Backend"],
          patterns: [],
          resultType: "project",
          score: 0.8,
        },
        {
          id: "2",
          title: "Third",
          description: "Third desc",
          role: "dev",
          completedDate: "2024-01-03",
          complexity: 3,
          fileCount: 6,
          technologies: ["Node"],
          skills: ["API"],
          patterns: [],
          resultType: "project",
          score: 0.7,
        },
        {
          id: "3",
          title: "Fourth",
          description: "Fourth desc",
          role: "dev",
          completedDate: "2024-01-04",
          complexity: 2,
          fileCount: 4,
          technologies: [],
          skills: [],
          patterns: [],
          resultType: "project",
          score: 0.6,
        },
      ];

      const results = await rerankResults("test query", mockResults, {
        topN: 3,
      });

      expect(results.length).toBe(3);
      expect(results[0].id).toBe("1");
      expect(results[1].id).toBe("0");
      expect(results[2].id).toBe("2");
    } finally {
      if (originalEnv) {
        process.env.COHERE_API_KEY = originalEnv;
      } else {
        delete process.env.COHERE_API_KEY;
      }
    }
  });
});
