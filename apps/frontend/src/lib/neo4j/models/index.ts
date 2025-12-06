import type { Neogma } from "neogma";
import { type AchievementModel, createAchievementModel } from "./Achievement";
import { type CodeChunkModel, createCodeChunkModel } from "./CodeChunk";
import { type CodeFileModel, createCodeFileModel } from "./CodeFile";
import { createDegreeModel, type DegreeModel } from "./Degree";
import {
  createDesignPrincipleModel,
  type DesignPrincipleModel,
} from "./DesignPrinciple";
import { createEducationModel, type EducationModel } from "./Education";
import { createEmploymentModel, type EmploymentModel } from "./Employment";
import { createInstitutionModel, type InstitutionModel } from "./Institution";
import { createPatternModel, type PatternModel } from "./Pattern";
import { createProfileModel, type ProfileModel } from "./Profile";
import { createProjectModel, type ProjectModel } from "./Project";
import { createReferenceModel, type ReferenceModel } from "./Reference";
import { createSkillModel, type SkillModel } from "./Skill";
import { createSubjectModel, type SubjectModel } from "./Subject";
import { createTechnologyModel, type TechnologyModel } from "./Technology";

export interface Models {
  Project: ProjectModel;
  Employment: EmploymentModel;
  Education: EducationModel;
  Achievement: AchievementModel;
  Technology: TechnologyModel;
  Skill: SkillModel;
  Pattern: PatternModel;
  Institution: InstitutionModel;
  Degree: DegreeModel;
  Subject: SubjectModel;
  CodeChunk: CodeChunkModel;
  CodeFile: CodeFileModel;
  Profile: ProfileModel;
  Reference: ReferenceModel;
  DesignPrinciple: DesignPrincipleModel;
}

export const createModels = (neogma: Neogma): Models => ({
  Project: createProjectModel(neogma),
  Employment: createEmploymentModel(neogma),
  Education: createEducationModel(neogma),
  Achievement: createAchievementModel(neogma),
  Technology: createTechnologyModel(neogma),
  Skill: createSkillModel(neogma),
  Pattern: createPatternModel(neogma),
  Institution: createInstitutionModel(neogma),
  Degree: createDegreeModel(neogma),
  Subject: createSubjectModel(neogma),
  CodeChunk: createCodeChunkModel(neogma),
  CodeFile: createCodeFileModel(neogma),
  Profile: createProfileModel(neogma),
  Reference: createReferenceModel(neogma),
  DesignPrinciple: createDesignPrincipleModel(neogma),
});

export type {
  AchievementModel,
  AchievementProperties,
} from "./Achievement";
export type {
  CodeChunkModel,
  CodeChunkProperties,
} from "./CodeChunk";
export type {
  CodeFileModel,
  CodeFileProperties,
} from "./CodeFile";
export type { DegreeModel, DegreeProperties } from "./Degree";
export type {
  DesignPrincipleModel,
  DesignPrincipleProperties,
} from "./DesignPrinciple";
export type {
  EducationModel,
  EducationProperties,
} from "./Education";
export type {
  EmploymentModel,
  EmploymentProperties,
} from "./Employment";
export type {
  InstitutionModel,
  InstitutionProperties,
} from "./Institution";
export type { PatternModel, PatternProperties } from "./Pattern";
export type { ProfileModel, ProfileProperties } from "./Profile";
export type {
  ProjectModel,
  ProjectProperties,
} from "./Project";
export type { ReferenceModel, ReferenceProperties } from "./Reference";
export type { SkillModel, SkillProperties } from "./Skill";
export type { SubjectModel, SubjectProperties } from "./Subject";
export type {
  TechnologyModel,
  TechnologyProperties,
} from "./Technology";
