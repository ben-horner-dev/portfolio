import { OpenAIEmbeddings } from "@langchain/openai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentGraphError } from "@/lib/explore/errors";
import { getEmbeddings } from "./getEmbeddings";

vi.mock("@langchain/openai", () => ({
  OpenAIEmbeddings: vi.fn().mockImplementation(function (
    this: unknown,
    config: unknown,
  ) {
    return config;
  }),
}));

vi.mock("@/lib/explore/errors", () => ({
  AgentGraphError: vi.fn().mockImplementation((message) => {
    const error = new Error(message);
    error.name = "AgentGraphError";
    return error;
  }),
}));

describe("getEmbeddings", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw an error when OPENAI_API_KEY environment variable is missing", async () => {
    process.env.OPENAI_API_KEY = undefined;

    await expect(getEmbeddings("text-embedding-3-small")).rejects.toThrow(
      "OPENAI_API_KEY environment variable required",
    );

    expect(OpenAIEmbeddings).not.toHaveBeenCalled();
  });

  it("should return OpenAIEmbeddings instance when API key is present and model is supported", async () => {
    process.env.OPENAI_API_KEY = "test-api-key";

    const result = await getEmbeddings("text-embedding-3-small");

    expect(result).toEqual({
      openAIApiKey: "test-api-key",
      modelName: "text-embedding-3-small",
      stripNewLines: true,
    });
    expect(OpenAIEmbeddings).toHaveBeenCalledWith({
      openAIApiKey: "test-api-key",
      modelName: "text-embedding-3-small",
      stripNewLines: true,
    });
  });

  it("should throw AgentGraphError for unsupported embedding model", async () => {
    const unsupportedModel = "unsupported-model";

    await expect(getEmbeddings(unsupportedModel)).rejects.toThrow();

    expect(AgentGraphError).toHaveBeenCalledWith(
      `Embedding strategy not supported: ${unsupportedModel}. Supported strategies: text-embedding-3-small`,
    );

    expect(OpenAIEmbeddings).not.toHaveBeenCalled();
  });
});
