import { FeatureFlag } from "@/app/constants";
import { TypographyH2 } from "@/components/atoms/h2";
import { TypographyP } from "@/components/atoms/p";
import { ChatHeader } from "@/components/molecules/chatHeader";
import { GuestButton } from "@/components/molecules/guestBtn";
import { LoginButton } from "@/components/molecules/loginBtn";
import { LoginOverlay } from "@/components/molecules/loginOverlay";
import { ChatClientWrapper } from "@/components/organisms/chatWrapper";
import { ChatLayoutWrapper } from "@/components/organisms/chatWrapper/chatLayoutWrapper";
import { DisabledChat } from "@/components/organisms/disabledChat";
import { createFeatureFlag } from "@/flags";
import { getAgentConfig } from "@/lib/explore/getAgentConfig";
import { getContentConfig } from "@/lib/getContentConfig";
import { getAuth0UserId } from "@/lib/identity/auth0";

const GUEST_CONFIG_PATH = "src/config/guestAgentConfig.json";

interface ChatWrapperProps {
  searchParams?: Promise<{ guest?: string }>;
}

export async function ChatWrapper({ searchParams }: ChatWrapperProps) {
  const resolvedSearchParams = await searchParams;
  const isGuestMode = resolvedSearchParams?.guest === "true";

  const auth0UserId = await getAuth0UserId();
  const isChatEnabled = await createFeatureFlag(FeatureFlag.CHAT, () =>
    Promise.resolve(auth0UserId),
  )();
  const _isHumanEvalEnabled = await createFeatureFlag(
    FeatureFlag.HUMAN_EVAL,
    () => Promise.resolve(auth0UserId),
  )();
  const contentConfig = await getContentConfig();
  const chatHeader = (
    <ChatHeader
      title={<TypographyH2 text={contentConfig.chat.header.title} />}
      subtitle={<TypographyP text={contentConfig.chat.header.subtitle} />}
    />
  );

  if (isGuestMode) {
    const guestConfig = await getAgentConfig(GUEST_CONFIG_PATH);
    const chatComponent = (
      <ChatClientWrapper
        chatId="guest"
        header={chatHeader}
        placeholderTexts={contentConfig.chat.input.placeholder}
        config={guestConfig}
      />
    );

    return (
      <ChatLayoutWrapper
        chatComponent={chatComponent}
        agentConfig={guestConfig}
        agentConfigPath={GUEST_CONFIG_PATH}
        configId="guest-config"
        evaluatorId="guest"
        showEvaluation={true}
      />
    );
  }

  if (isChatEnabled) {
    const agentConfigPath = process.env.AGENT_CONFIG_PATH;
    const agentConfig = await getAgentConfig(agentConfigPath);
    const chatComponent = (
      <ChatClientWrapper
        chatId={auth0UserId}
        header={chatHeader}
        placeholderTexts={contentConfig.chat.input.placeholder}
        config={agentConfig}
      />
    );

    const configId = agentConfigPath ?? "default-config";
    return (
      <ChatLayoutWrapper
        chatComponent={chatComponent}
        agentConfig={agentConfig}
        agentConfigPath={agentConfigPath}
        configId={configId}
        evaluatorId={auth0UserId}
        showEvaluation={true}
      />
    );
  }

  const loginTitle = (
    <TypographyH2 text={contentConfig.chat.loginOverlay.title} />
  );
  const loginDescription = (
    <TypographyP text={contentConfig.chat.loginOverlay.description} />
  );
  const loginButton = (
    <LoginButton text={contentConfig.chat.loginOverlay.loginButton.text} />
  );
  const guestButton = (
    <GuestButton text={contentConfig.chat.loginOverlay.guestButton.text} />
  );
  const loginOverlay = (
    <LoginOverlay
      title={loginTitle}
      description={loginDescription}
      loginButton={loginButton}
      guestButton={guestButton}
    />
  );

  return (
    <DisabledChat
      header={chatHeader}
      placeholderTexts={contentConfig.chat.input.placeholder}
      overlay={loginOverlay}
    />
  );
}
