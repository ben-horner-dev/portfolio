import { ModelFactory, type Neogma } from "neogma";

export interface ProfileProperties {
  [key: string]: string | number | boolean | undefined | number[];
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  bio: string;
  mission: string;
}

export const createProfileModel = (neogma: Neogma) =>
  ModelFactory<ProfileProperties, Record<string, never>>(
    {
      label: "Profile",
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
        title: {
          type: "string",
          required: true,
        },
        email: {
          type: "string",
          required: true,
        },
        phone: {
          type: "string",
          required: false,
        },
        location: {
          type: "string",
          required: false,
        },
        portfolioUrl: {
          type: "string",
          required: false,
        },
        githubUrl: {
          type: "string",
          required: false,
        },
        linkedinUrl: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: true,
        },
        mission: {
          type: "string",
          required: true,
        },
      },
    },
    neogma,
  );

export type ProfileModel = ReturnType<typeof createProfileModel>;
