export interface EmploymentData {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  technologies: string[];
  achievements: AchievementData[];
}

export interface AchievementData {
  id: string;
  description: string;
  impact: "high" | "medium" | "low";
  skills: string[];
}

export interface EducationData {
  id: string;
  institution: string;
  institutionLocation: string | null;
  degree: string;
  degreeLevel: string;
  grade: string | null;
  startDate: string;
  endDate: string;
  subjects: string[];
}

export interface SkillData {
  id: string;
  name: string;
  level: "expert" | "advanced" | "intermediate" | "beginner";
}

export interface TechnologyData {
  id: string;
  name: string;
  category: string;
}

export const EMPLOYMENT_DATA: EmploymentData[] = [
  {
    id: "emp-electric-kiwi",
    company: "Electric Kiwi",
    position: "Lead Software Engineer (Contract)",
    startDate: "2025-09-01",
    endDate: null,
    isCurrent: true,
    description:
      "Leading a team of engineers on a major customer service platform migration from internal solution to Zendesk. Complex serverless data migration pipeline architecture and development with ETL processes, concurrency management, validation and observability.",
    technologies: [
      "TypeScript",
      "Next.js",
      "AWS",
      "Lambda",
      "Serverless",
      "Zendesk",
      "ETL",
    ],
    achievements: [
      {
        id: "ach-ek-1",
        description:
          "Leading major customer service platform migration from internal solution to Zendesk",
        impact: "high",
        skills: ["Leadership", "Architecture", "Project Management"],
      },
      {
        id: "ach-ek-2",
        description:
          "Designed and developed complex serverless data migration pipeline with ETL processes, concurrency management, validation and observability",
        impact: "high",
        skills: ["Architecture", "AWS", "ETL"],
      },
      {
        id: "ach-ek-3",
        description:
          "Designed embedded app using SSR-first Next.js architecture with config-driven content, atomic design and custom CMS principles",
        impact: "high",
        skills: ["Frontend Architecture", "Next.js", "Design Systems"],
      },
      {
        id: "ach-ek-4",
        description:
          "Sole project lead coordinating distributed teams across NZ and India, managing dependencies between internal departments and external vendors",
        impact: "high",
        skills: ["Leadership", "Project Management", "Stakeholder Management"],
      },
      {
        id: "ach-ek-5",
        description:
          "Conducted full discovery phase and requirements gathering, translating ambiguous business needs into actionable technical specifications",
        impact: "high",
        skills: ["Requirements Analysis", "Technical Specification"],
      },
      {
        id: "ach-ek-6",
        description:
          "Pioneered LLM-assisted BDD/TDD workflow combining AI pair programming with rigorous test coverage for rapid delivery",
        impact: "high",
        skills: ["AI/ML", "TDD", "Innovation"],
      },
      {
        id: "ach-ek-7",
        description:
          "Established and mentored distributed team on AI-augmented development practices, improving velocity and code quality",
        impact: "high",
        skills: ["Mentoring", "AI/ML", "Team Development"],
      },
    ],
  },
  {
    id: "emp-crimson",
    company: "Crimson Education",
    position: "Lead Software Engineer",
    startDate: "2024-09-01",
    endDate: "2025-09-01",
    isCurrent: false,
    description:
      "Leading microservices to monolith migration using ECS, turbo and Fastify. Redesigning data model and schema using Prisma and Kysley. Deploying AWS cloud infrastructure as code using Terraform.",
    technologies: [
      "TypeScript",
      "Node.js",
      "AWS",
      "ECS",
      "Terraform",
      "Prisma",
      "Kysley",
      "Fastify",
      "Next.js",
      "Vercel",
      "tRPC",
      "GitHub Actions",
    ],
    achievements: [
      {
        id: "ach-crimson-1",
        description:
          "Increased deployment frequency by 4x and eliminated failure rate through microservices to monolith migration",
        impact: "high",
        skills: ["Architecture", "DevOps", "Leadership"],
      },
      {
        id: "ach-crimson-2",
        description:
          "Optimized API endpoints and database queries to improve p50 performance by 10x",
        impact: "high",
        skills: ["Performance Optimization", "Database Design"],
      },
      {
        id: "ach-crimson-3",
        description:
          "Improved FCP for global users by 1.5 seconds through SSR edge frontend refactoring",
        impact: "high",
        skills: ["Frontend Performance", "Next.js"],
      },
      {
        id: "ach-crimson-4",
        description:
          "Reduced codebase by tens of thousands of lines, improving maintainability and reducing maintenance costs",
        impact: "high",
        skills: ["Code Quality", "Refactoring"],
      },
      {
        id: "ach-crimson-5",
        description:
          "Implemented tRPC for end-to-end type safety, replacing client generation step",
        impact: "medium",
        skills: ["TypeScript", "API Design"],
      },
      {
        id: "ach-crimson-6",
        description:
          "Established ATDD processes from project management through to unit testing",
        impact: "medium",
        skills: ["Testing", "Process Improvement"],
      },
    ],
  },
  {
    id: "emp-quantspark",
    company: "QuantSpark",
    position: "Lead Software Engineer SDE 3",
    startDate: "2023-04-01",
    endDate: "2024-09-01",
    isCurrent: false,
    description:
      "Leading simultaneous workstreams for multiple FinTech and Logistics clients. Making project-wide architectural design decisions. Creating LLM-based POCs and implementing RAG architecture.",
    technologies: [
      "Python",
      "TypeScript",
      "PostgreSQL",
      "Azure Cognitive Search",
      "Pinecone",
      "LangChain",
      "Faiss",
      "OpenAI",
    ],
    achievements: [
      {
        id: "ach-qs-1",
        description:
          "Led simultaneous workstreams for multiple FinTech and Logistics clients",
        impact: "high",
        skills: ["Leadership", "Project Management"],
      },
      {
        id: "ach-qs-2",
        description:
          "Created multiple LLM-based POCs and implemented RAG architecture with Pinecone and Azure Cognitive Search",
        impact: "high",
        skills: ["LLM", "RAG", "Vector Databases"],
      },
      {
        id: "ach-qs-3",
        description: "Fine-tuned LLMs to domain-specific contexts",
        impact: "high",
        skills: ["Machine Learning", "NLP"],
      },
      {
        id: "ach-qs-4",
        description:
          "Designed and implemented database migrations for PostgreSQL",
        impact: "medium",
        skills: ["Database Design", "PostgreSQL"],
      },
      {
        id: "ach-qs-5",
        description: "Mentored junior developers and performed code reviews",
        impact: "medium",
        skills: ["Mentoring", "Code Review"],
      },
      {
        id: "ach-qs-6",
        description:
          "Applied design patterns and SOLID principles to analysts' notebook-based code",
        impact: "medium",
        skills: ["Design Patterns", "Code Quality"],
      },
    ],
  },
  {
    id: "emp-novartis",
    company: "Novartis",
    position: "Senior Software Engineer",
    startDate: "2022-06-01",
    endDate: "2023-03-01",
    isCurrent: false,
    description:
      "Led project to release in January 2023. Responsible for frontend, backend, database, AI integration and DevOps. NLP engine to assist Bio-Researchers in study design.",
    technologies: [
      "Python",
      "Flask",
      "FastAPI",
      "JavaScript",
      "React",
      "Docker",
      "Kubernetes",
      "Ray",
      "Azure",
      "AWS",
      "MySQL",
      "SQLAlchemy",
      "Jenkins",
    ],
    achievements: [
      {
        id: "ach-nov-1",
        description:
          "Led project to release and presented to SteerCo to secure second round of funding",
        impact: "high",
        skills: ["Leadership", "Stakeholder Management"],
      },
      {
        id: "ach-nov-2",
        description:
          "Built NLP engine to assist Bio-Researchers in study design",
        impact: "high",
        skills: ["NLP", "Machine Learning"],
      },
      {
        id: "ach-nov-3",
        description:
          "Implemented microservice architecture with strategy, template, factory and MVC patterns",
        impact: "medium",
        skills: ["Architecture", "Design Patterns"],
      },
      {
        id: "ach-nov-4",
        description:
          "Deployed using Docker and Kubernetes (Ray) on Azure and AWS",
        impact: "medium",
        skills: ["DevOps", "Cloud Infrastructure"],
      },
    ],
  },
  {
    id: "emp-trace",
    company: "Trace and Circle",
    position: "Software Engineer",
    startDate: "2021-05-01",
    endDate: "2022-06-01",
    isCurrent: false,
    description:
      "Design and deployment of POC dialog engine. Python, Rasa and SpaCy based, deployed on GCP and Kubernetes with MongoDB NoSQL db.",
    technologies: ["Python", "Rasa", "SpaCy", "GCP", "Kubernetes", "MongoDB"],
    achievements: [
      {
        id: "ach-trace-1",
        description:
          "Helped secure a 7-figure contract with a Fortune 500 firm through POC dialog engine",
        impact: "high",
        skills: ["NLP", "Business Development"],
      },
      {
        id: "ach-trace-2",
        description:
          "Designed and deployed conversational AI analysis tools for call center interactions",
        impact: "high",
        skills: ["NLP", "Dialog Systems"],
      },
    ],
  },
  {
    id: "emp-freelance",
    company: "Freelance",
    position: "Software Engineer",
    startDate: "2017-08-01",
    endDate: "2021-05-01",
    isCurrent: false,
    description:
      "Led multiple E-commerce and Social Networking projects to deployment. Python, Django, Docker based with MySQL.",
    technologies: [
      "Python",
      "Django",
      "Docker",
      "MySQL",
      "SQLAlchemy",
      "Kivy",
      "Redis",
      "Celery",
      "OAuth2",
    ],
    achievements: [
      {
        id: "ach-free-1",
        description:
          "Secured 20% revenue increase between Q3 2019 and Q4 2020 for clients",
        impact: "high",
        skills: ["E-commerce", "Full Stack Development"],
      },
      {
        id: "ach-free-2",
        description:
          "Led multiple E-commerce and Social Networking projects to deployment",
        impact: "high",
        skills: ["Project Management", "Full Stack Development"],
      },
      {
        id: "ach-free-3",
        description: "Integrated OAuth2 with Google, Facebook and GitHub",
        impact: "medium",
        skills: ["Authentication", "API Integration"],
      },
    ],
  },
  {
    id: "emp-kings",
    company: "King's College, Panama",
    position: "Head of Computer Science & E-Learning Coordinator",
    startDate: "2012-08-01",
    endDate: "2017-07-01",
    isCurrent: false,
    description:
      "Head of a successful computer science department teaching students computer science theory up to undergrad level. E-Learning Coordinator guiding staff and clients on e-learning technologies.",
    technologies: ["Python"],
    achievements: [
      {
        id: "ach-kings-1",
        description:
          "Achieved 100% pass rate A-C and 25% added value grades to undergrad level",
        impact: "high",
        skills: ["Teaching", "Curriculum Development"],
      },
      {
        id: "ach-kings-2",
        description:
          "Developed CS curriculum including OOP, algorithms, database design and graph theory",
        impact: "high",
        skills: ["Curriculum Development", "Education"],
      },
      {
        id: "ach-kings-3",
        description:
          "Managed 5 staff members across Business and CS departments",
        impact: "medium",
        skills: ["People Management", "Leadership"],
      },
    ],
  },
  {
    id: "emp-slade",
    company: "Slade",
    position: "Project Manager",
    startDate: "2004-08-01",
    endDate: "2012-07-01",
    isCurrent: false,
    description:
      "Managed projects implementing efficiency-increasing automated processes in accounts receivable department. Designed and developed tools to maximize staff productivity.",
    technologies: ["VBA"],
    achievements: [
      {
        id: "ach-slade-1",
        description: "Saved the firm $70,000 in the first 3 months of arrival",
        impact: "high",
        skills: ["Process Automation", "Cost Reduction"],
      },
      {
        id: "ach-slade-2",
        description: "Developed automated billing processes and trained staff",
        impact: "high",
        skills: ["Automation", "Training"],
      },
      {
        id: "ach-slade-3",
        description: "Managed a team of 4 in accounts receivable",
        impact: "medium",
        skills: ["Team Management", "Leadership"],
      },
    ],
  },
];

