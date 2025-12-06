import { ModelFactory, type Neogma } from "neogma";

export interface SkillProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
  level: string;
}

export const createSkillModel = (neogma: Neogma) =>
  ModelFactory<SkillProperties, Record<string, never>>(
    {
      label: "Skill",
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

export type SkillModel = ReturnType<typeof createSkillModel>;
