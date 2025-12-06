/* v8 ignore file -- @preserve */

import { RunnableLambda } from "@langchain/core/runnables";
import { AgentGraphError } from "@/lib/explore/errors";

interface FakeLLMArgs {
  response: string | undefined;
  model?: string;
  temperature?: number;
  defaultToolName?: string;
}

export const getMockLLM = (
  args: FakeLLMArgs = {
    response: undefined,
  },
) => {
  if (args.temperature && (args.temperature < 0 || args.temperature > 1)) {
    throw new AgentGraphError("Temperature must be between 0 and 1");
  }

  // biome-ignore lint/suspicious/noExplicitAny: LangChain runnable input type
  const mockRunnable = RunnableLambda.from(async (input: any) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    if (!args.response) {
      return {
        content: "No arguments provided to mock LLM",
        tool_calls: [
          {
            name: "final_answer",
            args: {
              answer: "This is a mock response from the LLM.",
              researchSteps: "",
              suggestQuestionOne: "test question one",
              suggestQuestionTwo: "test question two",
              suggestQuestionThree: "test question three",
            },
          },
        ],
      };
    }
    const tool_call = JSON.parse(args.response);
    const parsedInput = `Input received by LLM:\n${JSON.stringify(
      input.lc_kwargs?.messages,
    )?.replace(/\\+/g, "")}`;
    tool_call.args.researchSteps = parsedInput;
    return {
      content: "LLm response:",
      tool_calls: [tool_call],
    };
    // biome-ignore lint/suspicious/noExplicitAny: LangChain type compatibility
  }) as any;

  // biome-ignore lint/suspicious/noExplicitAny: LangChain bindTools signature
  mockRunnable.bindTools = (_tools: any[], _options: any = {}) => {
    return mockRunnable;
  };

  // biome-ignore lint/suspicious/noExplicitAny: LangChain withConfig signature
  mockRunnable.withConfig = (_config: any) => {
    return mockRunnable;
  };

  return mockRunnable;
};
