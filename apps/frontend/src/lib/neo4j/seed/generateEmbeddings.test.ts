import type { OpenAIEmbeddings } from "@langchain/openai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEmbeddings } from "@/lib/explore/vector/getEmbeddings";
import {
  createEmploymentEmbeddingText,
  createProjectEmbeddingText,
  DEFAULT_EMBEDDING_MODEL,
  EMBEDDING_DIMENSION,
  generateEmbeddingsForDocuments,
} from "./generateEmbeddings";

vi.mock("@/lib/explore/vector/getEmbeddings");

const mockGetEmbeddings = vi.mocked(getEmbeddings);

describe("generateEmbeddings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constants", () => {
    it("should export DEFAULT_EMBEDDING_MODEL", () => {
      expect(DEFAULT_EMBEDDING_MODEL).toBe("text-embedding-3-small");
    });

    it("should export EMBEDDING_DIMENSION", () => {
      expect(EMBEDDING_DIMENSION).toBe(1536);
    });
  });

  describe("createProjectEmbeddingText", () => {
    it("should create text with all fields populated", () => {
      const project = {
        title: "Test Project",
        description: "A test project description",
        role: "Developer",
        technologies: ["TypeScript", "React"],
        patterns: ["MVC", "Repository"],
      };

      const result = createProjectEmbeddingText(project);

      expect(result).toContain("Title: Test Project");
      expect(result).toContain("Description: A test project description");
      expect(result).toContain("Role: Developer");
      expect(result).toContain("Technologies: TypeScript, React");
      expect(result).toContain("Design Patterns: MVC, Repository");
    });

    it("should exclude technologies when array is empty", () => {
      const project = {
        title: "Test Project",
        description: "A test project description",
        role: "Developer",
        technologies: [],
        patterns: ["MVC"],
      };

      const result = createProjectEmbeddingText(project);

      expect(result).not.toContain("Technologies:");
      expect(result).toContain("Design Patterns: MVC");
    });

    it("should exclude patterns when array is empty", () => {
      const project = {
        title: "Test Project",
        description: "A test project description",
        role: "Developer",
        technologies: ["TypeScript"],
        patterns: [],
      };

      const result = createProjectEmbeddingText(project);

      expect(result).toContain("Technologies: TypeScript");
      expect(result).not.toContain("Design Patterns:");
    });

    it("should exclude both technologies and patterns when both are empty", () => {
      const project = {
        title: "Minimal Project",
        description: "Minimal description",
        role: "Developer",
        technologies: [],
        patterns: [],
      };

      const result = createProjectEmbeddingText(project);

      expect(result).toBe(
        "Title: Minimal Project\nDescription: Minimal description\nRole: Developer",
      );
    });
  });

  describe("createEmploymentEmbeddingText", () => {
    it("should create text with all fields populated", () => {
      const employment = {
        company: "Tech Corp",
        position: "Senior Developer",
        description: "Led development initiatives",
        technologies: ["Node.js", "Python"],
        achievements: ["Shipped v2.0", "Reduced bugs by 50%"],
      };

      const result = createEmploymentEmbeddingText(employment);

      expect(result).toContain("Position: Senior Developer at Tech Corp");
      expect(result).toContain("Description: Led development initiatives");
      expect(result).toContain("Technologies: Node.js, Python");
      expect(result).toContain(
        "Achievements: Shipped v2.0; Reduced bugs by 50%",
      );
    });

    it("should exclude technologies when array is empty", () => {
      const employment = {
        company: "Tech Corp",
        position: "Senior Developer",
        description: "Led development initiatives",
        technologies: [],
        achievements: ["Shipped v2.0"],
      };

      const result = createEmploymentEmbeddingText(employment);

      expect(result).not.toContain("Technologies:");
      expect(result).toContain("Achievements: Shipped v2.0");
    });

    it("should exclude achievements when array is empty", () => {
      const employment = {
        company: "Tech Corp",
        position: "Senior Developer",
        description: "Led development initiatives",
        technologies: ["Node.js"],
        achievements: [],
      };

      const result = createEmploymentEmbeddingText(employment);

      expect(result).toContain("Technologies: Node.js");
      expect(result).not.toContain("Achievements:");
    });

    it("should handle minimal employment data", () => {
      const employment = {
        company: "Startup",
        position: "Developer",
        description: "Coding",
        technologies: [],
        achievements: [],
      };

      const result = createEmploymentEmbeddingText(employment);

      expect(result).toBe(
        "Position: Developer at Startup\nDescription: Coding",
      );
    });
  });

  describe("generateEmbeddingsForDocuments", () => {
    it("should generate embeddings for documents", async () => {
      const mockEmbeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ];
      const mockEmbedder = {
        embedDocuments: vi.fn().mockResolvedValue(mockEmbeddings),
      };
      mockGetEmbeddings.mockResolvedValue(
        mockEmbedder as unknown as OpenAIEmbeddings,
      );

      const documents = [
        { id: "doc-1", text: "First document" },
        { id: "doc-2", text: "Second document" },
      ];

      const result = await generateEmbeddingsForDocuments(documents);

      expect(mockGetEmbeddings).toHaveBeenCalledWith("text-embedding-3-small");
      expect(mockEmbedder.embedDocuments).toHaveBeenCalledWith([
        "First document",
        "Second document",
      ]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: "doc-1", embedding: [0.1, 0.2, 0.3] });
      expect(result[1]).toEqual({ id: "doc-2", embedding: [0.4, 0.5, 0.6] });
    });

    it("should use custom model name when provided", async () => {
      const mockEmbedder = {
        embedDocuments: vi.fn().mockResolvedValue([[0.1]]),
      };
      mockGetEmbeddings.mockResolvedValue(
        mockEmbedder as unknown as OpenAIEmbeddings,
      );

      const documents = [{ id: "doc-1", text: "Test" }];

      await generateEmbeddingsForDocuments(documents, "custom-model");

      expect(mockGetEmbeddings).toHaveBeenCalledWith("custom-model");
    });

    it("should process documents in batches of 20", async () => {
      const mockEmbedder = {
        embedDocuments: vi.fn().mockResolvedValue(Array(20).fill([0.1])),
      };
      mockGetEmbeddings.mockResolvedValue(
        mockEmbedder as unknown as OpenAIEmbeddings,
      );

      const documents = Array.from({ length: 25 }, (_, i) => ({
        id: `doc-${i}`,
        text: `Document ${i}`,
      }));

      mockEmbedder.embedDocuments
        .mockResolvedValueOnce(Array(20).fill([0.1]))
        .mockResolvedValueOnce(Array(5).fill([0.2]));

      const result = await generateEmbeddingsForDocuments(documents);

      expect(mockEmbedder.embedDocuments).toHaveBeenCalledTimes(2);
      expect(mockEmbedder.embedDocuments).toHaveBeenNthCalledWith(
        1,
        documents.slice(0, 20).map((d) => d.text),
      );
      expect(mockEmbedder.embedDocuments).toHaveBeenNthCalledWith(
        2,
        documents.slice(20, 25).map((d) => d.text),
      );
      expect(result).toHaveLength(25);
    });

    it("should handle empty documents array", async () => {
      const mockEmbedder = {
        embedDocuments: vi.fn().mockResolvedValue([]),
      };
      mockGetEmbeddings.mockResolvedValue(
        mockEmbedder as unknown as OpenAIEmbeddings,
      );

      const result = await generateEmbeddingsForDocuments([]);

      expect(result).toHaveLength(0);
      expect(mockEmbedder.embedDocuments).not.toHaveBeenCalled();
    });
  });
});
