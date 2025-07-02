import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface Message {
    text: string;
    sender: string;
    datetime: Date;
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
    const navigate = useNavigate();

    // State variables cause re-renders when they change
    const [input, setInput] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Define listener functions outside of useEffect to avoid re-creating them on every render
    const receiveMessage = (msg: Message) => { setMessages((prev) => [...prev, msg]); };
    const handleHistory = (data: { history: Message[]; sender: string }) => {
        setMessages((prevMessages) => [...prevMessages, ...data.history]);
        setUsername(() => data.sender);
    };
    const addTypingUsers = ({sender}: { sender: string }) => {
        // Prevent adding self to typingUsers
        console.log(`User ${sender} is typing`);
        setTypingUsers((prev) => {
            // If the user is already in the set, do nothing
            console.log(username)
            if (sender == username || prev.has(sender)) return prev;

            const next = new Set(prev);
            next.add(sender as string);
            return next;
        });
    };
    const delTypingUsers = ({ sender }: { sender: string }) => {
        console.log(`User ${sender} stopped typing`);
        setTypingUsers((prev) => {
            if (!prev.has(sender)) return prev;
            
            const next = new Set(prev);
            next.delete(sender as string);
            return next;
        });
    };

    // Remove token and redirect to login
    const invalidToken = () => {
        sessionStorage.removeItem("token");
        navigate("/login");
    }

    // This effect runs when the component mounts, setting up the socket connection
    // Need to remove the listener when the component unmounts to avoid memory leaks
    useEffect(() => {
        if(!sessionStorage.getItem("token")) navigate("/login"); 
        socket.current = io(import.meta.env.VITE_API_URL, { auth: { token: sessionStorage.getItem("token"), }, });
        socket.current.on("authError", invalidToken);
        socket.current.on("messageHistory", handleHistory); 
        socket.current.on("receiveMessage", receiveMessage);
        socket.current.on("typing", addTypingUsers);
        socket.current.on("stopTyping", delTypingUsers);

        // The return is a cleanup function that runs when the component unmounts
        return () => {
            if (socket.current) {
                socket.current.off("authError", invalidToken); 
                socket.current.off("messageHistory", handleHistory); 
                socket.current.off("receiveMessage", receiveMessage);
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
            socket.current.emit("stopTyping", username);
            const obj = { text: input.trim(), sender: username, datetime: new Date() };
            socket.current.emit("sendMessage", obj);
        }
        setInput("");
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);     // update input state
        sendTyping();                 // debounce triggers after 300ms
        sendStopTyping();             // resets the 1000ms timer
    };
    const sendTyping = debounce(() => { socket.current ? socket.current.emit("typing", username) : null; }, 300);
    const sendStopTyping = debounce(() => { socket.current ? socket.current.emit("stopTyping", username) : null; }, 3000);

    return {
        input,
        messages,
        typingUsers,
        username,
        setInput,
        sendMessage,
        handleInputChange,
    };
}