export const EDUCATION_DATA: EducationData[] = [
  {
    id: "edu-ou",
    institution: "The Open University",
    institutionLocation: "UK",
    degree: "Applied Linguistics",
    degreeLevel: "MA",
    grade: "Distinction",
    startDate: "2017-09-01",
    endDate: "2019-08-01",
    subjects: [
      "Systemic Functional Grammar",
      "Sociocultural Linguistics",
      "Applied Linguistic Techniques in Programming Education",
    ],
  },
  {
    id: "edu-herts",
    institution: "University of Hertfordshire",
    institutionLocation: "UK",
    degree: "Computer Science",
    degreeLevel: "BSc",
    grade: "2:1",
    startDate: "2001-09-01",
    endDate: "2004-07-01",
    subjects: [
      "Algorithms and Data Structures",
      "Software Architecture",
      "Discrete Mathematics",
      "Programming Paradigms",
      "Data Modeling and Databases",
    ],
  },
];

export const TECHNOLOGY_DATA: TechnologyData[] = [
  { id: "tech-typescript", name: "TypeScript", category: "Language" },
  { id: "tech-javascript", name: "JavaScript", category: "Language" },
  { id: "tech-python", name: "Python", category: "Language" },
  { id: "tech-vba", name: "VBA", category: "Language" },

  { id: "tech-react", name: "React", category: "Frontend" },
  { id: "tech-nextjs", name: "Next.js", category: "Frontend" },
  { id: "tech-html", name: "HTML", category: "Frontend" },
  { id: "tech-css", name: "CSS", category: "Frontend" },

  { id: "tech-nodejs", name: "Node.js", category: "Backend" },
  { id: "tech-fastify", name: "Fastify", category: "Backend" },
  { id: "tech-flask", name: "Flask", category: "Backend" },
  { id: "tech-fastapi", name: "FastAPI", category: "Backend" },
  { id: "tech-django", name: "Django", category: "Backend" },
  { id: "tech-trpc", name: "tRPC", category: "Backend" },

  { id: "tech-postgresql", name: "PostgreSQL", category: "Database" },
  { id: "tech-mysql", name: "MySQL", category: "Database" },
  { id: "tech-mongodb", name: "MongoDB", category: "Database" },
  { id: "tech-redis", name: "Redis", category: "Database" },
  { id: "tech-neo4j", name: "Neo4j", category: "Database" },
  { id: "tech-prisma", name: "Prisma", category: "Database" },
  { id: "tech-kysley", name: "Kysley", category: "Database" },
  { id: "tech-sqlalchemy", name: "SQLAlchemy", category: "Database" },

  { id: "tech-aws", name: "AWS", category: "Cloud" },
  { id: "tech-azure", name: "Azure", category: "Cloud" },
  { id: "tech-gcp", name: "GCP", category: "Cloud" },
  { id: "tech-vercel", name: "Vercel", category: "Cloud" },
  { id: "tech-ecs", name: "ECS", category: "Cloud" },
  { id: "tech-lambda", name: "Lambda", category: "Cloud" },
  { id: "tech-serverless", name: "Serverless", category: "Cloud" },

  { id: "tech-zendesk", name: "Zendesk", category: "Platform" },
  { id: "tech-etl", name: "ETL", category: "Data" },

  { id: "tech-docker", name: "Docker", category: "DevOps" },
  { id: "tech-kubernetes", name: "Kubernetes", category: "DevOps" },
  { id: "tech-terraform", name: "Terraform", category: "DevOps" },
  { id: "tech-jenkins", name: "Jenkins", category: "DevOps" },
  { id: "tech-github-actions", name: "GitHub Actions", category: "DevOps" },

  { id: "tech-langchain", name: "LangChain", category: "AI/ML" },
  { id: "tech-openai", name: "OpenAI", category: "AI/ML" },
  { id: "tech-pinecone", name: "Pinecone", category: "AI/ML" },
  {
    id: "tech-azure-cognitive",
    name: "Azure Cognitive Search",
    category: "AI/ML",
  },
  { id: "tech-faiss", name: "Faiss", category: "AI/ML" },
  { id: "tech-rasa", name: "Rasa", category: "AI/ML" },
  { id: "tech-spacy", name: "SpaCy", category: "AI/ML" },
  { id: "tech-ray", name: "Ray", category: "AI/ML" },

  { id: "tech-kivy", name: "Kivy", category: "Mobile" },
  { id: "tech-oauth2", name: "OAuth2", category: "Authentication" },
  { id: "tech-celery", name: "Celery", category: "Queue" },
];

