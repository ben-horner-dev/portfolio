import { ModelFactory, type Neogma } from "neogma";

export interface EducationProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  grade?: string;
  startDate: string;
  endDate: string;
}

export const createEducationModel = (neogma: Neogma) =>
  ModelFactory<EducationProperties, Record<string, never>>(
    {
      label: "Education",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        grade: {
          type: "string",
          required: false,
        },
        startDate: {
          type: "string",
          required: true,
        },
        endDate: {
          type: "string",
          required: true,
        },
      },
    },
    neogma,
  );

export type EducationModel = ReturnType<typeof createEducationModel>;
