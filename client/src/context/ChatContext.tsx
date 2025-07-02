import { createContext, useContext } from "react";
import useChatSocket from "../hooks/useChatSocket";

interface Message {
    text: string;
    sender: string;
    datetime: Date;
}

interface ChatContextType {
    input: string;
    messages: Message[];
    typingUsers: Set<string>;
    username: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChatSocket();

    return (
        <ChatContext.Provider value={chat}>
            {children}
        </ChatContext.Provider>
    );
}

export default function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used within ChatProvider");
        return ctx;
}