export const SKILL_DATA: SkillData[] = [
  { id: "skill-leadership", name: "Leadership", level: "expert" },
  { id: "skill-architecture", name: "Software Architecture", level: "expert" },
  { id: "skill-design-patterns", name: "Design Patterns", level: "expert" },
  { id: "skill-database-design", name: "Database Design", level: "expert" },
  { id: "skill-full-stack", name: "Full Stack Development", level: "expert" },
  { id: "skill-devops", name: "DevOps", level: "advanced" },
  { id: "skill-cicd", name: "CI/CD", level: "advanced" },
  { id: "skill-testing", name: "Test Driven Development", level: "advanced" },
  { id: "skill-nlp", name: "Natural Language Processing", level: "advanced" },
  { id: "skill-llm", name: "Large Language Models", level: "advanced" },
  { id: "skill-rag", name: "RAG Architecture", level: "advanced" },
  { id: "skill-mentoring", name: "Mentoring", level: "advanced" },
  { id: "skill-code-review", name: "Code Review", level: "expert" },
  {
    id: "skill-stakeholder",
    name: "Stakeholder Management",
    level: "advanced",
  },
  { id: "skill-agile", name: "Agile Methodologies", level: "advanced" },
  {
    id: "skill-performance",
    name: "Performance Optimization",
    level: "advanced",
  },
  { id: "skill-api-design", name: "API Design", level: "expert" },
  { id: "skill-microservices", name: "Microservices", level: "advanced" },
  { id: "skill-distributed", name: "Distributed Systems", level: "advanced" },
];

