import {
  checkDailyTokenCount,
  updateTokenCount,
} from "@/lib/explore/agent/tokenCount";
import { InterlocutorType } from "@/lib/explore/constants";
import { AgentGraphError } from "@/lib/explore/errors";
import type {
  AgentResponse,
  AgentServerAction,
  ChatMessage,
} from "@/lib/explore/types";
import { getLogger } from "@/lib/logger";
import { useChatStore } from "@/lib/stores/chatStore";
import { readStreamableValue } from "@ai-sdk/rsc";
import { useCallback } from "react";
export const useChatMessages = (
  action: AgentServerAction,
  messagesContainerRef?: React.RefObject<HTMLDivElement | null>
) => {
  const {
    messages,
    setIsTyping,
    updateMessage,
    updateThoughts,
    setGraphMermaid,
    chatId,
    config,
  } = useChatStore();

  const sendMessage = useCallback(
    async (message: string) => {
      const logger = getLogger();
      setIsTyping(true);
      if (!message.trim()) {
        throw new Error("Message input value is required");
      }
      const newMessage = {
        id: crypto.randomUUID(),
        content: null,
        type: InterlocutorType.AI,
        timestamp: new Date().toISOString(),
        thoughts: [],
        quickReplies: [],
        inputValue: message,
      } as ChatMessage;
      try {
        if (!chatId) {
          throw new AgentGraphError("Chat ID is required");
        }
        if (!config) {
          throw new AgentGraphError("Config is required");
        }
        const humanMessage = {
          id: crypto.randomUUID(),
          content: message,
          type: InterlocutorType.HUMAN,
          timestamp: new Date().toISOString(),
          thoughts: [],
          quickReplies: [],
        };
        useChatStore.getState().batchUpdate({
          messages: [...messages, humanMessage, newMessage],
          isTyping: true,
          scrollPosition: messagesContainerRef?.current?.scrollTop || 0,
        });

        const tokenCheckResult = await checkDailyTokenCount(chatId);
        if (!tokenCheckResult.success) {
          throw new AgentGraphError(tokenCheckResult.error);
        }
        const user = tokenCheckResult.user;
        const isGuest = tokenCheckResult.isGuest ?? false;

        if (messagesContainerRef?.current) {
          const { setScrollPosition } = useChatStore.getState();
          setScrollPosition(messagesContainerRef.current.scrollTop);
        }

        setIsTyping(true);

        const response = await action(
          message,
          config,
          messages,
          String(chatId)
        );
        let tokens = 0;
        for await (const streamIteration of readStreamableValue(
          response
        ) as AsyncIterable<AgentResponse>) {
          if (streamIteration?.error) {
            throw streamIteration.error;
          }
          if (streamIteration?.courseLinks) {
            newMessage.quickReplies = streamIteration.courseLinks;
          }
          if (streamIteration?.scratchPad) {
            newMessage.thoughts.push(streamIteration.scratchPad);

            updateThoughts(newMessage.id, newMessage.thoughts);
          }
          if (streamIteration?.answer) {
            newMessage.content = streamIteration.answer;
          }
          if (streamIteration?.totalTokens) {
            tokens += streamIteration.totalTokens;
          }
          if (streamIteration?.graphMermaid) {
            setGraphMermaid(streamIteration.graphMermaid);
          }
          updateMessage(newMessage.id, {
            ...newMessage,
          });
        }
        setIsTyping(false);
        if (!isGuest) {
          await updateTokenCount(user, tokens);
        }
      } catch (error) {
        logger.error(error);
        setIsTyping(false);

        const isUserFacingError =
          error instanceof AgentGraphError ||
          (error as Error)?.name.includes("UserFacingErrors");

        if (isUserFacingError) {
          updateMessage(newMessage.id, {
            ...newMessage,
            content: (error as Error).message,
          });
          return;
        }

        updateMessage(newMessage.id, {
          ...newMessage,
          content: "Oops, something went wrong. Please try again.",
        });
        throw error;
      }
    },
    [
      messages,
      setIsTyping,
      updateMessage,
      updateThoughts,
      setGraphMermaid,
      chatId,
      config,
      action,
      messagesContainerRef,
    ]
  );

  return { messages, sendMessage };
};
