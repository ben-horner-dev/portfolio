import { createStreamableValue } from "@ai-sdk/rsc";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AgentGraphError,
  TracedAgentGraphError,
  UnexpectedAgentGraphError,
} from "@/lib/explore/errors";
import { agent } from "./agent";

vi.mock("@/lib/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  }),
}));

vi.mock("next/src/server/web/spec-extension/unstable-cache", () => ({
  unstable_cache: vi.fn((fn) => fn),
}));

vi.mock("@/lib/identity/auth0", () => ({
  getAuth0UserId: vi.fn(),
}));

vi.mock("@/lib/explore/agent/tokenCount", () => ({
  checkDailyTokenCount: vi.fn(),
  updateTokenCount: vi.fn(),
}));

vi.mock("@/lib/explore/maps", async () => {
  return {
    AGENT_ERRORS: {
      parentError: AgentGraphError,
      unExpectedError: UnexpectedAgentGraphError,
      tracedError: TracedAgentGraphError,
    },
    DEFAULT_TOOL_MAP: {},
    DETERMINISTIC_TOOL_MAP: {},
    TOOL_STATE_BINDINGS: {},
    DEFAULT_LLM_MAP: {},
    DEFAULT_FORMATTER_MAP: {},
  };
});
vi.mock("@ai-sdk/rsc", () => ({
  createStreamableValue: vi.fn((initialValue) => {
    let currentValue = initialValue;
    return {
      get value() {
        return currentValue;
      },
      update: vi.fn((newValue) => {
        currentValue = newValue;
      }),
      done: vi.fn(),
    };
  }),
}));

vi.mock("@/lib/explore/getAgentConfig/getAgentConfig", () => ({
  getAgentConfig: vi.fn().mockResolvedValue({
    name: "mock-config",
    llms: [],
    answerFormatters: [],
    tools: [{ name: "final_answer", description: "test" }],
  }),
}));

vi.mock("@/lib/ContentConfig/getContentConfig", () => ({
  getContentConfigForLocale: vi.fn().mockResolvedValue({
    chat: {
      defaultErrorMessage: "Test error message from config",
    },
  }),
}));

import {
  checkDailyTokenCount,
  updateTokenCount,
} from "@/lib/explore/agent/tokenCount";
import { getAuth0UserId } from "@/lib/identity/auth0";

const mockGetAuth0UserId = vi.mocked(getAuth0UserId);
const mockCheckDailyTokenCount = vi.mocked(checkDailyTokenCount);
const mockUpdateTokenCount = vi.mocked(updateTokenCount);

const mockLLM = () => "custom response";
const mockFormatter = () => "formatted response";
class MockGraphFactory {
  execute() {
    return {
      prompt: [],
      llm: mockLLM,
      answerFormatter: mockFormatter,
      tools: [],
    };
  }
}

