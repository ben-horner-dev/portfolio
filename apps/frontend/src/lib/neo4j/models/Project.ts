import { ModelFactory, type Neogma } from "neogma";

export interface ProjectProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  title: string;
  description: string;
  role: string;
  impact?: string;
  completedDate: string;
  complexity: number;
  fileCount: number;
  liveUrl?: string;
  githubUrl?: string;
  embedding?: number[];
}

export const createProjectModel = (neogma: Neogma) =>
  ModelFactory<ProjectProperties, Record<string, never>>(
    {
      label: "Project",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        title: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
          required: true,
        },
        role: {
          type: "string",
          required: true,
        },
        impact: {
          type: "string",
          required: false,
        },
        completedDate: {
          type: "string",
          required: true,
        },
        complexity: {
          type: "number",
          required: true,
        },
        fileCount: {
          type: "number",
          required: true,
        },
        liveUrl: {
          type: "string",
          required: false,
        },
        githubUrl: {
          type: "string",
          required: false,
        },
        embedding: {
          type: "any",
          required: false,
        },
      },
    },
    neogma,
  );

export type ProjectModel = ReturnType<typeof createProjectModel>;
