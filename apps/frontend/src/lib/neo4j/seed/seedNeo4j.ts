import "dotenv/config";
import { Neogma } from "neogma";
import {
  DESIGN_PRINCIPLE_DATA,
  EDUCATION_DATA,
  EMPLOYMENT_DATA,
  PROFILE_DATA,
  REFERENCE_DATA,
  SKILL_DATA,
  TECHNOLOGY_DATA,
} from "@/lib/neo4j/data/cvData";
import { createModels, type Models } from "@/lib/neo4j/models";
import { RELATIONSHIP_TYPES } from "@/lib/neo4j/relationships";
import {
  createEmploymentEmbeddingText,
  createProjectEmbeddingText,
  EMBEDDING_DIMENSION,
  generateEmbeddingsForDocuments,
} from "@/lib/neo4j/seed/generateEmbeddings";
import {
  type ParsedProject,
  parseYekFiles,
} from "@/lib/neo4j/seed/parseYekFiles";

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASS = process.env.NEO4J_PASS;

interface SeedOptions {
  clearExisting?: boolean;
  generateEmbeddings?: boolean;
}

const createIndexes = async (neogma: Neogma): Promise<void> => {
  const session = neogma.driver.session();

  try {
    console.log("Creating constraints and indexes...");

    const constraints = [
      "CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT employment_id IF NOT EXISTS FOR (e:Employment) REQUIRE e.id IS UNIQUE",
      "CREATE CONSTRAINT education_id IF NOT EXISTS FOR (ed:Education) REQUIRE ed.id IS UNIQUE",
      "CREATE CONSTRAINT achievement_id IF NOT EXISTS FOR (a:Achievement) REQUIRE a.id IS UNIQUE",
      "CREATE CONSTRAINT technology_id IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE",
      "CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT pattern_id IF NOT EXISTS FOR (p:Pattern) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT institution_id IF NOT EXISTS FOR (i:Institution) REQUIRE i.id IS UNIQUE",
      "CREATE CONSTRAINT degree_id IF NOT EXISTS FOR (d:Degree) REQUIRE d.id IS UNIQUE",
      "CREATE CONSTRAINT subject_id IF NOT EXISTS FOR (s:Subject) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT codefile_id IF NOT EXISTS FOR (cf:CodeFile) REQUIRE cf.id IS UNIQUE",
      "CREATE CONSTRAINT codechunk_id IF NOT EXISTS FOR (cc:CodeChunk) REQUIRE cc.id IS UNIQUE",
      "CREATE CONSTRAINT profile_id IF NOT EXISTS FOR (p:Profile) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT reference_id IF NOT EXISTS FOR (r:Reference) REQUIRE r.id IS UNIQUE",
      "CREATE CONSTRAINT designprinciple_id IF NOT EXISTS FOR (dp:DesignPrinciple) REQUIRE dp.id IS UNIQUE",
    ];

    for (const constraint of constraints) {
      await session.run(constraint);
    }

    console.log("Creating vector indexes...");

    await session.run(`
			CREATE VECTOR INDEX project_vec_idx IF NOT EXISTS
			FOR (p:Project)
			ON (p.embedding)
			OPTIONS {indexConfig: {
				\`vector.dimensions\`: ${EMBEDDING_DIMENSION},
				\`vector.similarity_function\`: 'cosine'
			}}
		`);

    await session.run(`
			CREATE VECTOR INDEX employment_vec_idx IF NOT EXISTS
			FOR (e:Employment)
			ON (e.embedding)
			OPTIONS {indexConfig: {
				\`vector.dimensions\`: ${EMBEDDING_DIMENSION},
				\`vector.similarity_function\`: 'cosine'
			}}
		`);

    console.log("Creating fulltext indexes...");

    await session.run(`
			CREATE FULLTEXT INDEX project_search IF NOT EXISTS
			FOR (p:Project)
			ON EACH [p.title, p.description, p.role, p.impact]
		`);

    await session.run(`
			CREATE FULLTEXT INDEX employment_search IF NOT EXISTS
			FOR (e:Employment)
			ON EACH [e.company, e.position, e.description]
		`);

    await session.run(`
			CREATE FULLTEXT INDEX achievement_search IF NOT EXISTS
			FOR (a:Achievement)
			ON EACH [a.description]
		`);

    await session.run(`
			CREATE FULLTEXT INDEX reference_search IF NOT EXISTS
			FOR (r:Reference)
			ON EACH [r.testimonial, r.keyQualities]
		`);

    await session.run(`
			CREATE FULLTEXT INDEX designprinciple_search IF NOT EXISTS
			FOR (dp:DesignPrinciple)
			ON EACH [dp.name, dp.description, dp.keyPoints]
		`);

    console.log("Indexes created successfully.");
  } finally {
    await session.close();
  }
};

