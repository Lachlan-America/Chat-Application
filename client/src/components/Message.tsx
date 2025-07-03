import useChat from "../context/ChatContext";

export default function Message({ text, sender, datetime }: 
    { text: string; sender: string; datetime: Date }) {

    const chatSocket = useChat();
    const isUser = sender === chatSocket.username;

    function formatTimestamp(timestamp: string | number | Date): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    return (
        <div className={`flex flex-col max-w-[50%] min-w-0 ${isUser ? "items-end" : "items-start"}`}>
            <div className="text-sm font-semibold text-gray-600 mb-0.5">{sender}</div>
            <div className={`p-2 rounded-md break-words whitespace-pre-wrap w-full ${isUser ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>{text}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatTimestamp(datetime)}</div>
        </div>
    );
}