import { ModelFactory, type Neogma } from "neogma";

export interface TechnologyProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
  category: string;
}

export const createTechnologyModel = (neogma: Neogma) =>
  ModelFactory<TechnologyProperties, Record<string, never>>(
    {
      label: "Technology",
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

export type TechnologyModel = ReturnType<typeof createTechnologyModel>;
