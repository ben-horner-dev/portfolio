interface ChatMessagesWrapperProps {
  children: React.ReactNode;
  messagesContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessagesWrapper({
  children,
  messagesContainerRef,
}: ChatMessagesWrapperProps & { onScroll?: () => void }) {
  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 min-h-60 max-h-[50vh] overflow-y-auto p-6 space-y-4 bg-transparent"
    >
      {children}
    </div>
  );
}
