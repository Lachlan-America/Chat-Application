import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";
import TypingIndicator from "./TypingIndicator";

const API_URL = import.meta.env.VITE_API_URL;

export default function MsgRoom() {
  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [username, setUsername] = useState<string>(""); // State to store the ID of the connected user
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
 
  // This effect runs when the component mounts, setting up the socket connection
  // Need to remove the listener when the component unmounts to avoid memory leaks
  useEffect(() => {
    socket.current = io(API_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    const handleMessage = ({ text, sender }: { text: string; sender: string }) => {
      console.log(`Received ${text} from ${sender}`);                     // Log the message and sender ID
      setMessages((prev) => [...prev, { text: text, sender: sender}]);
    };

    // This function is handled initially and saves the username and message history
    const handleHistory = (data: { history: { text: string; sender: string }[]; sender: string }) => {
      setMessages((prevMessages) => [...prevMessages, ...data.history]);  // Update state with the message history
      setUsername(data.sender);                                           // Store the ID of the connected user
      console.log(`Received: ${data.history} and ID: ${data.sender}`);     // Log the message and sender ID
    };

    // This function adds a user to the typingUsers set when they start typing
    const addTypingUsers = ({ sender }: { sender: string }) => {
      // Prevent adding self to typingUsers
      console.log(`User ${sender} is typing`);
      setTypingUsers((prev) => {
        // If the user is already in the set, do nothing
        if (sender == username || prev.has(sender)) return prev; 
          const next = new Set(prev);
          next.add(sender as string);
          return next;
      });
    };
    // This function removes a user from the typingUsers set when they stop typing
    const delTypingUsers = ({ sender }: { sender: string }) => {
      console.log(`User ${sender} stopped typing`);
      setTypingUsers((prev) => {
        // Only change the set if the user is in it
        if (!prev.has(sender)) return prev;
          const next = new Set(prev);
          next.delete(sender as string);
          return next;
      });
    };

    socket.current.on("messageHistory", handleHistory); 
    socket.current.on("receiveMessage", handleMessage);
    socket.current.on("typing", addTypingUsers);
    socket.current.on("stopTyping", delTypingUsers);

    // The return is a cleanup function that runs when the component unmounts
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.off("messageHistory", handleHistory); 
        socket.current.off("receiveMessage", handleMessage);
        socket.current.off("typing", addTypingUsers); 
        socket.current.off("stopTyping", delTypingUsers);
      }
    };
  }, []);

  const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): 
  ((...args: Parameters<T>) => void) => {
    // Persists across function calls
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return function (...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // This function sends a message through the 'sendMessage' event, and the input is reset
  const sendMessage = () => {
    if (input === "") {
      return; // Don't send empty messages
    }
    if (socket.current) {
      socket.current.emit("stopTyping", username);
      socket.current.emit("sendMessage", { text: input.trim(), sender: username });
    }
    setInput("");
  };
  // This function scrolls to the bottom of the chat window
  const scrollToBottom = () => {
    //chatEndRef.current?.scrollIntoView();
    const chatContainer = chatEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };
  const sendTyping = debounce(() => {
    if (socket.current) {
      socket.current.emit("typing", username);
    }
  }, 300);
  const sendStopTyping = debounce(() => {
    if (socket.current) {
      socket.current.emit("stopTyping", username);
    }
  }, 3000);

  // When the text changes in the message box, this function is called
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);     // update input state
    sendTyping();                 // debounce triggers after 300ms
    sendStopTyping();             // resets the 1000ms timer
  };

  // Use useLayoutEffect to scroll immediately after rendering
  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className="flex flex-col h-[1000px] w-[1000px] mx-auto border border-gray-300 rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter((obj) => obj.sender).map((obj, index) => (
          <div key={index} className={`flex w-full ${obj.sender === username ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[66%]">
              <div className="text-sm font-semibold text-gray-600 mb-1">{obj.sender}</div>
              <div className={`p-2 rounded-md break-words ${obj.sender === username ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                {obj.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator aligned to the left */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="text-sm text-gray-500 italic ml-4">
              {[...typingUsers].join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
            </div>
          </div>
        )}

        {typingUsers.size > 0 && <TypingIndicator className="mt-2 ml-4" />}
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