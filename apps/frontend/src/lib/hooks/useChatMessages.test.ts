import { readStreamableValue } from "@ai-sdk/rsc";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterlocutorType } from "@/lib/explore/constants";
import { useChatStore } from "@/lib/stores/chatStore";
import { useChatMessages } from "./useChatMessages";

vi.mock("@/lib/stores/chatStore");
vi.mock("@ai-sdk/rsc");

const mockUseChatStore = vi.mocked(useChatStore);
const mockReadStreamableValue = vi.mocked(readStreamableValue);

const mockMessages = [
  {
    id: "1",
    content: "Hello",
    type: InterlocutorType.HUMAN,
    inputValue: "Hello",
    thoughts: [],
    quickReplies: [],
  },
];

const mockConfig = {
  model: "gpt-4",
  temperature: 0.7,
};

const mockAction = vi.fn();

const mockGetState = vi.fn();

describe("useChatMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChatStore.mockReturnValue({
      messages: mockMessages,
      setIsTyping: vi.fn(),
      updateMessage: vi.fn(),
      updateThoughts: vi.fn(),
      chatId: "test-chat-id",
      config: mockConfig,
      addMessages: vi.fn(),
      batchUpdate: vi.fn(),
    });
    mockUseChatStore.getState = mockGetState;
    mockGetState.mockReturnValue({
      setScrollPosition: vi.fn(),
      batchUpdate: vi.fn(),
    });
    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {},
    };
    mockReadStreamableValue.mockReturnValue(mockAsyncIterable);
  });

  it("should return messages and sendMessage function", () => {
    const { result } = renderHook(() => useChatMessages(mockAction));

    expect(result.current.messages).toEqual(mockMessages);
    expect(typeof result.current.sendMessage).toBe("function");
  });

  it("should throw error when chatId is missing", async () => {
    const mockSetIsTyping = vi.fn();
    const mockUpdateMessage = vi.fn();
    mockUseChatStore.mockReturnValue({
      messages: mockMessages,
      setIsTyping: mockSetIsTyping,
      updateMessage: mockUpdateMessage,
      updateThoughts: vi.fn(),
      chatId: null,
      config: mockConfig,
      addMessages: vi.fn(),
      batchUpdate: vi.fn(),
    });

    const { result } = renderHook(() => useChatMessages(mockAction));

    await act(async () => {
      await result.current.sendMessage("test message");
    });

    expect(mockUpdateMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        content: "Chat ID is required",
      }),
    );
    expect(mockSetIsTyping).toHaveBeenLastCalledWith(false);
  });

  it("should throw error when config is missing", async () => {
    const mockSetIsTyping = vi.fn();
    const mockUpdateMessage = vi.fn();
    mockUseChatStore.mockReturnValue({
      messages: mockMessages,
      setIsTyping: mockSetIsTyping,
      updateMessage: mockUpdateMessage,
      updateThoughts: vi.fn(),
      chatId: "test-chat-id",
      config: null,
      addMessages: vi.fn(),
      batchUpdate: vi.fn(),
    });

    const { result } = renderHook(() => useChatMessages(mockAction));

    await act(async () => {
      await result.current.sendMessage("test message");
    });

    expect(mockUpdateMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        content: "Config is required",
      }),
    );
    expect(mockSetIsTyping).toHaveBeenLastCalledWith(false);
  });

  it("should throw error when inputValue is missing", async () => {
    const { result } = renderHook(() => useChatMessages(mockAction));

    await expect(result.current.sendMessage("")).rejects.toThrow(
      "Message input value is required",
    );
  });

  it("should handle successful message sending", async () => {
    const mockResponse = {
      answer: "Test response",
      courseLinks: ["link1", "link2"],
      scratchPad: "Test thought",
      totalTokens: 100,
    };

    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield mockResponse;
      },
    };

    mockReadStreamableValue.mockReturnValue(mockAsyncIterable);
    mockAction.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatMessages(mockAction));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(mockAction).toHaveBeenCalledWith(
      "Hello",
      mockConfig,
      mockMessages,
      "test-chat-id",
    );
  });

  it("should handle streaming response with only courseLinks", async () => {
    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield { courseLinks: ["link1", "link2"] };
      },
    };

    mockReadStreamableValue.mockReturnValue(mockAsyncIterable);

    const { result } = renderHook(() => useChatMessages(mockAction));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    const mockStore = mockUseChatStore.mock.results[0].value;
    expect(mockStore.updateMessage).toHaveBeenCalled();
  });

  it("should handle streaming response with only scratchPad", async () => {
    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield { scratchPad: "thinking..." };
      },
    };

    mockReadStreamableValue.mockReturnValue(mockAsyncIterable);

    const { result } = renderHook(() => useChatMessages(mockAction));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    const mockStore = mockUseChatStore.mock.results[0].value;
    expect(mockStore.updateThoughts).toHaveBeenCalled();
  });

  it("should handle streaming response with only answer", async () => {
    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield { answer: "The answer is 42" };
      },
    };

    mockReadStreamableValue.mockReturnValue(mockAsyncIterable);

    const { result } = renderHook(() => useChatMessages(mockAction));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    const mockStore = mockUseChatStore.mock.results[0].value;
    expect(mockStore.updateMessage).toHaveBeenCalled();
  });

  it("should handle streaming response with graphMermaid", async () => {
    const mockSetGraphMermaid = vi.fn();
    mockUseChatStore.mockReturnValue({
      messages: mockMessages,
      setIsTyping: vi.fn(),
      updateMessage: vi.fn(),
      updateThoughts: vi.fn(),
      setGraphMermaid: mockSetGraphMermaid,
      chatId: "test-chat-id",
      config: mockConfig,
      addMessages: vi.fn(),
      batchUpdate: vi.fn(),
    });

    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield { graphMermaid: "graph TD; A-->B;" };
      },
    };

    mockReadStreamableValue.mockReturnValue(mockAsyncIterable);

    const { result } = renderHook(() => useChatMessages(mockAction));

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(mockSetGraphMermaid).toHaveBeenCalledWith("graph TD; A-->B;");
  });

  it("should handle stream errors", async () => {
    const mockError = new Error("Stream error");
    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield { error: mockError };
      },
    };

    mockReadStreamableValue.mockReturnValue(mockAsyncIterable);

    const { result } = renderHook(() => useChatMessages(mockAction));

    await expect(result.current.sendMessage("Hello")).rejects.toThrow(
      "Stream error",
    );
  });

  it("should update scroll position when messagesContainerRef is provided", async () => {
    const mockScrollTop = 100;
    const mockContainer = {
      scrollTop: mockScrollTop,
    } as HTMLDivElement;

    const messagesContainerRef = { current: mockContainer };

    const { result } = renderHook(() =>
      useChatMessages(mockAction, messagesContainerRef),
    );

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(mockGetState().setScrollPosition).toHaveBeenCalledWith(
      mockScrollTop,
    );
  });
});
