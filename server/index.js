// ECMA scripts are asynchronous, compared to CommonJS
import { Server } from "socket.io";
import http from "http"; 
import ChatServer from "./server.js";

const server = new ChatServer(); 
// Start the server on port 5000
server.start(5000); 