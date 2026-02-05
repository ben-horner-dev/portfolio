import type { Neogma } from "neogma";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  CypherStrategyKey,
  getCypherStrategy,
} from "@/lib/explore/tools/graphSearchBase";
import {
  createIntegrationTestIndexes,
  getTestNeogma,
} from "@/lib/explore/tools/graphSearchBase/__tests__/integration.fixtures";
import { TOOL_NAME } from "./constants";
import { RagGraphCypherSearchSchema } from "./schema";

let testNeogma: Neogma;

vi.mock("@/lib/neo4j", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/neo4j")>();
  return {
    ...original,
    getNeogma: () => testNeogma,
  };
});

vi.mock("@/lib/explore/vector/getEmbeddings", () => ({
  getEmbeddings: vi.fn().mockResolvedValue({
    embedQuery: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
  }),
}));

vi.mock("cohere-ai", () => ({
  CohereClient: vi.fn().mockImplementation(() => ({
    rerank: vi.fn().mockResolvedValue({
      results: [{ index: 0 }, { index: 1 }],
    }),
  })),
}));

vi.mock("@/lib/explore/tools/utils", () => ({
  getToolConfig: vi.fn().mockResolvedValue({
    description: "Test tool description",
  }),
}));

describe("ragGraphCypherSearchTool Integration Tests", () => {
  beforeAll(async () => {
    testNeogma = getTestNeogma();
    await createIntegrationTestIndexes(testNeogma);
  });

  afterAll(async () => {
    if (testNeogma) {
      await testNeogma.driver.close();
    }
  });

  describe("Tool Configuration", () => {
    it("should have correct tool name", () => {
      expect(TOOL_NAME).toBe("rag_graph_cypher_search");
    });
  });

  describe("RagGraphCypherSearchSchema", () => {
    it("should validate valid input with all required fields", () => {
      const validInput = {
        query: "Find TypeScript projects",
        cypherKey: CypherStrategyKey.TECHNOLOGY,
        embeddingModelName: "text-embedding-3-small",
      };

      const result = RagGraphCypherSearchSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate input with optional topK", () => {
      const validInput = {
        query: "Find React projects",
        cypherKey: CypherStrategyKey.TECHNOLOGY,
        topK: 5,
        embeddingModelName: "text-embedding-3-small",
      };

      const result = RagGraphCypherSearchSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.topK).toBe(5);
      }
    });

    it("should provide default topK of 10", () => {
      const validInput = {
        query: "Find projects",
        cypherKey: CypherStrategyKey.GENERAL,
        embeddingModelName: "text-embedding-3-small",
      };

      const result = RagGraphCypherSearchSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.topK).toBe(10);
      }
    });

    it("should reject invalid cypherKey", () => {
      const invalidInput = {
        query: "Find projects",
        cypherKey: "invalid_key",
        embeddingModelName: "text-embedding-3-small",
      };

      const result = RagGraphCypherSearchSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject missing query", () => {
      const invalidInput = {
        cypherKey: CypherStrategyKey.TECHNOLOGY,
        embeddingModelName: "text-embedding-3-small",
      };

      const result = RagGraphCypherSearchSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject missing embeddingModelName", () => {
      const invalidInput = {
        query: "Find projects",
        cypherKey: CypherStrategyKey.TECHNOLOGY,
      };

      const result = RagGraphCypherSearchSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept all valid cypherKey values", () => {
      const cypherKeys = Object.values(CypherStrategyKey);

      for (const cypherKey of cypherKeys) {
        const input = {
          query: "Test query",
          cypherKey,
          embeddingModelName: "text-embedding-3-small",
        };

        const result = RagGraphCypherSearchSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("Cypher Strategy Selection", () => {
    describe("TECHNOLOGY strategy", () => {
      it("should execute technology search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);

          expect(strategy.description).toContain("technologies");

          const result = await session.run(strategy.cypher, {
            query: "TypeScript",
          });

          expect(result.records).toBeInstanceOf(Array);

          if (result.records.length > 0) {
            expect(result.records[0].get("resultType")).toBe("project");
          }
        } finally {
          await session.close();
        }
      });
    });

    describe("SKILL strategy", () => {
      it("should execute skill search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.SKILL);

          expect(strategy.description).toContain("skills");

          const result = await session.run(strategy.cypher, {
            query: "architecture",
          });

          expect(result.records).toBeInstanceOf(Array);
        } finally {
          await session.close();
        }
      });
    });

    describe("PATTERN strategy", () => {
      it("should execute pattern search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.PATTERN);

          expect(strategy.description).toContain("design patterns");

          const result = await session.run(strategy.cypher, {
            query: "atomic",
          });

          expect(result.records).toBeInstanceOf(Array);
        } finally {
          await session.close();
        }
      });
    });

    describe("EMPLOYMENT strategy", () => {
      it("should execute employment search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.EMPLOYMENT);

          expect(strategy.description).toContain("Work history");

          const result = await session.run(strategy.cypher, { query: "all" });

          expect(result.records).toBeInstanceOf(Array);

          if (result.records.length > 0) {
            expect(result.records[0].get("resultType")).toBe("employment");
          }
        } finally {
          await session.close();
        }
      });
    });

    describe("ACHIEVEMENT strategy", () => {
      it("should execute achievement search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.ACHIEVEMENT);

          expect(strategy.description).toContain("Accomplishments");

          const result = await session.run(strategy.cypher, {
            query: "migration",
          });

          expect(result.records).toBeInstanceOf(Array);

          if (result.records.length > 0) {
            expect(result.records[0].get("resultType")).toBe("achievement");
          }
        } finally {
          await session.close();
        }
      });
    });

    describe("EDUCATION strategy", () => {
      it("should execute education search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.EDUCATION);

          expect(strategy.description).toContain("Degrees");

          const result = await session.run(strategy.cypher, {
            query: "education",
          });

          expect(result.records).toBeInstanceOf(Array);

          if (result.records.length > 0) {
            expect(result.records[0].get("resultType")).toBe("education");
          }
        } finally {
          await session.close();
        }
      });
    });

    describe("LEADERSHIP strategy", () => {
      it("should execute leadership search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.LEADERSHIP);

          expect(strategy.description).toContain("Team leadership");

          const result = await session.run(strategy.cypher, {
            query: "leadership",
          });

          expect(result.records).toBeInstanceOf(Array);
        } finally {
          await session.close();
        }
      });
    });

    describe("GENERAL strategy", () => {
      it("should execute general search without errors", async () => {
        const session = testNeogma.driver.session();

        try {
          const strategy = getCypherStrategy(CypherStrategyKey.GENERAL);

          expect(strategy.description).toContain("General project search");

          const result = await session.run(strategy.cypher, {
            query: "Portfolio",
          });

          expect(result.records).toBeInstanceOf(Array);

          if (result.records.length > 0) {
            expect(result.records[0].get("resultType")).toBe("project");
          }
        } finally {
          await session.close();
        }
      });
    });
  });

  describe("Query parameter handling", () => {
    it("should pass query parameter to cypher correctly", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);

        const queries = ["React", "TypeScript", "Neo4j"];

        for (const query of queries) {
          const result = await session.run(strategy.cypher, { query });

          if (result.records.length > 0) {
            const technologies = result.records.flatMap(
              (r) => r.get("technologies") as string[],
            );
            const hasMatchingTech = technologies.some((t) =>
              t.toLowerCase().includes(query.toLowerCase()),
            );
            expect(hasMatchingTech).toBe(true);
          }
        }
      } finally {
        await session.close();
      }
    });

    it("should handle case-insensitive queries", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);

        const variations = ["typescript", "TYPESCRIPT", "TypeScript"];

        for (const query of variations) {
          const result = await session.run(strategy.cypher, { query });

          if (result.records.length > 0) {
            expect(result.records[0].get("technologies")).toContain(
              "TypeScript",
            );
          }
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("Result field validation", () => {
    it("should return all required fields for project results", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);
        const result = await session.run(strategy.cypher, {
          query: "TypeScript",
        });

        if (result.records.length > 0) {
          const record = result.records[0];

          expect(record.has("resultType")).toBe(true);
          expect(record.has("id")).toBe(true);
          expect(record.has("title")).toBe(true);
          expect(record.has("description")).toBe(true);
          expect(record.has("role")).toBe(true);
          expect(record.has("technologies")).toBe(true);
          expect(record.has("skills")).toBe(true);
          expect(record.has("patterns")).toBe(true);
          expect(record.has("score")).toBe(true);

          expect(record.get("technologies")).toBeInstanceOf(Array);
          expect(record.get("skills")).toBeInstanceOf(Array);
          expect(record.get("patterns")).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });

    it("should return all required fields for employment results", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.EMPLOYMENT);
        const result = await session.run(strategy.cypher, { query: "all" });

        if (result.records.length > 0) {
          const record = result.records[0];

          expect(record.has("resultType")).toBe(true);
          expect(record.get("resultType")).toBe("employment");
          expect(record.has("company")).toBe(true);
          expect(record.has("position")).toBe(true);
          expect(record.has("technologies")).toBe(true);
          expect(record.has("achievements")).toBe(true);
        }
      } finally {
        await session.close();
      }
    });

    it("should return all required fields for achievement results", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.ACHIEVEMENT);
        const result = await session.run(strategy.cypher, {
          query: "migration",
        });

        if (result.records.length > 0) {
          const record = result.records[0];

          expect(record.has("resultType")).toBe(true);
          expect(record.get("resultType")).toBe("achievement");
          expect(record.has("description")).toBe(true);
          expect(record.has("company")).toBe(true);
          expect(record.has("position")).toBe(true);
        }
      } finally {
        await session.close();
      }
    });

    it("should return all required fields for education results", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.EDUCATION);
        const result = await session.run(strategy.cypher, {
          query: "education",
        });

        if (result.records.length > 0) {
          const record = result.records[0];

          expect(record.has("resultType")).toBe(true);
          expect(record.get("resultType")).toBe("education");
          expect(record.has("title")).toBe(true);
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle empty query", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);
        const result = await session.run(strategy.cypher, { query: "" });

        expect(result.records).toBeInstanceOf(Array);
      } finally {
        await session.close();
      }
    });

    it("should handle query with no matches", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);
        const result = await session.run(strategy.cypher, {
          query: "NonExistentTechnology12345",
        });

        expect(result.records.length).toBe(0);
      } finally {
        await session.close();
      }
    });

    it("should handle special characters in query", async () => {
      const session = testNeogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);

        const specialQueries = ["Next.js", "C++", "C#", "Node.js"];

        for (const query of specialQueries) {
          const result = await session.run(strategy.cypher, { query });
          expect(result.records).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("ragGraphCypherSearchTool export", () => {
    it("should export a valid tool with correct configuration", async () => {
      const { ragGraphCypherSearchTool } = await import(
        "./ragGraphCypherSearchTool"
      );

      expect(ragGraphCypherSearchTool).toBeDefined();
      expect(ragGraphCypherSearchTool.name).toBe(TOOL_NAME);
      expect(typeof ragGraphCypherSearchTool.invoke).toBe("function");
    });

    it("should invoke tool and execute search", async () => {
      const { ragGraphCypherSearchTool } = await import(
        "./ragGraphCypherSearchTool"
      );

      const result = await ragGraphCypherSearchTool.invoke({
        query: "react projects",
        cypherKey: CypherStrategyKey.TECHNOLOGY,
        topK: 5,
        embeddingModelName: "text-embedding-ada-002",
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty("query");
      expect(parsed).toHaveProperty("results");
      expect(parsed).toHaveProperty("resultCount");
    });

    it("should invoke tool with default topK", async () => {
      const { ragGraphCypherSearchTool } = await import(
        "./ragGraphCypherSearchTool"
      );

      const result = await ragGraphCypherSearchTool.invoke({
        query: "typescript",
        cypherKey: CypherStrategyKey.TECHNOLOGY,
        embeddingModelName: "text-embedding-ada-002",
      });

      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed.query).toBe("typescript");
    });

    it("should invoke tool with searchOptions", async () => {
      const { ragGraphCypherSearchTool } = await import(
        "./ragGraphCypherSearchTool"
      );

      const result = await ragGraphCypherSearchTool.invoke({
        query: "python",
        cypherKey: CypherStrategyKey.TECHNOLOGY,
        topK: 3,
        embeddingModelName: "text-embedding-ada-002",
        searchOptions: {
          minComplexity: 5,
        },
      });

      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed.results)).toBe(true);
    });
  });
});
