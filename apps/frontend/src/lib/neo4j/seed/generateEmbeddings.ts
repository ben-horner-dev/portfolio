import { getEmbeddings } from "@/lib/explore/vector/getEmbeddings";

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 20;
const EMBEDDING_DIMENSION = 1536;

export interface EmbeddableDocument {
  id: string;
  text: string;
}

export interface EmbeddedDocument {
  id: string;
  embedding: number[];
}

export const generateEmbeddingsForDocuments = async (
  documents: EmbeddableDocument[],
  modelName: string = DEFAULT_EMBEDDING_MODEL,
): Promise<EmbeddedDocument[]> => {
  const embedder = await getEmbeddings(modelName);
  const results: EmbeddedDocument[] = [];

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    const texts = batch.map((doc) => doc.text);

    console.log(
      `Generating embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(documents.length / BATCH_SIZE)}...`,
    );

    const embeddings = await embedder.embedDocuments(texts);

    for (let j = 0; j < batch.length; j++) {
      results.push({
        id: batch[j].id,
        embedding: embeddings[j],
      });
    }
  }

  return results;
};

export const createProjectEmbeddingText = (project: {
  title: string;
  description: string;
  role: string;
  technologies: string[];
  patterns: string[];
}): string => {
  const parts = [
    `Title: ${project.title}`,
    `Description: ${project.description}`,
    `Role: ${project.role}`,
    project.technologies.length > 0
      ? `Technologies: ${project.technologies.join(", ")}`
      : null,
    project.patterns.length > 0
      ? `Design Patterns: ${project.patterns.join(", ")}`
      : null,
  ];

  return parts.filter(Boolean).join("\n");
};

export const createEmploymentEmbeddingText = (employment: {
  company: string;
  position: string;
  description: string;
  technologies: string[];
  achievements: string[];
}): string => {
  const parts = [
    `Position: ${employment.position} at ${employment.company}`,
    `Description: ${employment.description}`,
    employment.technologies.length > 0
      ? `Technologies: ${employment.technologies.join(", ")}`
      : null,
    employment.achievements.length > 0
      ? `Achievements: ${employment.achievements.join("; ")}`
      : null,
  ];

  return parts.filter(Boolean).join("\n");
};

export { DEFAULT_EMBEDDING_MODEL, EMBEDDING_DIMENSION };
