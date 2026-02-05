import { create } from "zustand";
import { InterlocutorType } from "@/lib/explore/constants";
import type { AgentConfig, ChatMessage } from "@/lib/explore/types";

interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  isTyping: boolean;
  sentMessageIds: Set<string>;
  thoughts: Record<string, string[]>; // messageId -> thoughts array
  graphMermaid: string;
  showPanels: boolean;
  setShowPanels: (show: boolean) => void;
  togglePanels: () => void;
  setInputValue: (value: string) => void;
  addMessages: (messages: ChatMessage[]) => void;
  setIsTyping: (typing: boolean) => void;
  clearInput: () => void;
  resetChat: () => void;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
  updateMessage: (id: string, message: ChatMessage) => void;
  markMessageAsSent: (id: string) => void;
  isMessageSent: (id: string) => boolean;
  updateThoughts: (messageId: string, thoughts: string[]) => void;
  getThoughts: (messageId: string) => string[];
  setGraphMermaid: (graph: string) => void;
  chatId: string | undefined;
  setChatId: (chatId: string) => void;
  config: AgentConfig | undefined;
  setConfig: (config: AgentConfig) => void;
  batchUpdate: (updates: Partial<ChatState>) => void;
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    content:
      "Hi! I'm Ben. Feel free to ask me anything about my projects, skills, or experience. What would you like to know?",
    type: InterlocutorType.AI,
    timestamp: new Date().toISOString(),
    quickReplies: [
      "Tell me about your projects",
      "What technologies do you use?",
      "What's your experience level?",
    ],
    thoughts: [],
  },
];

export const useChatStore = create<ChatState>((set, get) => ({
  config: undefined,
  setConfig: (config: AgentConfig) => set({ config }),
  chatId: undefined,
  setChatId: (chatId: string) => set({ chatId }),
  messages: initialMessages,
  inputValue: "",
  isTyping: false,
  sentMessageIds: new Set<string>(),
  thoughts: {},
  graphMermaid: "",
  setGraphMermaid: (graph: string) => set({ graphMermaid: graph }),
  showPanels: false,
  setShowPanels: (show: boolean) => set({ showPanels: show }),
  togglePanels: () => set((state) => ({ showPanels: !state.showPanels })),
  setInputValue: (value) => set({ inputValue: value }),
  addMessages: (message) =>
    set((state) => ({
      messages: [...state.messages, ...message],
    })),
  setIsTyping: (typing) => set({ isTyping: typing }),
  clearInput: () => set({ inputValue: "" }),
  resetChat: () =>
    set({
      messages: initialMessages,
      inputValue: "",
      isTyping: false,
      sentMessageIds: new Set<string>(),
      thoughts: {},
      graphMermaid: "",
    }),
  scrollPosition: 0,
  setScrollPosition: (position) => set({ scrollPosition: position }),
  updateMessage: (id, message) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? message : m)),
    })),
  markMessageAsSent: (id) =>
    set((state) => ({
      sentMessageIds: new Set([...state.sentMessageIds, id]),
    })),
  isMessageSent: (id) => get().sentMessageIds.has(id),
  updateThoughts: (messageId, thoughts) =>
    set((state) => ({
      thoughts: { ...state.thoughts, [messageId]: thoughts },
    })),
  getThoughts: (messageId) => get().thoughts[messageId] || [],
  batchUpdate: (updates) => set(updates),
}));