const clearDatabase = async (neogma: Neogma): Promise<void> => {
  const session = neogma.driver.session();
  try {
    console.log("Clearing existing data...");
    await session.run("MATCH (n) DETACH DELETE n");
    console.log("Database cleared.");
  } finally {
    await session.close();
  }
};

const seedTechnologies = async (models: Models): Promise<void> => {
  console.log("Seeding technologies...");

  for (const tech of TECHNOLOGY_DATA) {
    await models.Technology.createOne({
      id: tech.id,
      name: tech.name,
      category: tech.category,
    });
  }

  console.log(`Seeded ${TECHNOLOGY_DATA.length} technologies.`);
};

const seedSkills = async (models: Models): Promise<void> => {
  console.log("Seeding skills...");

  for (const skill of SKILL_DATA) {
    await models.Skill.createOne({
      id: skill.id,
      name: skill.name,
      level: skill.level,
    });
  }

  console.log(`Seeded ${SKILL_DATA.length} skills.`);
};

const seedProfile = async (models: Models, neogma: Neogma): Promise<void> => {
  console.log("Seeding profile...");
  const session = neogma.driver.session();

  try {
    await models.Profile.createOne({
      id: PROFILE_DATA.id,
      name: PROFILE_DATA.name,
      title: PROFILE_DATA.title,
      email: PROFILE_DATA.email,
      phone: PROFILE_DATA.phone,
      location: PROFILE_DATA.location,
      portfolioUrl: PROFILE_DATA.portfolioUrl,
      githubUrl: PROFILE_DATA.githubUrl,
      linkedinUrl: PROFILE_DATA.linkedinUrl,
      bio: PROFILE_DATA.bio,
      mission: PROFILE_DATA.mission,
    });

    console.log("Seeded profile.");
  } finally {
    await session.close();
  }
};

const seedReferences = async (
  models: Models,
  neogma: Neogma,
): Promise<void> => {
  console.log("Seeding references...");
  const session = neogma.driver.session();

  try {
    for (const ref of REFERENCE_DATA) {
      await models.Reference.createOne({
        id: ref.id,
        referrerName: ref.referrerName,
        referrerTitle: ref.referrerTitle,
        referrerCompany: ref.referrerCompany,
        referrerEmail: ref.referrerEmail,
        referrerPhone: ref.referrerPhone,
        relationship: ref.relationship,
        dateWritten: ref.dateWritten,
        testimonial: ref.testimonial,
        keyQualities: ref.keyQualities.join(", "),
        embedding: undefined,
      });

      await session.run(
        `
				MATCH (e:Employment {id: $empId})
				MATCH (r:Reference {id: $refId})
				MERGE (e)-[:${RELATIONSHIP_TYPES.REFERENCED_BY}]->(r)
			`,
        { empId: ref.employmentId, refId: ref.id },
      );
    }

    console.log(`Seeded ${REFERENCE_DATA.length} references.`);
  } finally {
    await session.close();
  }
};

const seedDesignPrinciples = async (
  models: Models,
  neogma: Neogma,
): Promise<void> => {
  console.log("Seeding design principles...");
  const session = neogma.driver.session();

  try {
    for (const dp of DESIGN_PRINCIPLE_DATA) {
      await models.DesignPrinciple.createOne({
        id: dp.id,
        name: dp.name,
        category: dp.category,
        description: dp.description,
        keyPoints: dp.keyPoints.join(" | "),
        embedding: undefined,
      });

      await session.run(
        `
				MATCH (p:Profile {id: $profileId})
				MATCH (dp:DesignPrinciple {id: $dpId})
				MERGE (p)-[:${RELATIONSHIP_TYPES.ADHERES_TO}]->(dp)
			`,
        { profileId: PROFILE_DATA.id, dpId: dp.id },
      );
    }

    console.log(`Seeded ${DESIGN_PRINCIPLE_DATA.length} design principles.`);
  } finally {
    await session.close();
  }
};

