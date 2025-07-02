import { useRef, useLayoutEffect } from 'react';
import TypingIndicator from './TypingIndicator';
import useChat from '../context/ChatContext';
import Message from './Message';

export default function MessageStack() {

    const chatSocket = useChat();
    const chatEndRef = useRef<HTMLDivElement>(null);  

      // This function scrolls to the bottom of the chat window
      const scrollToBottom = () => {
        const chatContainer = chatEndRef.current?.parentElement;
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      };
    
      // Use useLayoutEffect to scroll immediately after rendering
      useLayoutEffect(() => {
        scrollToBottom();
      }, [chatSocket.messages, chatSocket.typingUsers]);

    return (
        <div className="flex flex-col overflow-y-auto p-4 space-y-4 h-full w-full">
            {chatSocket.messages.filter((obj) => obj.sender).map((obj, index) => (
                <div key={index} className={`flex ${obj.sender === chatSocket.username ? "justify-end" : "justify-start"}`}>
                    <Message text={obj.text} sender={obj.sender} datetime={obj.datetime} />
                </div>
            ))}

            {/* Typing indicator aligned to the left */}
            {/* {chatSocket.typingUsers.size > 0 && (
                <div className="flex justify-start">
                <div className="text-sm text-gray-500 italic">
                    {[...chatSocket.typingUsers].join(", ")} {chatSocket.typingUsers.size === 1 ? "is" : "are"} typing...
                </div>
                </div>
            )}

            {chatSocket.typingUsers.size > 0 && <TypingIndicator />}
            <div ref={chatEndRef} /> */}
        </div>
    );
}