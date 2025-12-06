import { ModelFactory, type Neogma } from "neogma";

export interface ReferenceProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  referrerName: string;
  referrerTitle: string;
  referrerCompany: string;
  referrerEmail?: string;
  referrerPhone?: string;
  relationship: string;
  dateWritten: string;
  testimonial: string;
  keyQualities: string;
  embedding?: number[];
}

export const createReferenceModel = (neogma: Neogma) =>
  ModelFactory<ReferenceProperties, Record<string, never>>(
    {
      label: "Reference",
      primaryKeyField: "id",
      schema: {
        id: {
          type: "string",
          required: true,
        },
        referrerName: {
          type: "string",
          required: true,
        },
        referrerTitle: {
          type: "string",
          required: true,
        },
        referrerCompany: {
          type: "string",
          required: true,
        },
        referrerEmail: {
          type: "string",
          required: false,
        },
        referrerPhone: {
          type: "string",
          required: false,
        },
        relationship: {
          type: "string",
          required: true,
        },
        dateWritten: {
          type: "string",
          required: true,
        },
        testimonial: {
          type: "string",
          required: true,
        },
        keyQualities: {
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

export type ReferenceModel = ReturnType<typeof createReferenceModel>;
