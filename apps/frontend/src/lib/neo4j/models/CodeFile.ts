import { ModelFactory, type Neogma } from "neogma";

export interface CodeFileProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  path: string;
  language: string;
  lineCount: number;
}

export const createCodeFileModel = (neogma: Neogma) =>
  ModelFactory<CodeFileProperties, Record<string, never>>(
    {
      label: "CodeFile",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        path: {
          type: "string",
          required: true,
        },
        language: {
          type: "string",
          required: true,
        },
        lineCount: {
          type: "number",
          required: true,
        },
      },
    },
    neogma,
  );

export type CodeFileModel = ReturnType<typeof createCodeFileModel>;
