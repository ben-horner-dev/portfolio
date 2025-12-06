import { ModelFactory, type Neogma } from "neogma";

export interface AchievementProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  description: string;
  impact: string;
}

export const createAchievementModel = (neogma: Neogma) =>
  ModelFactory<AchievementProperties, Record<string, never>>(
    {
      label: "Achievement",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        description: {
          type: "string",
          required: true,
        },
        impact: {
          type: "string",
          required: true,
        },
      },
    },
    neogma,
  );

export type AchievementModel = ReturnType<typeof createAchievementModel>;
