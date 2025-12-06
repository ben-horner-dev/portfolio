import { ModelFactory, type Neogma } from "neogma";

export interface DesignPrincipleProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
  category: string;
  description: string;
  keyPoints: string;
  embedding?: number[];
}

export const createDesignPrincipleModel = (neogma: Neogma) =>
  ModelFactory<DesignPrincipleProperties, Record<string, never>>(
    {
      label: "DesignPrinciple",
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
        description: {
          type: "string",
          required: true,
        },
        keyPoints: {
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

export type DesignPrincipleModel = ReturnType<
  typeof createDesignPrincipleModel
>;
