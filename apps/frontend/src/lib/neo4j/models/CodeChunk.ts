import { ModelFactory, type Neogma } from "neogma";

export interface CodeChunkProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  type: string;
  content: string;
  filePath: string;
  language: string;
  startLine: number;
  endLine: number;
}

export const createCodeChunkModel = (neogma: Neogma) =>
  ModelFactory<CodeChunkProperties, Record<string, never>>(
    {
      label: "CodeChunk",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        type: {
          type: "string",
          required: true,
        },
        content: {
          type: "string",
          required: true,
        },
        filePath: {
          type: "string",
          required: true,
        },
        language: {
          type: "string",
          required: true,
        },
        startLine: {
          type: "number",
          required: true,
        },
        endLine: {
          type: "number",
          required: true,
        },
      },
    },
    neogma,
  );

export type CodeChunkModel = ReturnType<typeof createCodeChunkModel>;
