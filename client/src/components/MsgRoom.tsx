import MessageStack from "./MessageStack";
import MessageBar from "./MessageBar";

export default function MsgRoom() {
  return (
    <div className="flex flex-col w-[100vw] h-[100vh] md:w-1/3 md:h-2/3 mx-auto border border-gray-300 rounded-lg shadow-lg backdrop-blur-md">
      <MessageStack />
      <MessageBar />
    </div>
  );
}