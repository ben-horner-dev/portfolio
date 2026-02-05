import type { Neogma } from "neogma";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { CypherStrategyKey } from "@/lib/explore/tools/graphSearchBase";
import {
  createIntegrationTestIndexes,
  getTestNeogma,
} from "@/lib/explore/tools/graphSearchBase/__tests__/integration.fixtures";
import {
  AchievementKeywords,
  CodeKeywords,
  EducationKeywords,
  EmploymentKeywords,
  LeadershipKeywords,
  PatternKeywords,
  SkillKeywords,
  TechnologyKeywords,
} from "./constants";
import { parseSearchIntent } from "./ragGraphSearchTool";

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

describe("ragGraphSearchTool Integration Tests", () => {
  beforeAll(async () => {
    testNeogma = getTestNeogma();
    await createIntegrationTestIndexes(testNeogma);
  });

  afterAll(async () => {
    if (testNeogma) {
      await testNeogma.driver.close();
    }
  });

  describe("parseSearchIntent", () => {
    describe("Employment keywords", () => {
      it("should detect employment intent for 'work experience'", () => {
        expect(parseSearchIntent("Tell me about your work experience")).toBe(
          CypherStrategyKey.EMPLOYMENT,
        );
      });

      it("should detect employment intent for 'career'", () => {
        expect(parseSearchIntent("What's your career history?")).toBe(
          CypherStrategyKey.EMPLOYMENT,
        );
      });

      it("should detect employment intent for 'company'", () => {
        expect(parseSearchIntent("Which company did you work at?")).toBe(
          CypherStrategyKey.EMPLOYMENT,
        );
      });

      it("should detect employment intent for 'worked at'", () => {
        expect(parseSearchIntent("Where have you worked at?")).toBe(
          CypherStrategyKey.EMPLOYMENT,
        );
      });
    });

    describe("Achievement keywords", () => {
      it("should detect achievement intent for 'achievement'", () => {
        expect(parseSearchIntent("What are your achievements?")).toBe(
          CypherStrategyKey.ACHIEVEMENT,
        );
      });

      it("should detect achievement intent for 'impact'", () => {
        expect(parseSearchIntent("What impact did you make?")).toBe(
          CypherStrategyKey.ACHIEVEMENT,
        );
      });

      it("should detect achievement intent for 'improved'", () => {
        expect(parseSearchIntent("What have you improved?")).toBe(
          CypherStrategyKey.ACHIEVEMENT,
        );
      });

      it("should detect achievement intent for 'delivered'", () => {
        expect(parseSearchIntent("What have you delivered?")).toBe(
          CypherStrategyKey.ACHIEVEMENT,
        );
      });
    });

    describe("Education keywords", () => {
      it("should detect education intent for 'education'", () => {
        expect(parseSearchIntent("What's your education background?")).toBe(
          CypherStrategyKey.EDUCATION,
        );
      });

      it("should detect education intent for 'degree'", () => {
        expect(parseSearchIntent("What degree do you have?")).toBe(
          CypherStrategyKey.EDUCATION,
        );
      });

      it("should detect education intent for 'university'", () => {
        expect(parseSearchIntent("Which university did you attend?")).toBe(
          CypherStrategyKey.EDUCATION,
        );
      });
    });

    describe("Leadership keywords", () => {
      it("should detect leadership intent for 'leadership'", () => {
        expect(
          parseSearchIntent("Tell me about your leadership experience"),
        ).toBe(CypherStrategyKey.LEADERSHIP);
      });

      it("should detect leadership intent for 'team'", () => {
        expect(parseSearchIntent("Have you led a team?")).toBe(
          CypherStrategyKey.LEADERSHIP,
        );
      });

      it("should detect leadership intent for 'management'", () => {
        expect(parseSearchIntent("What's your management experience?")).toBe(
          CypherStrategyKey.LEADERSHIP,
        );
      });

      it("should detect leadership intent for 'mentor'", () => {
        expect(parseSearchIntent("Have you been a mentor?")).toBe(
          CypherStrategyKey.LEADERSHIP,
        );
      });
    });

    describe("Technology keywords", () => {
      it("should detect technology intent for 'react'", () => {
        expect(parseSearchIntent("Show me react projects")).toBe(
          CypherStrategyKey.TECHNOLOGY,
        );
      });

      it("should detect technology intent for 'typescript'", () => {
        expect(parseSearchIntent("Do you use typescript?")).toBe(
          CypherStrategyKey.TECHNOLOGY,
        );
      });

      it("should detect technology intent for 'python'", () => {
        expect(parseSearchIntent("Any python experience?")).toBe(
          CypherStrategyKey.TECHNOLOGY,
        );
      });

      it("should detect technology intent for 'aws'", () => {
        expect(parseSearchIntent("Have you used aws?")).toBe(
          CypherStrategyKey.TECHNOLOGY,
        );
      });

      it("should detect technology intent for 'docker'", () => {
        expect(parseSearchIntent("Docker experience?")).toBe(
          CypherStrategyKey.TECHNOLOGY,
        );
      });

      it("should detect technology intent for 'kubernetes'", () => {
        expect(parseSearchIntent("Kubernetes deployments?")).toBe(
          CypherStrategyKey.TECHNOLOGY,
        );
      });
    });

    describe("Skill keywords", () => {
      it("should detect skill intent for 'experience with'", () => {
        expect(parseSearchIntent("Do you have experience with frontend?")).toBe(
          CypherStrategyKey.SKILL,
        );
      });

      it("should detect skill intent for 'skills in'", () => {
        expect(parseSearchIntent("What are your skills in backend?")).toBe(
          CypherStrategyKey.SKILL,
        );
      });

      it("should detect skill intent for 'proficient in'", () => {
        expect(parseSearchIntent("Are you proficient in testing?")).toBe(
          CypherStrategyKey.SKILL,
        );
      });
    });

    describe("Pattern keywords", () => {
      it("should detect pattern intent for 'microservice'", () => {
        expect(
          parseSearchIntent("Have you built microservice architecture?"),
        ).toBe(CypherStrategyKey.PATTERN);
      });

      it("should detect pattern intent for 'graphql'", () => {
        expect(parseSearchIntent("GraphQL API design?")).toBe(
          CypherStrategyKey.PATTERN,
        );
      });

      it("should detect pattern intent for 'rest'", () => {
        expect(parseSearchIntent("REST API development?")).toBe(
          CypherStrategyKey.PATTERN,
        );
      });
    });

    describe("Code keywords", () => {
      it("should detect general intent for 'implementation'", () => {
        expect(parseSearchIntent("Show implementation details")).toBe(
          CypherStrategyKey.GENERAL,
        );
      });

      it("should detect general intent for 'code'", () => {
        expect(parseSearchIntent("Show me some code")).toBe(
          CypherStrategyKey.GENERAL,
        );
      });

      it("should detect general intent for 'how'", () => {
        expect(parseSearchIntent("How did you build this?")).toBe(
          CypherStrategyKey.GENERAL,
        );
      });
    });

    describe("Default to GENERAL", () => {
      it("should default to GENERAL for unrecognized queries", () => {
        expect(parseSearchIntent("Tell me about yourself")).toBe(
          CypherStrategyKey.GENERAL,
        );
      });

      it("should default to GENERAL for empty query", () => {
        expect(parseSearchIntent("")).toBe(CypherStrategyKey.GENERAL);
      });
    });

    describe("Priority ordering", () => {
      it("should prioritize employment over technology when both present", () => {
        expect(parseSearchIntent("work experience with react")).toBe(
          CypherStrategyKey.EMPLOYMENT,
        );
      });

      it("should prioritize achievement over technology when both present", () => {
        expect(parseSearchIntent("What impact did react projects have?")).toBe(
          CypherStrategyKey.ACHIEVEMENT,
        );
      });
    });
  });

  describe("Keyword Enums", () => {
    it("should have all expected employment keywords", () => {
      expect(EmploymentKeywords.WORK_EXPERIENCE).toBe("work experience");
      expect(EmploymentKeywords.EMPLOYMENT).toBe("employment");
      expect(EmploymentKeywords.CAREER).toBe("career");
      expect(EmploymentKeywords.JOB).toBe("job");
      expect(EmploymentKeywords.WORKED_AT).toBe("worked at");
      expect(EmploymentKeywords.COMPANY).toBe("company");
    });

    it("should have all expected achievement keywords", () => {
      expect(AchievementKeywords.ACHIEVEMENT).toBe("achievement");
      expect(AchievementKeywords.ACCOMPLISHED).toBe("accomplished");
      expect(AchievementKeywords.IMPACT).toBe("impact");
      expect(AchievementKeywords.IMPROVED).toBe("improved");
      expect(AchievementKeywords.INCREASED).toBe("increased");
      expect(AchievementKeywords.REDUCED).toBe("reduced");
      expect(AchievementKeywords.DELIVERED).toBe("delivered");
      expect(AchievementKeywords.SAVED).toBe("saved");
    });

    it("should have all expected education keywords", () => {
      expect(EducationKeywords.EDUCATION).toBe("education");
      expect(EducationKeywords.DEGREE).toBe("degree");
      expect(EducationKeywords.UNIVERSITY).toBe("university");
      expect(EducationKeywords.STUDIED).toBe("studied");
      expect(EducationKeywords.QUALIFICATION).toBe("qualification");
    });

    it("should have all expected leadership keywords", () => {
      expect(LeadershipKeywords.LEADERSHIP).toBe("leadership");
      expect(LeadershipKeywords.TEAM).toBe("team");
      expect(LeadershipKeywords.MANAGEMENT).toBe("management");
      expect(LeadershipKeywords.LEAD).toBe("lead");
      expect(LeadershipKeywords.MENTOR).toBe("mentor");
    });

    it("should have all expected technology keywords", () => {
      expect(TechnologyKeywords.REACT).toBe("react");
      expect(TechnologyKeywords.TYPESCRIPT).toBe("typescript");
      expect(TechnologyKeywords.PYTHON).toBe("python");
      expect(TechnologyKeywords.NODE).toBe("node");
      expect(TechnologyKeywords.AWS).toBe("aws");
      expect(TechnologyKeywords.DOCKER).toBe("docker");
      expect(TechnologyKeywords.KUBERNETES).toBe("kubernetes");
    });

    it("should have all expected skill keywords", () => {
      expect(SkillKeywords.EXPERIENCE_WITH).toBe("experience with");
      expect(SkillKeywords.SKILLS_IN).toBe("skills in");
      expect(SkillKeywords.PROFICIENT_IN).toBe("proficient in");
    });

    it("should have all expected pattern keywords", () => {
      expect(PatternKeywords.MVC).toBe("mvc");
      expect(PatternKeywords.MICROSERVICE).toBe("microservice");
      expect(PatternKeywords.REST).toBe("rest");
      expect(PatternKeywords.GRAPHQL).toBe("graphql");
      expect(PatternKeywords.SINGLETON).toBe("singleton");
      expect(PatternKeywords.FACTORY).toBe("factory");
    });

    it("should have all expected code keywords", () => {
      expect(CodeKeywords.IMPLEMENTATION).toBe("implementation");
      expect(CodeKeywords.CODE).toBe("code");
      expect(CodeKeywords.HOW).toBe("how");
    });
  });

  describe("Database queries with parsed intent", () => {
    it("should execute technology search query", async () => {
      const session = testNeogma.driver.session();

      try {
        const intent = parseSearchIntent("Show me react projects");
        expect(intent).toBe(CypherStrategyKey.TECHNOLOGY);

        const result = await session.run(`
          MATCH (t:Technology)<-[:USES]-(p:Project)
          WHERE toLower(t.name) CONTAINS 'react'
          RETURN p.title AS title
        `);

        expect(result.records).toBeInstanceOf(Array);
      } finally {
        await session.close();
      }
    });

    it("should execute employment search query", async () => {
      const session = testNeogma.driver.session();

      try {
        const intent = parseSearchIntent("Tell me about your work experience");
        expect(intent).toBe(CypherStrategyKey.EMPLOYMENT);

        const result = await session.run(`
          MATCH (e:Employment)
          RETURN e.company AS company, e.position AS position
        `);

        expect(result.records).toBeInstanceOf(Array);
      } finally {
        await session.close();
      }
    });

    it("should execute education search query", async () => {
      const session = testNeogma.driver.session();

      try {
        const intent = parseSearchIntent("What's your education background?");
        expect(intent).toBe(CypherStrategyKey.EDUCATION);

        const result = await session.run(`
          MATCH (ed:Education)
          OPTIONAL MATCH (ed)-[:AT_INSTITUTION]->(i:Institution)
          OPTIONAL MATCH (ed)-[:FOR_DEGREE]->(d:Degree)
          RETURN ed.id AS id, i.name AS institution, d.name AS degree
        `);

        expect(result.records).toBeInstanceOf(Array);
      } finally {
        await session.close();
      }
    });

    it("should execute pattern search query", async () => {
      const session = testNeogma.driver.session();

      try {
        const intent = parseSearchIntent(
          "Have you built microservice architecture?",
        );
        expect(intent).toBe(CypherStrategyKey.PATTERN);

        const result = await session.run(`
          MATCH (pat:Pattern)
          OPTIONAL MATCH (pat)<-[:IMPLEMENTS]-(p:Project)
          RETURN pat.name AS pattern, p.title AS project
        `);

        expect(result.records).toBeInstanceOf(Array);
      } finally {
        await session.close();
      }
    });
  });

  describe("ragGraphSearchTool export", () => {
    it("should export a valid tool with correct configuration", async () => {
      const { ragGraphSearchTool } = await import("./ragGraphSearchTool");
      const { TOOL_NAME } = await import("./constants");

      expect(ragGraphSearchTool).toBeDefined();
      expect(ragGraphSearchTool.name).toBe(TOOL_NAME);
      expect(typeof ragGraphSearchTool.invoke).toBe("function");
    });

    it("should invoke tool and execute search", async () => {
      const { ragGraphSearchTool } = await import("./ragGraphSearchTool");

      const result = await ragGraphSearchTool.invoke({
        chatId: "test-chat-123",
        query: "react projects",
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

    it("should invoke tool with provided topK", async () => {
      const { ragGraphSearchTool } = await import("./ragGraphSearchTool");

      const result = await ragGraphSearchTool.invoke({
        chatId: "test-chat-456",
        query: "work experience at companies",
        topK: 10,
        embeddingModelName: "text-embedding-ada-002",
      });

      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed.query).toBe("work experience at companies");
    });

    it("should invoke tool with searchOptions", async () => {
      const { ragGraphSearchTool } = await import("./ragGraphSearchTool");

      const result = await ragGraphSearchTool.invoke({
        chatId: "test-chat-789",
        query: "typescript skills",
        topK: 3,
        embeddingModelName: "text-embedding-ada-002",
        searchOptions: {
          minComplexity: 3,
          technologies: ["TypeScript"],
        },
      });

      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed.results)).toBe(true);
    });
  });
});
