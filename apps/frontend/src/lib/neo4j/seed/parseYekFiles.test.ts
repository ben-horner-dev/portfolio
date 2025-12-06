import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

import * as fs from "node:fs";
import { parseYekFiles } from "./parseYekFiles";

const mockReaddirSync = vi.mocked(fs.readdirSync);
const mockReadFileSync = vi.mocked(fs.readFileSync);
const mockExistsSync = vi.mocked(fs.existsSync);

describe("parseYekFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseYekFiles", () => {
    it("should return empty array when no json files exist", async () => {
      mockReaddirSync.mockReturnValue([]);

      const result = await parseYekFiles();

      expect(result).toEqual([]);
    });

    it("should skip json files without matching txt file", async () => {
      mockReaddirSync.mockReturnValue([
        "project1.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(false);

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await parseYekFiles();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Missing txt file for project1.json, skipping...",
      );

      consoleSpy.mockRestore();
    });

    it("should skip files with invalid metadata schema", async () => {
      mockReaddirSync.mockReturnValue([
        "invalid.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify({ invalid: "data" });
        }
        return "";
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await parseYekFiles();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should parse valid yek files", async () => {
      const validMetadata = {
        title: "Test Project",
        description: "A test project",
        completedDate: "2024-01-15",
        role: "professional",
        designPatterns: ["MVC"],
      };

      const txtContent = `>>>> src/index.ts
import { something } from 'typescript';
export const hello = () => "world";

>>>> src/utils.ts
export const add = (a: number, b: number) => a + b;
`;

      mockReaddirSync.mockReturnValue([
        "test-project.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(validMetadata);
        }
        return txtContent;
      });

      const result = await parseYekFiles();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("proj-test-project");
      expect(result[0].title).toBe("Test Project");
      expect(result[0].description).toBe("A test project");
      expect(result[0].role).toBe("professional");
      expect(result[0].patterns).toEqual(["MVC"]);
      expect(result[0].codeFiles).toHaveLength(2);
      expect(result[0].technologies).toContain("TypeScript");
    });

    it("should detect technologies from content", async () => {
      const validMetadata = {
        title: "Multi-Tech Project",
        description: "Project with many technologies",
        completedDate: "2024-01-15",
        role: "personal",
      };

      const txtContent = `>>>> src/app.tsx
import React from 'react';
import { NextPage } from 'next';
// Using TypeScript for type safety

>>>> next.config.js
module.exports = {
  reactStrictMode: true,
};

>>>> docker-compose.yml
services:
  redis:
    image: redis:alpine
  postgres:
    image: postgres:15
`;

      mockReaddirSync.mockReturnValue([
        "multi-tech.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(validMetadata);
        }
        return txtContent;
      });

      const result = await parseYekFiles();

      expect(result[0].technologies).toContain("TypeScript");
      expect(result[0].technologies).toContain("React");
      expect(result[0].technologies).toContain("Next.js");
      expect(result[0].technologies).toContain("Docker");
      expect(result[0].technologies).toContain("Redis");
      expect(result[0].technologies).toContain("PostgreSQL");
    });

    it("should parse code files with correct language detection", async () => {
      const validMetadata = {
        title: "Multi-Language Project",
        description: "Project with different languages",
        completedDate: "2024-01-15",
        role: "professional",
      };

      const txtContent = `>>>> src/app.py
def hello():
    return "world"

>>>> src/config.json
{"key": "value"}

>>>> src/styles.css
.container { display: flex; }
`;

      mockReaddirSync.mockReturnValue([
        "lang-project.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(validMetadata);
        }
        return txtContent;
      });

      const result = await parseYekFiles();

      const languages = result[0].codeFiles.map((f) => f.language);
      expect(languages).toContain("python");
      expect(languages).toContain("json");
      expect(languages).toContain("css");
    });

    it("should handle files with unknown extensions", async () => {
      const validMetadata = {
        title: "Unknown Extension Project",
        description: "Project with unknown file type",
        completedDate: "2024-01-15",
        role: "personal",
      };

      const txtContent = `>>>> src/data.xyz
some content here

>>>> src/config.unknown
more content
`;

      mockReaddirSync.mockReturnValue([
        "unknown-ext.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(validMetadata);
        }
        return txtContent;
      });

      const result = await parseYekFiles();

      const languages = result[0].codeFiles.map((f) => f.language);
      expect(languages).toContain("unknown");
    });

    it("should calculate complexity based on files and chunks", async () => {
      const validMetadata = {
        title: "Complex Project",
        description: "A complex project",
        completedDate: "2024-01-15",
        role: "professional",
      };

      const manyLinesContent = Array.from(
        { length: 50 },
        (_, i) => `>>>> src/file${i}.ts\nconst x${i} = ${i};`,
      ).join("\n\n");

      mockReaddirSync.mockReturnValue([
        "complex.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(validMetadata);
        }
        return manyLinesContent;
      });

      const result = await parseYekFiles();

      expect(result[0].complexity).toBeGreaterThan(0);
      expect(result[0].fileCount).toBe(50);
    });

    it("should parse multiple projects", async () => {
      const metadata1 = {
        title: "Project 1",
        description: "First project",
        completedDate: "2024-01-01",
        role: "professional",
      };

      const metadata2 = {
        title: "Project 2",
        description: "Second project",
        completedDate: "2024-02-01",
        role: "personal",
      };

      mockReaddirSync.mockReturnValue([
        "project1.json",
        "project2.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        const pathStr = String(path);
        if (pathStr.includes("project1.json")) {
          return JSON.stringify(metadata1);
        }
        if (pathStr.includes("project2.json")) {
          return JSON.stringify(metadata2);
        }
        if (pathStr.includes("project1.txt")) {
          return ">>>> src/index.ts\nconst x = 1;";
        }
        return ">>>> src/main.py\ndef main(): pass";
      });

      const result = await parseYekFiles();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Project 1");
      expect(result[1].title).toBe("Project 2");
    });

    it("should handle files with default design patterns", async () => {
      const metadataWithoutPatterns = {
        title: "Simple Project",
        description: "No patterns defined",
        completedDate: "2024-01-15",
        role: "personal",
      };

      mockReaddirSync.mockReturnValue([
        "simple.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(metadataWithoutPatterns);
        }
        return ">>>> index.js\nmodule.exports = {};";
      });

      const result = await parseYekFiles();

      expect(result[0].patterns).toEqual([]);
    });

    it("should determine chunk types correctly for TypeScript", async () => {
      const validMetadata = {
        title: "TS Project",
        description: "TypeScript project",
        completedDate: "2024-01-15",
        role: "professional",
      };

      const txtContent = `>>>> src/imports.ts
import { Injectable } from '@nestjs/common';

>>>> src/types.ts
export interface User {
  id: string;
  name: string;
}

>>>> src/service.ts
export class UserService {
  constructor() {}
}

>>>> src/utils.ts
export async function fetchData() {
  return [];
}
`;

      mockReaddirSync.mockReturnValue([
        "ts-project.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(validMetadata);
        }
        return txtContent;
      });

      const result = await parseYekFiles();
      const chunkTypes = result[0].codeChunks.map((c) => c.type);

      expect(chunkTypes).toContain("imports");
      expect(chunkTypes).toContain("definition");
      expect(chunkTypes).toContain("function");
    });

    it("should determine chunk types correctly for Python", async () => {
      const validMetadata = {
        title: "Python Project",
        description: "Python project",
        completedDate: "2024-01-15",
        role: "professional",
      };

      const txtContent = `>>>> src/imports.py
from typing import List
import os

>>>> src/models.py
class UserModel:
    def __init__(self):
        pass

>>>> src/utils.py
def helper_function():
    return True
`;

      mockReaddirSync.mockReturnValue([
        "py-project.json",
      ] as unknown as fs.Dirent[]);
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
        if (String(path).endsWith(".json")) {
          return JSON.stringify(validMetadata);
        }
        return txtContent;
      });

      const result = await parseYekFiles();
      const chunkTypes = result[0].codeChunks.map((c) => c.type);

      expect(chunkTypes).toContain("imports");
      expect(chunkTypes).toContain("class");
      expect(chunkTypes).toContain("function");
    });
  });
});