export interface ProfileData {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  bio: string;
  mission: string;
}

export interface ReferenceData {
  id: string;
  referrerName: string;
  referrerTitle: string;
  referrerCompany: string;
  referrerEmail?: string;
  referrerPhone?: string;
  relationship: string;
  dateWritten: string;
  testimonial: string;
  keyQualities: string[];
  employmentId: string;
}

export interface DesignPrincipleData {
  id: string;
  name: string;
  category: string;
  description: string;
  keyPoints: string[];
}

export const PROFILE_DATA: ProfileData = {
  id: "profile-ben-horner",
  name: "Ben Horner",
  title: "Lead Full Stack Engineer",
  email: "info@benhorner.dev",
  phone: "0226206456",
  location: "Muriwai, Auckland",
  portfolioUrl: "https://benhorner.dev",
  githubUrl: "https://github.com/ben-horner-dev",
  linkedinUrl: "https://linkedin.com/in/ben-horner-dev",
  bio: `I have always loved creating things but it was only when I became a developer that I felt I was really able to express that creativity with freedom. I started my career as a Sound Engineer and music producer in 1998, not only did this inherently require me to have a deeper understanding of electronic engineering and how computers work but also led me to formally study Computer Science itself. I began working in the tech industry in Australia for a pharmaceutical firm called Slade where I managed projects that implemented various efficiency increasing, automated processes in the accounts receivable department. I needed to take the initiative and sell my ideas to decision makers while sharing knowledge with existing staff on how to use the tools that I had designed and developed to maximize their productivity. I saved the firm $70,000 in the first 3 months of my arrival and this led to me receiving sponsorship to relocate to Australia permanently. I was then offered the opportunity to become Head of Computer Science in Panama in 2012 and it was during this role that I really honed my people skills, managing multiple teachers in both Business and Computer Science departments. I also found a renewed passion for Software Engineering, revisiting the fundamental principles that I had studied at University: OOP principles, project management, mathematics, algorithms, database design and graph theory. Working in the international education sector also gave me the opportunity to become fluent in Spanish and gain experience in communicating effectively with colleagues from other cultures. This experience led me to discover a synergy between my passions for programming and linguistics in the form of NLP. I then began to study for a Masters in applied linguistics while working as a freelance full stack developer in 2017. Upon graduation I started working and then leading various full stack projects from e-commerce (I helped EyM to become one of the leading e-commerce platforms in Central America) to social-networking (Products I designed were instrumental in increasing Arhat's revenue by 20%) before deciding to leverage my academic expertise in linguistics by pivoting to NLP in 2021. Here I took on a development role at Trace and Circle who ultimately were awarded a 7 figure contract with a huge fortune 500 company.`,
  mission:
    "Whichever field my focus is on and whichever technology I use, my mission as a Software Engineer will always be to create elegant apps that are reliable, maintainable and scalable through the use of design patterns, clean code and test driven development.",
};

