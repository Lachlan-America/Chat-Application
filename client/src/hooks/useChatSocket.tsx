import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

interface Message {
    text: string;
    sender: string;
}

const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): 
    ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return function (...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export default function useChatSocket() {
    // Doesn't cause re-renders, and stays the same across renders
    const socket = useRef<Socket | null>(null);
    const usernameRef = useRef<string>("");

    const [input, setInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Define listener functions outside of useEffect to avoid re-creating them on every render
    const handleMessage = (msg: Message) => { setMessages((prev) => [...prev, msg]); };
    const handleHistory = (data: { history: Message[]; sender: string }) => {
        setMessages((prevMessages) => [...prevMessages, ...data.history]);
        usernameRef.current = data.sender;             
    };
    const addTypingUsers = ({sender}: { sender: string }) => {
        // Prevent adding self to typingUsers
        console.log(`User ${sender} is typing`);
        setTypingUsers((prev) => {
            // If the user is already in the set, do nothing
            console.log(usernameRef.current)
            if (sender == usernameRef.current || prev.has(sender)) return prev; 
            
            const next = new Set(prev);
            next.add(sender as string);
            return next;
        });
    };
    const delTypingUsers = ({sender}: { sender: string }) => {
      console.log(`User ${sender} stopped typing`);
      setTypingUsers((prev) => {
        // Only change the set if the user is in it
        if (!prev.has(sender)) return prev;
        
        const next = new Set(prev);
        next.delete(sender as string);
        return next;
      });
    };

    // This effect runs when the component mounts, setting up the socket connection
    // Need to remove the listener when the component unmounts to avoid memory leaks
    useEffect(() => {
        socket.current = io(import.meta.env.VITE_API_URL, { auth: { token: sessionStorage.getItem("token"), }, });

        socket.current.on("messageHistory", handleHistory); 
        socket.current.on("receiveMessage", handleMessage);
        socket.current.on("typing", addTypingUsers);
        socket.current.on("stopTyping", delTypingUsers);

        // The return is a cleanup function that runs when the component unmounts
        return () => {
        if (socket.current) {
            socket.current.off("messageHistory", handleHistory); 
            socket.current.off("receiveMessage", handleMessage);
            socket.current.off("typing", addTypingUsers); 
            socket.current.off("stopTyping", delTypingUsers);
            socket.current.disconnect();
        }
        };
    }, []);

    // Emitter functions
    const sendMessage = () => {
        if (input === "") return; 
        if (socket.current) {
            socket.current.emit("stopTyping", usernameRef.current);
            socket.current.emit("sendMessage", { text: input.trim(), sender: usernameRef.current });
        }
        setInput("");
    };
    const sendTyping = debounce(() => { if (socket.current) socket.current.emit("typing", usernameRef.current); }, 300);
    const sendStopTyping = debounce(() => { if (socket.current) socket.current.emit("stopTyping", usernameRef.current); }, 3000);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);     // update input state
        sendTyping();                 // debounce triggers after 300ms
        sendStopTyping();             // resets the 1000ms timer
    };

    return {
        messages,
        typingUsers,
        username: usernameRef.current,
        input,
        sendMessage,
        handleInputChange,
    };
}