import { ModelFactory, type Neogma } from "neogma";

export interface EmploymentProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  embedding?: number[];
}

export const createEmploymentModel = (neogma: Neogma) =>
  ModelFactory<EmploymentProperties, Record<string, never>>(
    {
      label: "Employment",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        company: {
          type: "string",
          required: true,
        },
        position: {
          type: "string",
          required: true,
        },
        startDate: {
          type: "string",
          required: true,
        },
        endDate: {
          type: "string",
          required: false,
        },
        isCurrent: {
          type: "boolean",
          required: true,
        },
        description: {
          type: "string",
          required: true,
        },
        embedding: {
          type: "any",
          required: false,
        },
      },
    },
    neogma,
  );

export type EmploymentModel = ReturnType<typeof createEmploymentModel>;
