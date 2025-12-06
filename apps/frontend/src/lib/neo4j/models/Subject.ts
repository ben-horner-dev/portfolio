import { ModelFactory, type Neogma } from "neogma";

export interface SubjectProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
}

export const createSubjectModel = (neogma: Neogma) =>
  ModelFactory<SubjectProperties, Record<string, never>>(
    {
      label: "Subject",
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
      },
    },
    neogma,
  );

export type SubjectModel = ReturnType<typeof createSubjectModel>;
