export const RELATIONSHIP_TYPES = {
  USES: "USES",
  DEMONSTRATES: "DEMONSTRATES",
  IMPLEMENTS: "IMPLEMENTS",
  CONTAINS: "CONTAINS",
  HAS_CHUNK: "HAS_CHUNK",
  USED_TECHNOLOGY: "USED_TECHNOLOGY",
  ACHIEVED: "ACHIEVED",
  INCLUDES_PROJECT: "INCLUDES_PROJECT",
  AT_INSTITUTION: "AT_INSTITUTION",
  FOR_DEGREE: "FOR_DEGREE",
  COVERED: "COVERED",
  REFERENCED_BY: "REFERENCED_BY",
  ADHERES_TO: "ADHERES_TO",
  HAS_PROFILE: "HAS_PROFILE",
} as const;

export type RelationshipType =
  (typeof RELATIONSHIP_TYPES)[keyof typeof RELATIONSHIP_TYPES];

export interface RelationshipDefinition {
  type: RelationshipType;
  fromLabel: string;
  toLabel: string;
  description: string;
}

export const RELATIONSHIPS: RelationshipDefinition[] = [
  {
    type: RELATIONSHIP_TYPES.USES,
    fromLabel: "Project",
    toLabel: "Technology",
    description: "A project uses a technology",
  },
  {
    type: RELATIONSHIP_TYPES.DEMONSTRATES,
    fromLabel: "Project",
    toLabel: "Skill",
    description: "A project demonstrates a skill",
  },
  {
    type: RELATIONSHIP_TYPES.IMPLEMENTS,
    fromLabel: "Project",
    toLabel: "Pattern",
    description: "A project implements a design pattern",
  },
  {
    type: RELATIONSHIP_TYPES.CONTAINS,
    fromLabel: "Project",
    toLabel: "CodeFile",
    description: "A project contains a code file",
  },
  {
    type: RELATIONSHIP_TYPES.HAS_CHUNK,
    fromLabel: "Project",
    toLabel: "CodeChunk",
    description: "A project has a code chunk",
  },
  {
    type: RELATIONSHIP_TYPES.USED_TECHNOLOGY,
    fromLabel: "Employment",
    toLabel: "Technology",
    description: "An employment used a technology",
  },
  {
    type: RELATIONSHIP_TYPES.ACHIEVED,
    fromLabel: "Employment",
    toLabel: "Achievement",
    description: "An employment achieved something",
  },
  {
    type: RELATIONSHIP_TYPES.INCLUDES_PROJECT,
    fromLabel: "Employment",
    toLabel: "Project",
    description: "An employment includes a project",
  },
  {
    type: RELATIONSHIP_TYPES.AT_INSTITUTION,
    fromLabel: "Education",
    toLabel: "Institution",
    description: "Education at an institution",
  },
  {
    type: RELATIONSHIP_TYPES.FOR_DEGREE,
    fromLabel: "Education",
    toLabel: "Degree",
    description: "Education for a degree",
  },
  {
    type: RELATIONSHIP_TYPES.COVERED,
    fromLabel: "Education",
    toLabel: "Subject",
    description: "Education covered a subject",
  },
  {
    type: RELATIONSHIP_TYPES.DEMONSTRATES,
    fromLabel: "Achievement",
    toLabel: "Skill",
    description: "An achievement demonstrates a skill",
  },
  {
    type: RELATIONSHIP_TYPES.REFERENCED_BY,
    fromLabel: "Employment",
    toLabel: "Reference",
    description: "An employment is referenced by a testimonial",
  },
  {
    type: RELATIONSHIP_TYPES.ADHERES_TO,
    fromLabel: "Profile",
    toLabel: "DesignPrinciple",
    description: "The profile adheres to a design principle",
  },
];
