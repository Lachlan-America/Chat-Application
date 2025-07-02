import React, { useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import useChat from '../context/ChatContext';

export default function MessageBar(){

    const chatSocket = useChat();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);  

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { 
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default Enter action
            if (e.shiftKey) {
                chatSocket.setInput(prev => prev + "\n") // Allow Shift+Enter for new lines
                return;
            }
            chatSocket.sendMessage();
        }
    }

    return (    
        <div className="flex border-t border-gray-300 p-2">
            <textarea
              className="flex-1 p-2 border resize-none rounded-md min-h-[40px] max-h-[400px] overflow-auto"
              placeholder="Type a message..."
              value={chatSocket.input}
              onChange={chatSocket.handleInputChange}
              onKeyDown={onKeyDown}
              rows={1}
            />
    
            {/* Emoji picker button */}
            <div className="relative ml-2 flex items-center">
              <button onClick={() => setShowEmojiPicker((prev) => !prev)}>😊</button>
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-3 right-0 z-50">
                  <Picker data={data} onEmojiSelect={(emoji: any) => chatSocket.setInput((prev) => prev + emoji.native)}/>
                </div>
              )}
            </div>
    
            {/* Send button */}
            <button onClick={chatSocket.sendMessage} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"> Send </button>
        </div>
    );
}