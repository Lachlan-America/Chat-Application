import useChat from "../context/ChatContext";

export default function Message({ text, sender, datetime }: 
    { text: string; sender: string; datetime: Date }) {

    const chatSocket = useChat();

    function formatTimestamp(timestamp: string | number | Date): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    return (
        <div className={`grid items-center max-w-[50%] ${sender !== chatSocket.username ? "grid-cols-[1fr_100px] grid-rows-[1fr_auto]" : "grid-cols-[100px_1fr] grid-rows-[1fr_auto]"}`}>
            <div className={`row-start-2 ${sender === chatSocket.username ? "ml-2" : "mr-2"}`}>{formatTimestamp(datetime)}</div>
            <div className={`row-start-1 text-md font-semibold text-gray-600 ${sender === chatSocket.username ? "col-start-1 text-right" : "col-start-2 text-left"}`}>{sender}</div>
            <div className={`row-start-2 p-2 rounded-md break-words whitespace-pre-wrap ${sender === chatSocket.username ? "col-start-1 bg-blue-500 text-white" : "col-start-2 bg-gray-300 text-black"}`}>{text}</div>
        </div>
    );
}