const seedEmployment = async (
  models: Models,
  neogma: Neogma,
): Promise<void> => {
  console.log("Seeding employment data...");
  const session = neogma.driver.session();

  try {
    for (const emp of EMPLOYMENT_DATA) {
      await models.Employment.createOne({
        id: emp.id,
        company: emp.company,
        position: emp.position,
        startDate: emp.startDate,
        endDate: emp.endDate ?? undefined,
        isCurrent: emp.isCurrent,
        description: emp.description,
        embedding: undefined,
      });

      for (const techName of emp.technologies) {
        const techId = TECHNOLOGY_DATA.find((t) => t.name === techName)?.id;
        if (techId) {
          await session.run(
            `
						MATCH (e:Employment {id: $empId})
						MATCH (t:Technology {id: $techId})
						MERGE (e)-[:${RELATIONSHIP_TYPES.USED_TECHNOLOGY}]->(t)
					`,
            { empId: emp.id, techId },
          );
        }
      }

      for (const achievement of emp.achievements) {
        await models.Achievement.createOne({
          id: achievement.id,
          description: achievement.description,
          impact: achievement.impact,
        });

        await session.run(
          `
					MATCH (e:Employment {id: $empId})
					MATCH (a:Achievement {id: $achId})
					MERGE (e)-[:${RELATIONSHIP_TYPES.ACHIEVED}]->(a)
				`,
          { empId: emp.id, achId: achievement.id },
        );

        for (const skillName of achievement.skills) {
          const skillId = SKILL_DATA.find((s) => s.name === skillName)?.id;
          if (skillId) {
            await session.run(
              `
							MATCH (a:Achievement {id: $achId})
							MATCH (s:Skill {id: $skillId})
							MERGE (a)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s)
						`,
              { achId: achievement.id, skillId },
            );
          }
        }
      }
    }

    console.log(`Seeded ${EMPLOYMENT_DATA.length} employment records.`);
  } finally {
    await session.close();
  }
};

const seedEducation = async (models: Models, neogma: Neogma): Promise<void> => {
  console.log("Seeding education data...");
  const session = neogma.driver.session();

  try {
    for (const edu of EDUCATION_DATA) {
      const institutionId = `inst-${edu.id}`;
      const degreeId = `deg-${edu.id}`;

      await models.Institution.createOne({
        id: institutionId,
        name: edu.institution,
        location: edu.institutionLocation ?? undefined,
      });

      await models.Degree.createOne({
        id: degreeId,
        name: edu.degree,
        level: edu.degreeLevel,
      });

      await models.Education.createOne({
        id: edu.id,
        grade: edu.grade ?? undefined,
        startDate: edu.startDate,
        endDate: edu.endDate,
      });

      await session.run(
        `
				MATCH (ed:Education {id: $eduId})
				MATCH (i:Institution {id: $instId})
				MERGE (ed)-[:${RELATIONSHIP_TYPES.AT_INSTITUTION}]->(i)
			`,
        { eduId: edu.id, instId: institutionId },
      );

      await session.run(
        `
				MATCH (ed:Education {id: $eduId})
				MATCH (d:Degree {id: $degId})
				MERGE (ed)-[:${RELATIONSHIP_TYPES.FOR_DEGREE}]->(d)
			`,
        { eduId: edu.id, degId: degreeId },
      );

      for (let i = 0; i < edu.subjects.length; i++) {
        const subjectId = `subj-${edu.id}-${i}`;
        await models.Subject.createOne({
          id: subjectId,
          name: edu.subjects[i],
        });

        await session.run(
          `
					MATCH (ed:Education {id: $eduId})
					MATCH (s:Subject {id: $subjId})
					MERGE (ed)-[:${RELATIONSHIP_TYPES.COVERED}]->(s)
				`,
          { eduId: edu.id, subjId: subjectId },
        );
      }
    }

    console.log(`Seeded ${EDUCATION_DATA.length} education records.`);
  } finally {
    await session.close();
  }
};

