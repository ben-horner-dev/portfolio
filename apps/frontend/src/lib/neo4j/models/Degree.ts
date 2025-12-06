import { ModelFactory, type Neogma } from "neogma";

export interface DegreeProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
  level: string;
}

export const createDegreeModel = (neogma: Neogma) =>
  ModelFactory<DegreeProperties, Record<string, never>>(
    {
      label: "Degree",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        name: {
          type: "string",
          required: true,
        },
        level: {
          type: "string",
          required: true,
        },
      },
    },
    neogma,
  );

export type DegreeModel = ReturnType<typeof createDegreeModel>;
