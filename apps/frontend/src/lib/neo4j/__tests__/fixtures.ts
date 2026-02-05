import type { Neogma } from "neogma";
import type { Models } from "@/lib/neo4j/models";
import { RELATIONSHIP_TYPES } from "@/lib/neo4j/relationships";

export interface TestFixtureData {
  technologies: Array<{ id: string; name: string; category: string }>;
  skills: Array<{ id: string; name: string; level: string }>;
  patterns: Array<{ id: string; name: string; category: string }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    role: string;
    completedDate: string;
    complexity: number;
    fileCount: number;
    technologies: string[];
    skills: string[];
    patterns: string[];
  }>;
  employments: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    technologies: string[];
    achievements: Array<{
      id: string;
      description: string;
      impact: string;
      skills: string[];
    }>;
  }>;
}

export const TEST_FIXTURES: TestFixtureData = {
  technologies: [
    { id: "test-tech-typescript", name: "TypeScript", category: "Language" },
    { id: "test-tech-react", name: "React", category: "Framework" },
    { id: "test-tech-nextjs", name: "Next.js", category: "Framework" },
    { id: "test-tech-neo4j", name: "Neo4j", category: "Database" },
  ],
  skills: [
    {
      id: "test-skill-frontend",
      name: "Frontend Development",
      level: "expert",
    },
    {
      id: "test-skill-architecture",
      name: "System Architecture",
      level: "advanced",
    },
    { id: "test-skill-testing", name: "Testing", level: "advanced" },
  ],
  patterns: [
    {
      id: "test-pattern-atomic",
      name: "Atomic Design",
      category: "Architecture",
    },
    {
      id: "test-pattern-repository",
      name: "Repository Pattern",
      category: "Data Access",
    },
  ],
  projects: [
    {
      id: "test-project-portfolio",
      title: "Portfolio Website",
      description:
        "A personal portfolio built with Next.js and Neo4j for career data",
      role: "Full Stack Developer",
      completedDate: "2024-01-15",
      complexity: 8,
      fileCount: 150,
      technologies: ["TypeScript", "React", "Next.js", "Neo4j"],
      skills: ["Frontend Development", "System Architecture"],
      patterns: ["Atomic Design"],
    },
    {
      id: "test-project-api",
      title: "GraphQL API Service",
      description: "A GraphQL API service with comprehensive testing",
      role: "Backend Developer",
      completedDate: "2023-06-20",
      complexity: 7,
      fileCount: 80,
      technologies: ["TypeScript", "Neo4j"],
      skills: ["System Architecture", "Testing"],
      patterns: ["Repository Pattern"],
    },
  ],
  employments: [
    {
      id: "test-emp-current",
      company: "Test Company",
      position: "Senior Software Engineer",
      startDate: "2022-01-01",
      isCurrent: true,
      description: "Leading frontend development initiatives",
      technologies: ["TypeScript", "React", "Next.js"],
      achievements: [
        {
          id: "test-ach-1",
          description: "Led migration to modern frontend architecture",
          impact: "high",
          skills: ["Frontend Development", "System Architecture"],
        },
        {
          id: "test-ach-2",
          description: "Implemented comprehensive testing strategy",
          impact: "medium",
          skills: ["Testing"],
        },
      ],
    },
  ],
};