export const REFERENCE_DATA: ReferenceData[] = [
  {
    id: "ref-seth-freach",
    referrerName: "Seth Freach",
    referrerTitle: "Line Manager",
    referrerCompany: "QuantSpark",
    referrerEmail: "seth.freach@gmail.com",
    referrerPhone: "+44 7927 016800",
    relationship: "Line Manager",
    dateWritten: "2024-08-15",
    testimonial: `Ben is a highly dependable individual who consistently demonstrates a strong work ethic and a commitment to excellence. He is someone who can be counted on to meet deadlines, fulfil responsibilities, and go above and beyond when needed. His reliability has made him a cornerstone of our project teams, and his contributions have consistently led to successful outcomes in our projects. In addition to his reliability, Ben is a person of integrity and high moral character. He approaches his work and interactions with honesty, respect, and a positive attitude, making him well-liked and respected by his colleagues. He has a natural ability to collaborate effectively with others, often taking the initiative to support his teammates and ensure that team goals are met. Ben's dedication to our team and his willingness to contribute to the success of the group have been evident throughout his time with us. He has proven to be a valuable team player, always willing to lend a hand, share his knowledge, and work collaboratively towards common objectives.`,
    keyQualities: [
      "Reliability",
      "Strong work ethic",
      "Commitment to excellence",
      "Integrity",
      "Collaboration",
      "Team player",
      "Initiative",
    ],
    employmentId: "emp-quantspark",
  },
  {
    id: "ref-stephan-spiegel",
    referrerName: "Stephan Spiegel",
    referrerTitle: "Product Manager",
    referrerCompany: "Novartis",
    relationship: "Product Manager (worked closely on project)",
    dateWritten: "2023-03-01",
    testimonial: `Ben is an excellent problem-solver and possesses a deep understanding of software development principles, best practices and programming languages, specifically Python, React, system architecture and database design. He is a quick learner and helped understand, adapt and integrate other teams' code bases into the project while helping to guide architectural decisions and work collaboratively with the UI/UX team to realise their vision. His code is well-organised, efficient, and easily maintainable, which resulted in a reliable and high-quality software solution that helped the project gain additional funding. In addition to his technical abilities, Ben has excellent communication skills, which have been essential in both bridging the gap between technical and non-technical stakeholders and working with colleagues from all over the world to achieve project milestones. He is a great team player, always willing to help out and collaborate with others to achieve common goals.`,
    keyQualities: [
      "Problem-solving",
      "Technical expertise",
      "Quick learner",
      "Architectural guidance",
      "Code quality",
      "Communication",
      "Cross-cultural collaboration",
    ],
    employmentId: "emp-novartis",
  },
];

