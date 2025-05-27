import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import TypingIndicator from "./TypingIndicator";
import useChatSocket from "../hooks/useChatSocket";

interface Message {
    text: string;
    sender: string;
}

export default function MsgRoom() {
  const chatEndRef = useRef<HTMLDivElement>(null);  

  const {
  messages,
  typingUsers,
  username,
  input,
  sendMessage,
  handleInputChange,
} = useChatSocket();

  // This function scrolls to the bottom of the chat window
  const scrollToBottom = () => {
    //chatEndRef.current?.scrollIntoView();
    const chatContainer = chatEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };
  // Use useLayoutEffect to scroll immediately after rendering
  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    // TODO: Fix so the name is justified to the msg box
    <div className="flex flex-col h-[1000px] w-[1000px] mx-auto border border-gray-300 rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter((obj) => obj.sender).map((obj, index) => (
          <div key={index} className={`flex w-full ${obj.sender === username ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[66%]">
              <div className={`text-sm font-semibold text-gray-600 mb-1 ${obj.sender === username ? "text-right" : "text-left"}`}>{obj.sender}</div>
              <div className={`p-2 rounded-md break-words ${obj.sender === username ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>{obj.text}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator aligned to the left */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="text-sm text-gray-500 italic">
              {[...typingUsers].join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
            </div>
          </div>
        )}

        {typingUsers.size > 0 && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      <div className="flex border-t border-gray-300 p-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"> Send </button>
      </div>
    </div>
  );
}