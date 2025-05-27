import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import TypingIndicator from "./TypingIndicator";
import useChatSocket from "../hooks/useChatSocket";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface Message {
    text: string;
    sender: string;
}

export default function MsgRoom() {
  const chatEndRef = useRef<HTMLDivElement>(null);  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    messages,
    typingUsers,
    username,
    setInput,
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { 
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default Enter action
      if (e.shiftKey) {
        setInput(prev => prev + "\n") // Allow Shift+Enter for new lines
        return;
      }
      sendMessage();
    }
  }

  function formatTimestamp(timestamp: string | number | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

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
              <div className={`p-2 rounded-md break-words whitespace-pre-wrap ${obj.sender === username 
                ? "bg-blue-500 text-white justiy-left" : "bg-gray-300 text-black justify-right"}`}>{obj.text}</div>
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
        <textarea
          className="flex-1 p-2 border rounded-md min-h-[40px] max-h-[300px] overflow-auto"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          rows={1}
        />

        {/* Emoji picker button */}
        <div className="relative ml-2 flex items-center">
          <button onClick={() => setShowEmojiPicker((prev) => !prev)}>😊</button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-3 right-0 z-50">
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) =>
                  setInput((prev) => prev + emoji.native)
                }
              />
            </div>
          )}
        </div>

        {/* Send button */}
        <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"> Send </button>
      </div>
    </div>
  );
}