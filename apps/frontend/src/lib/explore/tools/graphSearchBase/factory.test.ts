import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import type { GraphRagToolConfig } from "./factory";

vi.mock("@/lib/logger", () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

vi.mock("@langchain/core/tools", () => ({
  tool: vi.fn((fn, config) => ({
    name: config.name,
    description: config.description,
    schema: config.schema,
    invoke: fn,
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
  RELATIONSHIP_TYPES: {
    USES: "USES",
    DEMONSTRATES: "DEMONSTRATES",
    IMPLEMENTS: "IMPLEMENTS",
    CONTAINS: "CONTAINS",
    HAS_CHUNK: "HAS_CHUNK",
    USED_TECHNOLOGY: "USED_TECHNOLOGY",
    ACHIEVED: "ACHIEVED",
    INCLUDES_PROJECT: "INCLUDES_PROJECT",
  },
}));

vi.mock("@/lib/explore/vector/getEmbeddings", () => ({
  getEmbeddings: vi.fn().mockResolvedValue({
    embedQuery: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  }),
}));

vi.mock("cohere-ai", () => ({
  CohereClient: vi.fn().mockImplementation(() => ({
    rerank: vi.fn().mockResolvedValue({
      results: [{ index: 0 }, { index: 1 }],
    }),
  })),
}));

const TestSchema = z.object({
  query: z.string(),
  embeddingModelName: z.string(),
  topK: z.number().optional().default(10),
});

type TestInput = z.infer<typeof TestSchema>;

const mockRecord = {
  get: vi.fn((field: string) => {
    const data: Record<string, unknown> = {
      resultType: "project",
      id: "test-1",
      title: "Test Result",
      description: "A test result",
      role: "developer",
      impact: "High impact",
      completedDate: "2024-01-15",
      complexity: 7,
      fileCount: 10,
      liveUrl: null,
      githubUrl: "https://github.com/test",
      technologies: ["TypeScript"],
      skills: ["Testing"],
      patterns: ["Factory"],
      codeSnippets: null,
      company: null,
      position: null,
      achievements: null,
      score: 0.95,
    };
    return data[field];
  }),
};

describe("factory", () => {
  let createGraphRagTool: typeof import("./factory").createGraphRagTool;
  let executeGraphRagSearch: typeof import("./factory").executeGraphRagSearch;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSessionRun.mockReset();
    mockSessionClose.mockReset();

    const module = await import("./factory");
    createGraphRagTool = module.createGraphRagTool;
    executeGraphRagSearch = module.executeGraphRagSearch;
  });

  describe("createGraphRagTool", () => {
    it("should create a tool with the provided name and description", () => {
      const config: GraphRagToolConfig<TestInput> = {
        name: "test_tool",
        description: "A test tool",
        schema: TestSchema,
        selectCypher: () => ({
          cypher:
            "MATCH (n) RETURN n.id AS id, 'test' AS title, 'desc' AS description, 'role' AS role, null AS impact, '2024-01-01' AS completedDate, 1 AS complexity, 1 AS fileCount, null AS liveUrl, null AS githubUrl, [] AS technologies, [] AS skills, [] AS patterns, null AS codeSnippets, null AS company, null AS position, null AS achievements, 1.0 AS score, 'project' AS resultType",
          params: {},
        }),
      };

      const tool = createGraphRagTool(config);

      expect(tool.name).toBe("test_tool");
      expect(tool.description).toBe("A test tool");
    });

    it("should create a tool that executes searches", async () => {
      mockSessionRun.mockResolvedValue({ records: [mockRecord] });

      const config: GraphRagToolConfig<TestInput> = {
        name: "search_tool",
        description: "Search tool",
        schema: TestSchema,
        selectCypher: (input) => ({
          cypher: `MATCH (p:Project) WHERE p.title CONTAINS $query RETURN 'project' AS resultType, p.id AS id, p.title AS title, p.description AS description, 'role' AS role, null AS impact, '2024-01-01' AS completedDate, 1 AS complexity, 1 AS fileCount, null AS liveUrl, null AS githubUrl, [] AS technologies, [] AS skills, [] AS patterns, null AS codeSnippets, null AS company, null AS position, null AS achievements, 1.0 AS score`,
          params: { query: input.query },
        }),
      };

      const tool = createGraphRagTool(config) as {
        invoke: (input: TestInput) => Promise<string>;
      };
      const result = await tool.invoke({
        query: "test",
        embeddingModelName: "text-embedding-3-small",
        topK: 5,
      });

      const parsed = JSON.parse(result);
      expect(parsed.query).toBe("test");
      expect(parsed.results).toBeInstanceOf(Array);
      expect(parsed.resultCount).toBeDefined();
    });
  });

  describe("executeGraphRagSearch", () => {
    it("should execute hybrid search with vector and cypher results", async () => {
      mockSessionRun.mockResolvedValue({ records: [mockRecord] });

      const config: GraphRagToolConfig<TestInput> = {
        name: "test",
        description: "test",
        schema: TestSchema,
        selectCypher: () => ({
          cypher:
            "MATCH (n) RETURN n.id AS id, 'test' AS title, 'desc' AS description, 'role' AS role, null AS impact, '2024-01-01' AS completedDate, 1 AS complexity, 1 AS fileCount, null AS liveUrl, null AS githubUrl, [] AS technologies, [] AS skills, [] AS patterns, null AS codeSnippets, null AS company, null AS position, null AS achievements, 1.0 AS score, 'project' AS resultType",
          params: {},
        }),
      };

      const result = await executeGraphRagSearch(
        {
          query: "test",
          embeddingModelName: "text-embedding-3-small",
          topK: 10,
        },
        config,
      );

      expect(result.query).toBe("test");
      expect(result.results).toBeInstanceOf(Array);
      expect(result.resultCount).toBeDefined();
      expect(mockSessionRun).toHaveBeenCalled();
      expect(mockSessionClose).toHaveBeenCalled();
    });

    it("should use custom topK from getTopK", async () => {
      mockSessionRun.mockResolvedValue({ records: [mockRecord] });

      const config: GraphRagToolConfig<TestInput> = {
        name: "test",
        description: "test",
        schema: TestSchema,
        selectCypher: () => ({
          cypher:
            "MATCH (n) RETURN n.id AS id, 'test' AS title, 'desc' AS description, 'role' AS role, null AS impact, '2024-01-01' AS completedDate, 1 AS complexity, 1 AS fileCount, null AS liveUrl, null AS githubUrl, [] AS technologies, [] AS skills, [] AS patterns, null AS codeSnippets, null AS company, null AS position, null AS achievements, 1.0 AS score, 'project' AS resultType",
          params: {},
        }),
        getTopK: (input) => input.topK ?? 5,
      };

      await executeGraphRagSearch(
        {
          query: "test",
          embeddingModelName: "text-embedding-3-small",
          topK: 20,
        },
        config,
      );

      expect(mockSessionRun).toHaveBeenCalled();
    });

    it("should pass vector search options from getVectorSearchOptions", async () => {
      mockSessionRun.mockResolvedValue({ records: [mockRecord] });

      const ExtendedSchema = TestSchema.extend({
        includeCode: z.boolean().optional(),
      });
      type ExtendedInput = z.infer<typeof ExtendedSchema>;

      const config: GraphRagToolConfig<ExtendedInput> = {
        name: "test",
        description: "test",
        schema: ExtendedSchema,
        selectCypher: () => ({
          cypher:
            "MATCH (n) RETURN n.id AS id, 'test' AS title, 'desc' AS description, 'role' AS role, null AS impact, '2024-01-01' AS completedDate, 1 AS complexity, 1 AS fileCount, null AS liveUrl, null AS githubUrl, [] AS technologies, [] AS skills, [] AS patterns, null AS codeSnippets, null AS company, null AS position, null AS achievements, 1.0 AS score, 'project' AS resultType",
          params: {},
        }),
        getVectorSearchOptions: (input) => ({
          includeCode: input.includeCode,
        }),
      };

      await executeGraphRagSearch(
        {
          query: "test",
          embeddingModelName: "text-embedding-3-small",
          topK: 10,
          includeCode: true,
        },
        config,
      );

      expect(mockSessionRun).toHaveBeenCalled();
    });

    it("should close session even on error", async () => {
      mockSessionRun.mockRejectedValue(new Error("Query failed"));

      const config: GraphRagToolConfig<TestInput> = {
        name: "test",
        description: "test",
        schema: TestSchema,
        selectCypher: () => ({
          cypher: "INVALID CYPHER",
          params: {},
        }),
      };

      await expect(
        executeGraphRagSearch(
          {
            query: "test",
            embeddingModelName: "text-embedding-3-small",
            topK: 10,
          },
          config,
        ),
      ).rejects.toThrow();

      expect(mockSessionClose).toHaveBeenCalled();
    });

    it("should return consistent response format", async () => {
      mockSessionRun.mockResolvedValue({ records: [mockRecord] });

      const config: GraphRagToolConfig<TestInput> = {
        name: "test",
        description: "test",
        schema: TestSchema,
        selectCypher: () => ({
          cypher:
            "MATCH (n) RETURN n.id AS id, 'test' AS title, 'desc' AS description, 'role' AS role, null AS impact, '2024-01-01' AS completedDate, 1 AS complexity, 1 AS fileCount, null AS liveUrl, null AS githubUrl, [] AS technologies, [] AS skills, [] AS patterns, null AS codeSnippets, null AS company, null AS position, null AS achievements, 1.0 AS score, 'project' AS resultType",
          params: {},
        }),
      };

      const result = await executeGraphRagSearch(
        {
          query: "test query",
          embeddingModelName: "text-embedding-3-small",
          topK: 10,
        },
        config,
      );

      expect(result).toHaveProperty("query", "test query");
      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("resultCount");
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.resultCount).toBe("number");
    });
  });

  describe("CypherSelection", () => {
    it("should pass params from selectCypher to query execution", async () => {
      mockSessionRun.mockResolvedValue({ records: [] });

      const config: GraphRagToolConfig<TestInput> = {
        name: "test",
        description: "test",
        schema: TestSchema,
        selectCypher: (input) => ({
          cypher:
            "MATCH (p:Project) WHERE p.title = $title RETURN 'project' AS resultType, p.id AS id, p.title AS title, p.description AS description, 'role' AS role, null AS impact, '2024-01-01' AS completedDate, 1 AS complexity, 1 AS fileCount, null AS liveUrl, null AS githubUrl, [] AS technologies, [] AS skills, [] AS patterns, null AS codeSnippets, null AS company, null AS position, null AS achievements, 1.0 AS score",
          params: { title: input.query, customParam: "value" },
        }),
      };

      await executeGraphRagSearch(
        {
          query: "my title",
          embeddingModelName: "text-embedding-3-small",
          topK: 10,
        },
        config,
      );

      const cypherCalls = mockSessionRun.mock.calls.filter(
        (call) =>
          typeof call[0] === "string" && call[0].includes("WHERE p.title"),
      );
      expect(cypherCalls.length).toBeGreaterThan(0);
      expect(cypherCalls[0][1]).toMatchObject({
        title: "my title",
        customParam: "value",
      });
    });
  });
});
