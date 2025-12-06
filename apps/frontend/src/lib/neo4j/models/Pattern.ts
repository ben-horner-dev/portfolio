import { ModelFactory, type Neogma } from "neogma";

export interface PatternProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
  category: string;
}

export const createPatternModel = (neogma: Neogma) =>
  ModelFactory<PatternProperties, Record<string, never>>(
    {
      label: "Pattern",
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
        category: {
          type: "string",
          required: true,
        },
      },
    },
    neogma,
  );

export type PatternModel = ReturnType<typeof createPatternModel>;