const seedProjects = async (
  models: Models,
  neogma: Neogma,
  projects: ParsedProject[],
): Promise<void> => {
  console.log("Seeding projects...");
  const session = neogma.driver.session();
  const patternCache = new Map<string, string>();

  try {
    for (const project of projects) {
      await models.Project.createOne({
        id: project.id,
        title: project.title,
        description: project.description,
        role: project.role,
        impact: undefined,
        completedDate: project.completedDate,
        complexity: project.complexity,
        fileCount: project.fileCount,
        liveUrl: undefined,
        githubUrl: undefined,
        embedding: undefined,
      });

      for (const techName of project.technologies) {
        let techId = TECHNOLOGY_DATA.find((t) => t.name === techName)?.id;

        if (!techId) {
          techId = `tech-${techName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          try {
            await models.Technology.createOne({
              id: techId,
              name: techName,
              category: "Detected",
            });
          } catch {
            // Technology might already exist
          }
        }

        await session.run(
          `
					MATCH (p:Project {id: $projId})
					MATCH (t:Technology {id: $techId})
					MERGE (p)-[:${RELATIONSHIP_TYPES.USES}]->(t)
				`,
          { projId: project.id, techId },
        );
      }

      for (const patternName of project.patterns) {
        let patternId = patternCache.get(patternName);

        if (!patternId) {
          patternId = `pat-${patternName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          patternCache.set(patternName, patternId);

          try {
            await models.Pattern.createOne({
              id: patternId,
              name: patternName,
              category: "Design Pattern",
            });
          } catch {
            // Pattern might already exist
          }
        }

        await session.run(
          `
					MATCH (p:Project {id: $projId})
					MATCH (pat:Pattern {id: $patId})
					MERGE (p)-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat)
				`,
          { projId: project.id, patId: patternId },
        );
      }

      const MAX_CODE_FILES = 10;
      const MAX_CODE_CHUNKS = 5;

      for (
        let i = 0;
        i < Math.min(project.codeFiles.length, MAX_CODE_FILES);
        i++
      ) {
        const file = project.codeFiles[i];
        await models.CodeFile.createOne({
          id: file.id,
          path: file.path,
          language: file.language,
          lineCount: file.lineCount,
        });

        await session.run(
          `
					MATCH (p:Project {id: $projId})
					MATCH (cf:CodeFile {id: $fileId})
					MERGE (p)-[:${RELATIONSHIP_TYPES.CONTAINS}]->(cf)
				`,
          { projId: project.id, fileId: file.id },
        );
      }

      for (
        let i = 0;
        i < Math.min(project.codeChunks.length, MAX_CODE_CHUNKS);
        i++
      ) {
        const chunk = project.codeChunks[i];
        await models.CodeChunk.createOne({
          id: chunk.id,
          type: chunk.type,
          content: chunk.content.slice(0, 10000),
          filePath: chunk.filePath,
          language: chunk.language,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
        });

        await session.run(
          `
					MATCH (p:Project {id: $projId})
					MATCH (cc:CodeChunk {id: $chunkId})
					MERGE (p)-[:${RELATIONSHIP_TYPES.HAS_CHUNK}]->(cc)
				`,
          { projId: project.id, chunkId: chunk.id },
        );
      }
    }

    console.log(`Seeded ${projects.length} projects.`);
  } finally {
    await session.close();
  }
};

const generateAndAttachEmbeddings = async (
  neogma: Neogma,
  projects: ParsedProject[],
): Promise<void> => {
  console.log("Generating embeddings...");
  const session = neogma.driver.session();

  try {
    const projectDocs = projects.map((p) => ({
      id: p.id,
      text: createProjectEmbeddingText({
        title: p.title,
        description: p.description,
        role: p.role,
        technologies: p.technologies,
        patterns: p.patterns,
      }),
    }));

    const employmentDocs = EMPLOYMENT_DATA.map((e) => ({
      id: e.id,
      text: createEmploymentEmbeddingText({
        company: e.company,
        position: e.position,
        description: e.description,
        technologies: e.technologies,
        achievements: e.achievements.map((a) => a.description),
      }),
    }));

    console.log("Generating project embeddings...");
    const projectEmbeddings = await generateEmbeddingsForDocuments(projectDocs);

    for (const emb of projectEmbeddings) {
      await session.run(
        "MATCH (p:Project {id: $id}) SET p.embedding = $embedding",
        { id: emb.id, embedding: emb.embedding },
      );
    }

    console.log("Generating employment embeddings...");
    const employmentEmbeddings =
      await generateEmbeddingsForDocuments(employmentDocs);

    for (const emb of employmentEmbeddings) {
      await session.run(
        "MATCH (e:Employment {id: $id}) SET e.embedding = $embedding",
        { id: emb.id, embedding: emb.embedding },
      );
    }

    console.log("Embeddings generated and attached.");
  } finally {
    await session.close();
  }
};

export const seedNeo4j = async (options: SeedOptions = {}): Promise<void> => {
  const { clearExisting = true, generateEmbeddings = true } = options;

  if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASS) {
    throw new Error(
      "NEO4J_URI, NEO4J_USER, and NEO4J_PASS environment variables must be set",
    );
  }

  const neogma = new Neogma({
    url: NEO4J_URI,
    username: NEO4J_USER,
    password: NEO4J_PASS,
  });

  const models = createModels(neogma);

  try {
    console.log("Starting Neo4j seed...");
    console.log(`Connected to: ${NEO4J_URI}`);

    if (clearExisting) {
      await clearDatabase(neogma);
    }

    await createIndexes(neogma);

    console.log("Parsing yek files...");
    const projects = await parseYekFiles();
    console.log(`Found ${projects.length} projects in yek files.`);

    await seedTechnologies(models);
    await seedSkills(models);
    await seedProfile(models, neogma);
    await seedEmployment(models, neogma);
    await seedEducation(models, neogma);
    await seedReferences(models, neogma);
    await seedDesignPrinciples(models, neogma);
    await seedProjects(models, neogma, projects);

    if (generateEmbeddings) {
      await generateAndAttachEmbeddings(neogma, projects);
    }

    console.log("Seed completed successfully!");
  } finally {
    await neogma.driver.close();
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedNeo4j()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
