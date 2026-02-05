import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentGraphError } from "@/lib/explore/errors";

vi.mock("@/lib/logger", () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

const mockSessionRun = vi.fn();
const mockSessionClose = vi.fn();
const mockSession = {
  run: mockSessionRun,
  close: mockSessionClose,
};

vi.mock("@/lib/neo4j", () => ({
  getNeogma: vi.fn(() => ({
    driver: {
      session: vi.fn(() => mockSession),
    },
  })),
}));

vi.mock("cohere-ai", () => ({
  CohereClient: vi.fn().mockImplementation(() => ({
    rerank: vi.fn().mockResolvedValue({
      results: [{ index: 1 }, { index: 0 }],
    }),
  })),
}));

describe("graphSearchBase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionRun.mockReset();
    mockSessionClose.mockReset();
  });

  describe("extractNeo4jRecord", () => {
    it("should extract all fields from a Neo4j record", async () => {
      const { extractNeo4jRecord } = await import("./schema");

      const mockRecord = {
        get: vi.fn((field: string) => {
          const data: Record<string, unknown> = {
            id: "test-id",
            title: "Test Title",
            description: "Test Description",
            role: "developer",
            impact: "High",
            completedDate: "2024-01-15",
            complexity: 7,
            fileCount: 10,
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/test",
            technologies: ["TypeScript", "React"],
            skills: ["Frontend"],
            patterns: ["MVC"],
            company: "Acme Corp",
            position: "Developer",
            achievements: ["Achievement 1"],
            score: 0.95,
            codeSnippets: null,
            resultType: "project",
          };
          return data[field];
        }),
      };

      const result = extractNeo4jRecord(mockRecord, "template");

      expect(result.id).toBe("test-id");
      expect(result.title).toBe("Test Title");
      expect(result.description).toBe("Test Description");
      expect(result.technologies).toEqual(["TypeScript", "React"]);
      expect(result.matchType).toBe("template");
    });

    it("should handle null values with defaults", async () => {
      const { extractNeo4jRecord } = await import("./schema");

      const mockRecord = {
        get: vi.fn(() => null),
      };

      const result = extractNeo4jRecord(mockRecord, "graph");

      expect(result.id).toBe("");
      expect(result.title).toBe("");
      expect(result.technologies).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.score).toBe(0);
      expect(result.resultType).toBe("project");
    });

    it("should handle Neo4j Integer objects", async () => {
      const { extractNeo4jRecord } = await import("./schema");

      const mockRecord = {
        get: vi.fn((field: string) => {
          if (field === "complexity") {
            return { toNumber: () => 5 };
          }
          if (field === "score") {
            return { toNumber: () => 0.85 };
          }
          return null;
        }),
      };

      const result = extractNeo4jRecord(mockRecord, "template");

      expect(result.complexity).toBe(5);
      expect(result.score).toBe(0.85);
    });
  });

  describe("executeQuery", () => {
    it("should execute a query and return parsed results", async () => {
      const { executeQuery } = await import("./utils");

      const mockRecord = {
        get: vi.fn((field: string) => {
          const data: Record<string, unknown> = {
            id: "result-1",
            title: "Result Title",
            description: "Result Description",
            role: "dev",
            completedDate: "2024-01-01",
            technologies: ["Node.js"],
            skills: [],
            patterns: [],
            score: 1.0,
            resultType: "project",
          };
          return data[field] ?? null;
        }),
      };

      mockSessionRun.mockResolvedValue({ records: [mockRecord] });

      const results = await executeQuery(
        mockSession as any,
        "MATCH (n) RETURN n",
        { query: "test" },
        "template",
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("result-1");
      expect(results[0].title).toBe("Result Title");
    });

    it("should throw AgentGraphError on query failure", async () => {
      const { executeQuery } = await import("./utils");

      mockSessionRun.mockRejectedValue(new Error("Query failed"));

      await expect(
        executeQuery(
          mockSession as any,
          "INVALID CYPHER",
          { query: "test" },
          "template",
        ),
      ).rejects.toThrow(AgentGraphError);
    });
  });

  describe("rerankResults", () => {
    const mockResults = [
      {
        id: "1",
        title: "First",
        description: "First result",
        role: "dev",
        completedDate: "2024-01-01",
        complexity: 5,
        fileCount: 10,
        technologies: ["React"],
        skills: ["Frontend"],
        patterns: [],
        resultType: "project",
        score: 0.8,
      },
      {
        id: "2",
        title: "Second",
        description: "Second result",
        role: "dev",
        completedDate: "2024-01-02",
        complexity: 7,
        fileCount: 15,
        technologies: ["Node.js"],
        skills: ["Backend"],
        patterns: [],
        resultType: "project",
        score: 0.9,
      },
    ];

    it("should return results as-is when disabled", async () => {
      const { rerankResults } = await import("./utils");

      const results = await rerankResults("test", mockResults, {
        enabled: false,
      });

      expect(results).toEqual(mockResults);
    });

    it("should return results as-is when count <= topN", async () => {
      const { rerankResults } = await import("./utils");

      const results = await rerankResults("test", mockResults, { topN: 5 });

      expect(results).toEqual(mockResults);
    });

    it("should return empty array for empty results", async () => {
      const { rerankResults } = await import("./utils");

      const results = await rerankResults("test", []);

      expect(results).toEqual([]);
    });
  });

  describe("buildRerankDocument", () => {
    it("should build document string from result", async () => {
      const { buildRerankDocument } = await import("./utils");

      const result = {
        id: "1",
        title: "Test Project",
        description: "A test project",
        role: "developer",
        impact: "High impact",
        completedDate: "2024-01-01",
        complexity: 7,
        fileCount: 10,
        technologies: ["React", "TypeScript"],
        skills: ["Frontend"],
        patterns: ["MVC"],
        resultType: "project",
        score: 0.9,
      };

      const document = buildRerankDocument(result);

      expect(document).toContain("Test Project");
      expect(document).toContain("A test project");
      expect(document).toContain("Technologies: React, TypeScript");
      expect(document).toContain("Skills: Frontend");
      expect(document).toContain("Patterns: MVC");
    });

    it("should handle empty arrays", async () => {
      const { buildRerankDocument } = await import("./utils");

      const result = {
        id: "1",
        title: "Test",
        description: "Desc",
        role: "dev",
        completedDate: "2024-01-01",
        complexity: null,
        fileCount: null,
        technologies: [],
        skills: [],
        patterns: [],
        resultType: "project",
        score: 0.5,
      };

      const document = buildRerankDocument(result);

      expect(document).not.toContain("Technologies:");
      expect(document).not.toContain("Skills:");
      expect(document).not.toContain("Patterns:");
    });
  });
});
