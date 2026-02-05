import { z } from "zod";

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const Neo4jRecordExtractorSchema = z.object({
  id: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  title: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  description: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  role: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  impact: z.string().nullable().optional(),
  completedDate: z
    .unknown()
    .nullable()
    .transform((val) => {
      if (!val) return "";
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      if (val && typeof val === "object" && "toString" in val)
        return val.toString();
      return String(val);
    }),
  complexity: z
    .unknown()
    .nullable()
    .transform((val) => (val ? toNumber(val) : null)),
  fileCount: z
    .unknown()
    .nullable()
    .transform((val) => (val ? toNumber(val) : null)),
  liveUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  technologies: z
    .array(z.string())
    .nullable()
    .transform((val) => val ?? []),
  skills: z
    .array(z.string())
    .nullable()
    .transform((val) => val ?? []),
  patterns: z
    .array(z.string())
    .nullable()
    .transform((val) => val ?? []),
  company: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  achievements: z.array(z.string()).nullable().optional(),
  score: z
    .unknown()
    .nullable()
    .transform((val) => (val ? toNumber(val) : 0)),
  codeSnippets: z.array(z.unknown()).nullable().optional(),
  resultType: z
    .string()
    .nullable()
    .transform((val) => val ?? "project"),
});

export const extractNeo4jRecord = (
  record: unknown,
  matchType: "semantic" | "graph" | "hybrid" | "template" = "template",
) => {
  const recordObj = record as { get: (key: string) => unknown };

  const base = Neo4jRecordExtractorSchema.parse({
    id: recordObj.get("id"),
    title: recordObj.get("title"),
    description: recordObj.get("description"),
    role: recordObj.get("role"),
    impact: recordObj.get("impact"),
    completedDate: recordObj.get("completedDate"),
    complexity: recordObj.get("complexity"),
    fileCount: recordObj.get("fileCount"),
    liveUrl: recordObj.get("liveUrl"),
    githubUrl: recordObj.get("githubUrl"),
    technologies: recordObj.get("technologies"),
    skills: recordObj.get("skills"),
    patterns: recordObj.get("patterns"),
    company: recordObj.get("company"),
    position: recordObj.get("position"),
    achievements: recordObj.get("achievements"),
    score: recordObj.get("score"),
    codeSnippets: recordObj.get("codeSnippets"),
    resultType: recordObj.get("resultType"),
  });

  return {
    ...base,
    matchType,
  };
};
