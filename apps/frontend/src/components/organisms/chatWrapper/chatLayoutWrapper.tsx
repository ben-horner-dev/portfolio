"use client";

import { ConfigPanel } from "@/components/organisms/configPanel";
import { EvaluationFormWrapper } from "@/components/organisms/evaluationForm/evaluationFormWrapper";
import type { AgentConfig } from "@/lib/explore/types";
import { useChatStore } from "@/lib/stores/chatStore";

interface ChatLayoutWrapperProps {
  chatComponent: React.ReactNode;
  agentConfig: AgentConfig;
  agentConfigPath?: string;
  configId: string;
  evaluatorId?: string;
  showEvaluation?: boolean;
}

export function ChatLayoutWrapper({
  chatComponent,
  agentConfig,
  agentConfigPath,
  configId,
  evaluatorId,
  showEvaluation = true,
}: ChatLayoutWrapperProps) {
  const showPanels = useChatStore((state) => state.showPanels);

  return (
    <div
      data-testid="chat-layout-wrapper"
      className={`flex flex-col xl:flex-row xl:gap-6 items-center justify-center w-full h-full overflow-y-auto xl:overflow-hidden xl:px-6 xl:py-0 ${
        showPanels ? "snap-y snap-mandatory xl:snap-none" : ""
      }`}
    >
      {/* Top spacer - snap section 1 (mobile only when panels shown) */}
      {showPanels && (
        <div className="snap-start snap-always shrink-0 min-h-screen w-full xl:hidden" />
      )}

      {/* Config Panel - snap section 2 */}
      <div
        className={`order-2 xl:order-1 transition-all duration-300 ease-in-out ${
          showPanels
            ? "snap-start snap-always w-full xl:w-auto xl:flex-[0.7] min-h-screen xl:min-h-0 xl:h-[75vh] opacity-100 p-4 xl:p-0 flex items-center justify-center"
            : "w-0 h-0 xl:flex-[0] opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-full h-fit max-h-[80vh] xl:h-full xl:max-h-none overflow-y-auto">
          <ConfigPanel
            config={agentConfig}
            branchUrl={agentConfigPath}
            className="w-full xl:w-auto h-full min-w-[300px] xl:min-w-[400px]"
          />
        </div>
      </div>

      {/* Chat - snap section 3, always visible, always centered */}
      <div
        className={`w-full xl:w-auto xl:flex-1 order-1 xl:order-2 shrink-0 xl:shrink p-4 xl:p-0 flex items-center justify-center ${
          showPanels ? "snap-start snap-always min-h-screen xl:min-h-0" : ""
        }`}
      >
        <div className="w-full h-fit">{chatComponent}</div>
      </div>

      {/* Evaluation Form - snap section 4 */}
      {showEvaluation && (
        <div
          className={`order-3 transition-all duration-300 ease-in-out delay-75 ${
            showPanels
              ? "snap-start snap-always w-full xl:w-auto xl:flex-[0.7] min-h-screen xl:min-h-0 xl:h-[75vh] opacity-100 p-4 xl:p-0 flex items-center justify-center"
              : "w-0 h-0 xl:flex-[0] opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-full h-fit max-h-[80vh] xl:h-full xl:max-h-none overflow-y-auto">
            <EvaluationFormWrapper
              configId={configId}
              evaluatorId={evaluatorId ?? "anonymous"}
              className="w-full xl:w-auto h-full min-w-[300px] xl:min-w-[400px]"
            />
          </div>
        </div>
      )}

      {/* Bottom spacer - snap section 5 (mobile only when panels shown) */}
      {showPanels && (
        <div className="snap-start snap-always shrink-0 min-h-screen w-full xl:hidden" />
      )}
    </div>
  );
}
