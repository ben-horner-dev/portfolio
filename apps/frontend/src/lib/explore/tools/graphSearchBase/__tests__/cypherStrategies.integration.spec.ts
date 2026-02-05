import type { Neogma } from "neogma";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  CYPHER_STRATEGIES,
  CypherStrategyKey,
  generateStrategyDescription,
  getCypherStrategy,
} from "../cypherStrategies";
import {
  createIntegrationTestIndexes,
  getTestNeogma,
} from "./integration.fixtures";

describe("cypherStrategies Integration Tests", () => {
  let neogma: Neogma;

  beforeAll(async () => {
    neogma = getTestNeogma();
    await createIntegrationTestIndexes(neogma);
  });

  afterAll(async () => {
    if (neogma) {
      await neogma.driver.close();
    }
  });

  describe("CypherStrategyKey enum", () => {
    it("should have all expected strategy keys", () => {
      expect(CypherStrategyKey.TECHNOLOGY).toBe("technology");
      expect(CypherStrategyKey.SKILL).toBe("skill");
      expect(CypherStrategyKey.PATTERN).toBe("pattern");
      expect(CypherStrategyKey.EMPLOYMENT).toBe("employment");
      expect(CypherStrategyKey.ACHIEVEMENT).toBe("achievement");
      expect(CypherStrategyKey.EDUCATION).toBe("education");
      expect(CypherStrategyKey.LEADERSHIP).toBe("leadership");
      expect(CypherStrategyKey.GENERAL).toBe("general");
    });
  });

  describe("getCypherStrategy", () => {
    it("should return a strategy for each key", () => {
      for (const key of Object.values(CypherStrategyKey)) {
        const strategy = getCypherStrategy(key);
        expect(strategy).toBeDefined();
        expect(strategy.description).toBeDefined();
        expect(strategy.cypher).toBeDefined();
      }
    });
  });

  describe("generateStrategyDescription", () => {
    it("should generate a description string for all strategies", () => {
      const description = generateStrategyDescription();

      expect(description).toContain("technology");
      expect(description).toContain("skill");
      expect(description).toContain("pattern");
      expect(description).toContain("employment");
      expect(description).toContain("achievement");
      expect(description).toContain("education");
      expect(description).toContain("leadership");
      expect(description).toContain("general");
    });
  });

  describe("TECHNOLOGY strategy", () => {
    it("should execute technology search query without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);
        const result = await session.run(strategy.cypher, { query: "TypeScript" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("project");
          expect(record.get("title")).toBeDefined();
        }
      } finally {
        await session.close();
      }
    });

    it("should return projects with related skills and patterns", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);
        const result = await session.run(strategy.cypher, { query: "react" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("skills")).toBeInstanceOf(Array);
          expect(record.get("patterns")).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("SKILL strategy", () => {
    it("should execute skill search query without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.SKILL);
        const result = await session.run(strategy.cypher, { query: "architecture" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("project");
          expect(record.get("skills")).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("PATTERN strategy", () => {
    it("should execute pattern search query without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.PATTERN);
        const result = await session.run(strategy.cypher, { query: "atomic" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("project");
        }
      } finally {
        await session.close();
      }
    });

    it("should handle microservices pattern query", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.PATTERN);
        const result = await session.run(strategy.cypher, { query: "microservices" });

        expect(result.records).toBeInstanceOf(Array);
      } finally {
        await session.close();
      }
    });
  });

  describe("EMPLOYMENT strategy", () => {
    it("should execute employment search query without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.EMPLOYMENT);
        const result = await session.run(strategy.cypher, { query: "engineer" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("employment");
          expect(record.get("company")).toBeDefined();
          expect(record.get("position")).toBeDefined();
          expect(record.get("technologies")).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });

    it("should include achievements for employments", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.EMPLOYMENT);
        const result = await session.run(strategy.cypher, { query: "all" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          const achievements = record.get("achievements");
          expect(achievements).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("ACHIEVEMENT strategy", () => {
    it("should execute achievement fulltext search without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.ACHIEVEMENT);
        const result = await session.run(strategy.cypher, { query: "migration" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("achievement");
        }
      } finally {
        await session.close();
      }
    });

    it("should return achievements with associated employment context", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.ACHIEVEMENT);
        const result = await session.run(strategy.cypher, { query: "team" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("company")).toBeDefined();
          expect(record.get("position")).toBeDefined();
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("EDUCATION strategy", () => {
    it("should execute education search query without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.EDUCATION);
        const result = await session.run(strategy.cypher, { query: "education" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("education");
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("LEADERSHIP strategy", () => {
    it("should execute leadership search query without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.LEADERSHIP);
        const result = await session.run(strategy.cypher, { query: "leadership" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("leadership");
          expect(record.get("achievements")).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("GENERAL strategy", () => {
    it("should execute general fulltext search without errors", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.GENERAL);
        const result = await session.run(strategy.cypher, { query: "Portfolio" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("resultType")).toBe("project");
        }
      } finally {
        await session.close();
      }
    });

    it("should return projects with technologies, skills, and patterns", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.GENERAL);
        const result = await session.run(strategy.cypher, { query: "website" });

        expect(result.records).toBeInstanceOf(Array);

        if (result.records.length > 0) {
          const record = result.records[0];
          expect(record.get("technologies")).toBeInstanceOf(Array);
          expect(record.get("skills")).toBeInstanceOf(Array);
          expect(record.get("patterns")).toBeInstanceOf(Array);
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("Cypher query validity", () => {
    it("should have valid Cypher for all strategies", async () => {
      const session = neogma.driver.session();

      try {
        for (const [key, strategy] of Object.entries(CYPHER_STRATEGIES)) {
          const explainQuery = `EXPLAIN ${strategy.cypher}`;

          try {
            await session.run(explainQuery, { query: "test" });
          } catch (error) {
            throw new Error(
              `Invalid Cypher for strategy "${key}": ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            );
          }
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("Result schema compliance", () => {
    it("should return all required fields from TECHNOLOGY strategy", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.TECHNOLOGY);
        const result = await session.run(strategy.cypher, { query: "TypeScript" });

        if (result.records.length > 0) {
          const record = result.records[0];
          const requiredFields = [
            "resultType",
            "id",
            "title",
            "description",
            "role",
            "impact",
            "completedDate",
            "complexity",
            "fileCount",
            "technologies",
            "skills",
            "patterns",
            "score",
          ];

          for (const field of requiredFields) {
            expect(record.has(field)).toBe(true);
          }
        }
      } finally {
        await session.close();
      }
    });

    it("should return all required fields from EMPLOYMENT strategy", async () => {
      const session = neogma.driver.session();

      try {
        const strategy = getCypherStrategy(CypherStrategyKey.EMPLOYMENT);
        const result = await session.run(strategy.cypher, { query: "all" });

        if (result.records.length > 0) {
          const record = result.records[0];
          const requiredFields = [
            "resultType",
            "id",
            "title",
            "description",
            "company",
            "position",
            "technologies",
            "achievements",
            "score",
          ];

          for (const field of requiredFields) {
            expect(record.has(field)).toBe(true);
          }
        }
      } finally {
        await session.close();
      }
    });
  });

  describe("extractNeo4jRecord edge cases", () => {
    it("should handle NaN values in toNumber", async () => {
      const { extractNeo4jRecord } = await import("../schema");

      const mockRecord = {
        get: (field: string) => {
          if (field === "complexity") return "not-a-number";
          if (field === "score") return undefined;
          if (field === "completedDate") return { toString: () => "2024-01-01" };
          return null;
        },
      };

      const result = extractNeo4jRecord(mockRecord, "template");

      expect(result.complexity).toBe(0);
      expect(result.score).toBe(0);
      expect(result.completedDate).toBe("2024-01-01");
    });

    it("should handle Date objects in completedDate", async () => {
      const { extractNeo4jRecord } = await import("../schema");

      const testDate = new Date("2024-06-15T12:00:00Z");
      const mockRecord = {
        get: (field: string) => {
          if (field === "completedDate") return testDate;
          return null;
        },
      };

      const result = extractNeo4jRecord(mockRecord, "semantic");

      expect(result.completedDate).toBe(testDate.toISOString());
    });

    it("should handle numeric completedDate via String fallback", async () => {
      const { extractNeo4jRecord } = await import("../schema");

      const mockRecord = {
        get: (field: string) => {
          if (field === "completedDate") return 12345;
          return null;
        },
      };

      const result = extractNeo4jRecord(mockRecord, "graph");

      expect(result.completedDate).toBe("12345");
    });

    it("should handle plain number in complexity via toNumber", async () => {
      const { extractNeo4jRecord } = await import("../schema");

      const mockRecord = {
        get: (field: string) => {
          if (field === "complexity") return 42;
          if (field === "fileCount") return 100;
          return null;
        },
      };

      const result = extractNeo4jRecord(mockRecord, "template");

      expect(result.complexity).toBe(42);
      expect(result.fileCount).toBe(100);
    });

    it("should handle Neo4j Integer with toNumber method", async () => {
      const { extractNeo4jRecord } = await import("../schema");

      const mockNeo4jInt = { toNumber: () => 777 };
      const mockRecord = {
        get: (field: string) => {
          if (field === "complexity") return mockNeo4jInt;
          if (field === "fileCount") return mockNeo4jInt;
          return null;
        },
      };

      const result = extractNeo4jRecord(mockRecord, "template");

      expect(result.complexity).toBe(777);
      expect(result.fileCount).toBe(777);
    });

    it("should parse string numbers via Number() in toNumber", async () => {
      const { extractNeo4jRecord } = await import("../schema");

      const mockRecord = {
        get: (field: string) => {
          if (field === "complexity") return "42";
          if (field === "fileCount") return "100";
          return null;
        },
      };

      const result = extractNeo4jRecord(mockRecord, "template");

      expect(result.complexity).toBe(42);
      expect(result.fileCount).toBe(100);
    });
  });

  describe("mergeSearchResults", () => {
    it("should merge vector and graph results with hybrid matchType", async () => {
      const { mergeSearchResults } = await import("../vectorSearch");

      const vectorResults = [
        {
          id: "1",
          title: "Project 1",
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
          id: "1",
          title: "Project 1",
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
        {
          id: "2",
          title: "Project 2",
          description: "Desc 2",
          role: "dev",
          completedDate: "2024-01-02",
          complexity: 3,
          fileCount: 5,
          technologies: [],
          skills: [],
          patterns: [],
          resultType: "project",
          score: 0.5,
        },
      ];

      const merged = mergeSearchResults(vectorResults, graphResults);

      expect(merged.length).toBe(2);
      const project1 = merged.find((r) => r.id === "1");
      const project2 = merged.find((r) => r.id === "2");

      expect(project1?.matchType).toBe("hybrid");
      expect(project1?.score).toBeGreaterThan(0.8);
      expect(project2?.matchType).toBe("graph");
    });
  });

  describe("utils functions", () => {
    it("should create session via createNeo4jSession", async () => {
      const { createNeo4jSession } = await import("../utils");

      const session = createNeo4jSession();
      expect(session).toBeDefined();
      await session.close();
    });

    it("should execute query via executeQuery", async () => {
      const { createNeo4jSession, executeQuery } = await import("../utils");

      const session = createNeo4jSession();

      try {
        const results = await executeQuery(
          session,
          `MATCH (n) RETURN 
            n.id AS id, 
            n.title AS title, 
            n.description AS description,
            n.role AS role,
            n.impact AS impact,
            n.completedDate AS completedDate,
            n.complexity AS complexity,
            n.fileCount AS fileCount,
            [] AS technologies,
            [] AS skills,
            [] AS patterns,
            'project' AS resultType,
            1.0 AS score
          LIMIT 1`,
          {},
          "graph",
        );

        expect(Array.isArray(results)).toBe(true);
      } finally {
        await session.close();
      }
    });

    it("should throw AgentGraphError when executeQuery fails", async () => {
      const { createNeo4jSession, executeQuery } = await import("../utils");
      const { AgentGraphError } = await import("@/lib/explore/errors");

      const session = createNeo4jSession();

      try {
        await expect(
          executeQuery(session, "INVALID CYPHER SYNTAX !!!", {}, "template"),
        ).rejects.toThrow(AgentGraphError);
      } finally {
        await session.close();
      }
    });

    it("should handle non-Error throws in executeQuery", async () => {
      const { executeQuery } = await import("../utils");

      const mockSession = {
        run: vi.fn().mockRejectedValue("string error"),
        close: vi.fn(),
      };

      await expect(
        executeQuery(mockSession as never, "MATCH (n) RETURN n", {}, "template"),
      ).rejects.toThrow("Unknown error");
    });

    it("should handle rerankResults without COHERE_API_KEY", async () => {
      const { rerankResults } = await import("../utils");
      const originalEnv = process.env.COHERE_API_KEY;
      delete process.env.COHERE_API_KEY;

      try {
        const mockResults = Array.from({ length: 15 }, (_, i) => ({
          id: `${i}`,
          title: `Title ${i}`,
          description: `Desc ${i}`,
          role: "dev",
          completedDate: "2024-01-01",
          complexity: 5,
          fileCount: 10,
          technologies: ["React"],
          skills: ["Frontend"],
          patterns: [],
          resultType: "project",
          score: 0.9 - i * 0.05,
        }));

        const results = await rerankResults("test query", mockResults, {
          topN: 5,
        });

        expect(results.length).toBe(5);
      } finally {
        if (originalEnv) {
          process.env.COHERE_API_KEY = originalEnv;
        }
      }
    });

    it("should rerank results with COHERE_API_KEY", async () => {
      const { rerankResults } = await import("../utils");
      const originalEnv = process.env.COHERE_API_KEY;
      process.env.COHERE_API_KEY = "test-api-key";

      try {
        const mockResults = Array.from({ length: 15 }, (_, i) => ({
          id: `${i}`,
          title: `Title ${i}`,
          description: `Desc ${i}`,
          role: "dev",
          completedDate: "2024-01-01",
          complexity: 5,
          fileCount: 10,
          technologies: ["React"],
          skills: ["Frontend"],
          patterns: [],
          resultType: "project",
          score: 0.9 - i * 0.05,
        }));

        const results = await rerankResults("test query", mockResults, {
          topN: 5,
        });

        expect(results.length).toBe(5);
      } finally {
        if (originalEnv) {
          process.env.COHERE_API_KEY = originalEnv;
        } else {
          delete process.env.COHERE_API_KEY;
        }
      }
    });

    it("should return all results when results.length <= topN", async () => {
      const { rerankResults } = await import("../utils");

      const mockResults = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        title: `Title ${i}`,
        description: `Desc ${i}`,
        role: "dev",
        completedDate: "2024-01-01",
        complexity: 5,
        fileCount: 10,
        technologies: ["React"],
        skills: ["Frontend"],
        patterns: [],
        resultType: "project",
        score: 0.9,
      }));

      const results = await rerankResults("test query", mockResults, {
        topN: 10,
      });

      expect(results.length).toBe(5);
      expect(results).toEqual(mockResults);
    });

    it("should build rerank documents correctly via buildRerankDocument", async () => {
      const { buildRerankDocument } = await import("../utils");

      const result = {
        id: "1",
        title: "Test Project",
        description: "A great project",
        role: "Lead Developer",
        impact: "Increased performance by 50%",
        completedDate: "2024-01-01",
        complexity: 5,
        fileCount: 10,
        technologies: ["React", "TypeScript"],
        skills: ["Frontend", "Testing"],
        patterns: ["MVC", "Observer"],
        resultType: "project",
        score: 0.9,
      };

      const doc = buildRerankDocument(result);

      expect(doc).toContain("Test Project");
      expect(doc).toContain("A great project");
      expect(doc).toContain("Lead Developer");
      expect(doc).toContain("Increased performance by 50%");
      expect(doc).toContain("Technologies: React, TypeScript");
      expect(doc).toContain("Skills: Frontend, Testing");
      expect(doc).toContain("Patterns: MVC, Observer");
    });

    it("should handle buildRerankDocument with empty arrays", async () => {
      const { buildRerankDocument } = await import("../utils");

      const result = {
        id: "1",
        title: "Test",
        description: "Desc",
        role: "Dev",
        impact: undefined,
        completedDate: "2024-01-01",
        complexity: 5,
        fileCount: 10,
        technologies: [],
        skills: [],
        patterns: [],
        resultType: "project",
        score: 0.9,
      };

      const doc = buildRerankDocument(result);

      expect(doc).toBe("Test | Desc | Dev");
    });
  });

  describe("vectorSearch options coverage", () => {
    const mockQueryVector = new Array(1536).fill(0.1);

    it("should handle performVectorSearch with dateRange option", async () => {
      const { performVectorSearch } = await import("../vectorSearch");
      const session = neogma.driver.session();

      try {
        const results = await performVectorSearch(session, mockQueryVector, 10, {
          dateRange: {
            start: "2020-01-01",
            end: "2025-12-31",
          },
        });

        expect(Array.isArray(results)).toBe(true);
      } finally {
        await session.close();
      }
    });

    it("should handle performVectorSearch with technologies option", async () => {
      const { performVectorSearch } = await import("../vectorSearch");
      const session = neogma.driver.session();

      try {
        const results = await performVectorSearch(session, mockQueryVector, 10, {
          technologies: ["React", "TypeScript"],
        });

        expect(Array.isArray(results)).toBe(true);
      } finally {
        await session.close();
      }
    });

    it("should handle performVectorSearch with all options combined", async () => {
      const { performVectorSearch } = await import("../vectorSearch");
      const session = neogma.driver.session();

      try {
        const results = await performVectorSearch(session, mockQueryVector, 5, {
          minComplexity: 3,
          dateRange: {
            start: "2020-01-01",
            end: "2025-12-31",
          },
          technologies: ["TypeScript"],
        });

        expect(Array.isArray(results)).toBe(true);
      } finally {
        await session.close();
      }
    });
  });

});