export const DESIGN_PRINCIPLE_DATA: DesignPrincipleData[] = [
  {
    id: "dp-code-style",
    name: "Code Style",
    category: "Code Quality",
    description:
      "Guidelines for writing clean, maintainable code with consistent patterns and conventions.",
    keyPoints: [
      "Use arrow functions as the default choice",
      "Limit functions to 3 parameters or fewer",
      "Each function should do one thing and do it well (Single Responsibility)",
      "Use early returns and guard clauses to flatten nested logic",
      "Use absolute imports with aliases (@/) over relative imports",
      "Prefer colocation - keep types close to where they're used",
    ],
  },
  {
    id: "dp-self-documenting-code",
    name: "Self-Documenting Code",
    category: "Documentation",
    description:
      "If you feel the need to write an inline comment, extract that logic into a well-named function instead.",
    keyPoints: [
      "Make code self-documenting through descriptive function and variable names",
      "Extract logic into well-named functions instead of adding comments",
      "Comments acceptable for: external API quirks, performance optimizations, regulatory requirements",
      "Document complex logic at package level in markdown files",
      "Required docs: README.md, API specs, Architecture Decision Records",
    ],
  },
  {
    id: "dp-testing",
    name: "Testing Requirements",
    category: "Quality Assurance",
    description:
      "100% unit test coverage required for new code with focus on extracting testable logic into pure functions.",
    keyPoints: [
      "100% unit test coverage required for new code",
      "Extract testable logic into pure functions",
      "Integration tests for critical workflows with mocked dependencies",
      "E2E tests for critical flows only",
      "Use vitest for TypeScript/JavaScript testing",
    ],
  },
  {
    id: "dp-atomic-design",
    name: "Atomic Design Pattern",
    category: "Frontend Architecture",
    description:
      "Build interfaces as hierarchical systems rather than collections of pages.",
    keyPoints: [
      "Atoms: Basic HTML elements (buttons, inputs, labels)",
      "Molecules: Simple groups of atoms functioning together",
      "Organisms: Complex components composed of molecules and atoms",
      "Templates: Page-level layout structures",
      "Pages: Specific instances with real content",
      "Focus on creating portable, reusable components",
    ],
  },
  {
    id: "dp-error-handling",
    name: "Fail Fast Error Handling",
    category: "Error Management",
    description:
      "Validate inputs immediately and let errors bubble up to appropriate handlers.",
    keyPoints: [
      "Validate inputs immediately - fail at the boundary",
      "Don't catch errors unless you can meaningfully handle them",
      "Let errors bubble up to appropriate handlers",
      "Use custom error types for specific scenarios",
      "Centralize error handling at high levels of abstraction",
    ],
  },
  {
    id: "dp-conventional-commits",
    name: "Conventional Commits",
    category: "Version Control",
    description:
      "All commits follow the Conventional Commits specification for clear, semantic versioning.",
    keyPoints: [
      "Format: <type>[scope]: <description>",
      "Types: feat, fix, docs, style, refactor, perf, test, chore",
      "Use imperative mood in descriptions",
      "Keep under 72 characters",
      "Scope indicates area of change",
    ],
  },
  {
    id: "dp-pr-size",
    name: "Pull Request Size Guidelines",
    category: "Code Review",
    description:
      "Keep PRs small and focused for faster review cycles and better code quality.",
    keyPoints: [
      "Ideal: 200-400 lines of changes",
      "Maximum: 800 lines of changes",
      "If PR is too big, sub-task your Linear ticket",
      "Separate refactoring from feature work",
      "Each feature should be its own PR",
    ],
  },
];
