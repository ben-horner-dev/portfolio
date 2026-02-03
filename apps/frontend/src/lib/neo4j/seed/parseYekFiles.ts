import * as fs from "node:fs";
import * as path from "node:path";
import { z } from "zod";

const YEK_DIR = path.resolve(process.cwd(), "../../yek");

const YekMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  completedDate: z.string(),
  role: z.enum(["professional", "personal"]),
  designPatterns: z.array(z.string()).optional().default([]),
});

export type YekMetadata = z.infer<typeof YekMetadataSchema>;

export interface ParsedProject {
  id: string;
  title: string;
  description: string;
  role: string;
  completedDate: string;
  complexity: number;
  fileCount: number;
  technologies: string[];
  patterns: string[];
  codeChunks: ParsedCodeChunk[];
  codeFiles: ParsedCodeFile[];
}

export interface ParsedCodeChunk {
  id: string;
  type: string;
  content: string;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
}

export interface ParsedCodeFile {
  id: string;
  path: string;
  language: string;
  lineCount: number;
}

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".json": "json",
  ".md": "markdown",
  ".yml": "yaml",
  ".yaml": "yaml",
  ".sql": "sql",
  ".sh": "shell",
  ".bash": "shell",
  ".css": "css",
  ".scss": "scss",
  ".html": "html",
  ".go": "go",
  ".rs": "rust",
  ".toml": "toml",
  ".lock": "lock",
  ".ipynb": "jupyter",
};

const TECHNOLOGY_PATTERNS: Record<string, RegExp[]> = {
  TypeScript: [/\.tsx?$/, /typescript/i],
  JavaScript: [/\.jsx?$/, /javascript/i],
  Python: [/\.py$/, /python/i, /pyproject\.toml/],
  React: [/react/i, /\.tsx$/],
  "Next.js": [/next\.config/i, /nextjs/i],
  Docker: [/dockerfile/i, /docker-compose/i],
  PostgreSQL: [/postgres/i, /postgresql/i],
  Prisma: [/prisma/i, /\.prisma$/],
  FastAPI: [/fastapi/i],
  Flask: [/flask/i],
  Django: [/django/i],
  AWS: [/aws/i, /localstack/i, /boto3/i],
  Redis: [/redis/i],
  Kubernetes: [/kubernetes/i, /k8s/i],
  MongoDB: [/mongodb/i, /mongo/i],
  Neo4j: [/neo4j/i],
  LangChain: [/langchain/i],
  OpenAI: [/openai/i],
  Pydantic: [/pydantic/i],
  NumPy: [/numpy/i],
  Pandas: [/pandas/i],
  Vitest: [/vitest/i],
  Jest: [/jest/i],
  Storybook: [/storybook/i],
  TailwindCSS: [/tailwind/i],
  Zod: [/zod/i],
  tRPC: [/trpc/i],
  Terraform: [/terraform/i, /\.tf$/],
  Nginx: [/nginx/i],
  Gunicorn: [/gunicorn/i],
  Uvicorn: [/uvicorn/i],
};