export const seedTestFixtures = async (
  models: Models,
  neogma: Neogma,
): Promise<void> => {
  const session = neogma.driver.session();

  try {
    for (const tech of TEST_FIXTURES.technologies) {
      await models.Technology.createOne({
        id: tech.id,
        name: tech.name,
        category: tech.category,
      });
    }

    for (const skill of TEST_FIXTURES.skills) {
      await models.Skill.createOne({
        id: skill.id,
        name: skill.name,
        level: skill.level,
      });
    }

    for (const pattern of TEST_FIXTURES.patterns) {
      await models.Pattern.createOne({
        id: pattern.id,
        name: pattern.name,
        category: pattern.category,
      });
    }

    const dummyEmbedding = new Array(1536).fill(0.1);

    for (const project of TEST_FIXTURES.projects) {
      await models.Project.createOne({
        id: project.id,
        title: project.title,
        description: project.description,
        role: project.role,
        completedDate: project.completedDate,
        complexity: project.complexity,
        fileCount: project.fileCount,
        embedding: dummyEmbedding,
      });

      for (const techName of project.technologies) {
        const tech = TEST_FIXTURES.technologies.find(
          (t) => t.name === techName,
        );
        if (tech) {
          await session.run(
            `
						MATCH (p:Project {id: $projId})
						MATCH (t:Technology {id: $techId})
						MERGE (p)-[:${RELATIONSHIP_TYPES.USES}]->(t)
					`,
            { projId: project.id, techId: tech.id },
          );
        }
      }

      for (const skillName of project.skills) {
        const skill = TEST_FIXTURES.skills.find((s) => s.name === skillName);
        if (skill) {
          await session.run(
            `
						MATCH (p:Project {id: $projId})
						MATCH (s:Skill {id: $skillId})
						MERGE (p)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s)
					`,
            { projId: project.id, skillId: skill.id },
          );
        }
      }

      for (const patternName of project.patterns) {
        const pattern = TEST_FIXTURES.patterns.find(
          (p) => p.name === patternName,
        );
        if (pattern) {
          await session.run(
            `
						MATCH (p:Project {id: $projId})
						MATCH (pat:Pattern {id: $patId})
						MERGE (p)-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat)
					`,
            { projId: project.id, patId: pattern.id },
          );
        }
      }
    }

    for (const emp of TEST_FIXTURES.employments) {
      await models.Employment.createOne({
        id: emp.id,
        company: emp.company,
        position: emp.position,
        startDate: emp.startDate,
        endDate: emp.endDate,
        isCurrent: emp.isCurrent,
        description: emp.description,
        embedding: dummyEmbedding,
      });

      for (const techName of emp.technologies) {
        const tech = TEST_FIXTURES.technologies.find(
          (t) => t.name === techName,
        );
        if (tech) {
          await session.run(
            `
						MATCH (e:Employment {id: $empId})
						MATCH (t:Technology {id: $techId})
						MERGE (e)-[:${RELATIONSHIP_TYPES.USED_TECHNOLOGY}]->(t)
					`,
            { empId: emp.id, techId: tech.id },
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
          const skill = TEST_FIXTURES.skills.find((s) => s.name === skillName);
          if (skill) {
            await session.run(
              `
							MATCH (a:Achievement {id: $achId})
							MATCH (s:Skill {id: $skillId})
							MERGE (a)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s)
						`,
              { achId: achievement.id, skillId: skill.id },
            );
          }
        }
      }
    }
  } finally {
    await session.close();
  }
};

export const clearTestDatabase = async (neogma: Neogma): Promise<void> => {
  const session = neogma.driver.session();
  try {
    await session.run("MATCH (n) DETACH DELETE n");
  } finally {
    await session.close();
  }
};

export const createTestIndexes = async (neogma: Neogma): Promise<void> => {
  const session = neogma.driver.session();

  try {
    const constraints = [
      "CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT employment_id IF NOT EXISTS FOR (e:Employment) REQUIRE e.id IS UNIQUE",
      "CREATE CONSTRAINT achievement_id IF NOT EXISTS FOR (a:Achievement) REQUIRE a.id IS UNIQUE",
      "CREATE CONSTRAINT technology_id IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE",
      "CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT pattern_id IF NOT EXISTS FOR (p:Pattern) REQUIRE p.id IS UNIQUE",
    ];

    for (const constraint of constraints) {
      await session.run(constraint);
    }

    await session.run(`
			CREATE FULLTEXT INDEX project_search IF NOT EXISTS
			FOR (p:Project)
			ON EACH [p.title, p.description, p.role]
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
			CREATE VECTOR INDEX project_vec_idx IF NOT EXISTS
			FOR (p:Project)
			ON (p.embedding)
			OPTIONS {indexConfig: {\`vector.dimensions\`: 1536, \`vector.similarity_function\`: 'cosine'}}
		`);

    await session.run(`
			CREATE VECTOR INDEX employment_vec_idx IF NOT EXISTS
			FOR (e:Employment)
			ON (e.embedding)
			OPTIONS {indexConfig: {\`vector.dimensions\`: 1536, \`vector.similarity_function\`: 'cosine'}}
		`);

    await session.run("CALL db.awaitIndexes(60)");
  } finally {
    await session.close();
  }
};