const mockUser = {
  id: "1",
  name: null,
  email: "test@example.com",
  authId: "auth0|user123",
  tokens: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

class MockAgentOrchestrator {
  execute() {
    return Promise.resolve({
      answer: "test answer",
      graphMermaid: "graph",
      courseLinks: [],
      totalTokens: 42,
    });
  }
}

class MockAgentOrchestratorErrorThrowe {
  execute() {
    throw Error("test error");
  }
}

describe("agent", () => {
  beforeEach(() => {
    mockGetAuth0UserId.mockResolvedValue("auth0|user123");
    mockCheckDailyTokenCount.mockResolvedValue({
      success: true,
      user: mockUser,
    });
    mockUpdateTokenCount.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should reject unauthenticated non-guest users", async () => {
    mockGetAuth0UserId.mockResolvedValue(undefined);

    await agent(
      "test_message",
      {} as any,
      [],
      "not-guest",
      undefined,
      undefined,
      undefined,
      MockAgentOrchestrator as any,
      MockGraphFactory as any,
    );

    const mockCreateStreamableValue = vi.mocked(createStreamableValue);
    const streamInstance = mockCreateStreamableValue.mock.results[0].value;

    expect(streamInstance.update.mock.calls.length).to.eq(1);
    const updateCall = streamInstance.update.mock.calls[0][0];
    expect(updateCall.error).instanceOf(AgentGraphError);
    expect(updateCall.error.message).to.eq(
      "Authentication required. Please log in to use the chat.",
    );
    expect(streamInstance.done.mock.calls.length).to.eq(1);
  });

  it("should allow guest users without auth", async () => {
    mockGetAuth0UserId.mockResolvedValue(undefined);
    mockCheckDailyTokenCount.mockResolvedValue({
      success: true,
      user: mockUser,
      isGuest: true,
    });

    await agent(
      "test_message",
      {} as any,
      [],
      "guest",
      undefined,
      undefined,
      undefined,
      MockAgentOrchestrator as any,
      MockGraphFactory as any,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCheckDailyTokenCount).toHaveBeenCalledWith("guest");
    expect(mockUpdateTokenCount).not.toHaveBeenCalled();
  });

  it("should reject when token limit is reached", async () => {
    mockCheckDailyTokenCount.mockResolvedValue({
      success: false,
      error: "Token limit reached",
    });

    await agent(
      "test_message",
      {} as any,
      [],
      "test",
      undefined,
      undefined,
      undefined,
      MockAgentOrchestrator as any,
      MockGraphFactory as any,
    );

    const mockCreateStreamableValue = vi.mocked(createStreamableValue);
    const streamInstance = mockCreateStreamableValue.mock.results[0].value;

    expect(streamInstance.update.mock.calls.length).to.eq(1);
    const updateCall = streamInstance.update.mock.calls[0][0];
    expect(updateCall.error).instanceOf(AgentGraphError);
    expect(updateCall.error.message).to.eq("Token limit reached");
    expect(streamInstance.done.mock.calls.length).to.eq(1);
  });

  it("should use auth id as chat id for authenticated users", async () => {
    await agent(
      "test_message",
      {} as any,
      [],
      "client-supplied-id",
      undefined,
      undefined,
      undefined,
      MockAgentOrchestrator as any,
      MockGraphFactory as any,
    );

    expect(mockCheckDailyTokenCount).toHaveBeenCalledWith("auth0|user123");
  });

  it("should create stream and execute agent with basic parameters", async () => {
    const chatHistory = [] as any;
    const chatId = "test";
    const config = {} as any;

    await agent(
      "test_message",
      config,
      chatHistory,
      chatId,
      undefined,
      undefined,
      undefined,
      MockAgentOrchestrator as any,
      MockGraphFactory as any,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    const mockCreateStreamableValue = vi.mocked(createStreamableValue);
    const streamInstance = mockCreateStreamableValue.mock.results[0].value;

    expect(streamInstance.update.mock.calls.length).to.eq(1);
    expect(streamInstance.done.mock.calls.length).to.eq(1);
  });

  it("should update token count for authenticated users after execution", async () => {
    await agent(
      "test_message",
      {} as any,
      [],
      "test",
      undefined,
      undefined,
      undefined,
      MockAgentOrchestrator as any,
      MockGraphFactory as any,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockUpdateTokenCount).toHaveBeenCalledWith(mockUser, 42);
  });

  it("should create stream with placeholders and error", async () => {
    const chatHistory = [] as any;
    const chatId = "test";
    const config = {} as any;

    await agent(
      "test_message",
      config,
      chatHistory,
      chatId,
      undefined,
      undefined,
      undefined,
      MockAgentOrchestratorErrorThrowe as any,
      MockGraphFactory as any,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    const mockCreateStreamableValue = vi.mocked(createStreamableValue);
    const streamInstance = mockCreateStreamableValue.mock.results[0].value;

    expect(streamInstance.update.mock.calls.length).to.eq(1);
    const updateCall = streamInstance.update.mock.calls[0][0];
    expect(updateCall.answer).to.eq("");
    expect(updateCall.graphMermaid).to.eq("");
    expect(updateCall.richContent).to.eq(undefined);
    expect(updateCall.error).instanceOf(Error);
    expect(updateCall.error.message).to.eq("test error");
    expect(streamInstance.done.mock.calls.length).to.eq(1);
  });
});
