import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const socket = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState(null); // State to store the ID of the connected user
  const chatEndRef = useRef(null);
 
  /**
  * Starts the server and listens for incoming connections on the specified port.
  */
  useEffect(() => {
    // socket.current = io(API_URL, {
    //   auth: {
    //     token: localStorage.getItem("token"), // Or pass cookie if using httpOnly
    //   },
    // });

    // The return is a cleanup function that runs when the component unmounts
    return () => {
    };
  }, []);

  return (
    <div className="flex flex-col h-[1000px] w-[1000px] mx-auto border border-gray-300 rounded-lg shadow-lg">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.filter((obj) => obj.sender).map((obj, index) => (
          <div key={index} className={`flex flex-col w-full ${obj.sender === username ? "items-end" : "items-start"}`}>
            <div className="text-lg font-bold text-gray-600">
              {obj.sender}
            </div>
            <div className={`p-2 max-w-2/3 rounded-md ${obj.sender === username ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
              {obj.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex border-t border-gray-300 p-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"> Send </button>
      </div>
    </div>
  );
}