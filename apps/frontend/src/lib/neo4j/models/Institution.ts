import { ModelFactory, type Neogma } from "neogma";

export interface InstitutionProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
  location?: string;
}

export const createInstitutionModel = (neogma: Neogma) =>
  ModelFactory<InstitutionProperties, Record<string, never>>(
    {
      label: "Institution",
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
        location: {
          type: "string",
          required: false,
        },
      },
    },
    neogma,
  );

export type InstitutionModel = ReturnType<typeof createInstitutionModel>;