export const parseYekFiles = async (): Promise<ParsedProject[]> => {
  const projects: ParsedProject[] = [];
  const files = fs.readdirSync(YEK_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  for (const jsonFile of jsonFiles) {
    const baseName = jsonFile.replace(".json", "");
    const txtFile = `${baseName}.txt`;
    const jsonPath = path.join(YEK_DIR, jsonFile);
    const txtPath = path.join(YEK_DIR, txtFile);

    if (!fs.existsSync(txtPath)) {
      console.warn(`Missing txt file for ${jsonFile}, skipping...`);
      continue;
    }

    const jsonContent = fs.readFileSync(jsonPath, "utf-8");
    const txtContent = fs.readFileSync(txtPath, "utf-8");

    const parseResult = YekMetadataSchema.safeParse(JSON.parse(jsonContent));
    if (!parseResult.success) {
      console.warn(
        `Invalid metadata in ${jsonFile}:`,
        parseResult.error.issues,
      );
      continue;
    }

    const metadata = parseResult.data;
    const projectId = `proj-${baseName}`;
    const { codeFiles, codeChunks } = parseCodeContent(txtContent, projectId);
    const technologies = extractTechnologies(txtContent);
    const complexity = calculateComplexity(codeFiles, codeChunks.length);

    projects.push({
      id: projectId,
      title: metadata.title,
      description: metadata.description,
      role: metadata.role,
      completedDate: metadata.completedDate,
      complexity,
      fileCount: codeFiles.length,
      technologies,
      patterns: metadata.designPatterns,
      codeChunks,
      codeFiles,
    });
  }

  return projects;
};

const parseCodeContent = (
  content: string,
  projectId: string,
): { codeFiles: ParsedCodeFile[]; codeChunks: ParsedCodeChunk[] } => {
  const codeFiles: ParsedCodeFile[] = [];
  const codeChunks: ParsedCodeChunk[] = [];
  const fileMarkerRegex = /^>>>> (.+)$/gm;

  const filePositions: { path: string; start: number }[] = [];
  let match = fileMarkerRegex.exec(content);

  while (match !== null) {
    filePositions.push({
      path: match[1],
      start: match.index + match[0].length + 1,
    });
    match = fileMarkerRegex.exec(content);
  }

  for (let i = 0; i < filePositions.length; i++) {
    const file = filePositions[i];
    const nextStart =
      i + 1 < filePositions.length
        ? filePositions[i + 1].start - file.path.length - 6
        : content.length;
    const fileContent = content.slice(file.start, nextStart).trim();
    const lines = fileContent.split("\n");
    const ext = path.extname(file.path);
    const language = EXTENSION_TO_LANGUAGE[ext] || "unknown";

    const fileId = `file-${projectId}-${i}`;
    codeFiles.push({
      id: fileId,
      path: file.path,
      language,
      lineCount: lines.length,
    });

    const MAX_CHUNK_SIZE = 100;
    const chunks = chunkContent(fileContent, MAX_CHUNK_SIZE);

    let currentLine = 1;
    for (let j = 0; j < chunks.length; j++) {
      const chunk = chunks[j];
      const chunkLines = chunk.split("\n").length;
      codeChunks.push({
        id: `chunk-${projectId}-${i}-${j}`,
        type: determineChunkType(chunk, language),
        content: chunk,
        filePath: file.path,
        language,
        startLine: currentLine,
        endLine: currentLine + chunkLines - 1,
      });
      currentLine += chunkLines;
    }
  }

  return { codeFiles, codeChunks };
};

const chunkContent = (content: string, maxLines: number): string[] => {
  const lines = content.split("\n");
  const chunks: string[] = [];

  for (let i = 0; i < lines.length; i += maxLines) {
    chunks.push(lines.slice(i, i + maxLines).join("\n"));
  }

  return chunks;
};

const determineChunkType = (content: string, language: string): string => {
  if (language === "typescript" || language === "javascript") {
    if (/^(export\s+)?(async\s+)?function\s+/m.test(content)) return "function";
    if (/^(export\s+)?(class|interface|type|enum)\s+/m.test(content))
      return "definition";
    if (/^(import|export)\s+/m.test(content)) return "imports";
  }
  if (language === "python") {
    if (/^(async\s+)?def\s+/m.test(content)) return "function";
    if (/^class\s+/m.test(content)) return "class";
    if (/^(import|from)\s+/m.test(content)) return "imports";
  }
  return "code";
};

const extractTechnologies = (content: string): string[] => {
  const found = new Set<string>();

  for (const [tech, patterns] of Object.entries(TECHNOLOGY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        found.add(tech);
        break;
      }
    }
  }

  return Array.from(found);
};

const calculateComplexity = (
  files: ParsedCodeFile[],
  chunkCount: number,
): number => {
  const fileScore = Math.min(files.length / 10, 3);
  const lineScore = Math.min(
    files.reduce((sum, f) => sum + f.lineCount, 0) / 1000,
    4,
  );
  const chunkScore = Math.min(chunkCount / 20, 3);

  return Math.round(fileScore + lineScore + chunkScore);
};
