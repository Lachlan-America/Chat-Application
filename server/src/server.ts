import { createUser, checkUsername, loginUser, uploadUserPhoto } from "./auth_controller.js";
import { Server as SocketServer, Socket } from "socket.io";
import http, { Server as HTTPServer } from "http";
import express, { Application, Express, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Extend Socket to add custom properties
interface AuthenticatedSocket extends Socket {
    user?: string;
}

interface Message {
    text: string;
    sender: string;
    datetime: Date;
}

export default class ChatServer {
    static SECRET_KEY: string = process.env.JWT_SECRET ?? "";
    static USERS: Map<string, string> = new Map();

    clients: AuthenticatedSocket[] = [];
    messageHistory: Message[] = [];
    session: Record<string, unknown> = {};

    app: Application;
    http_server: HTTPServer;
    io: SocketServer;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(cors());

        mongoose.connect(process.env.DATABASE_URI ?? "", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as mongoose.ConnectOptions).then(() => {
            console.log('MongoDB connected');
        }).catch(err => {
            console.error('MongoDB connection error:', err);
        });          

        this.http_server = http.createServer(this.app);
        this.io = new SocketServer(this.http_server, {
            cors: {
                origin: [process.env.ORIGIN ?? ""], // Don't want other domains to run scripts on this server
            },
            pingInterval: 10000,  // Send a ping every 10 seconds
            pingTimeout: 5000,    // Disconnect if no pong within 5 seconds
        });    
    }

    /**
    * Starts the server and listens for incoming connections on the specified port.
    * 
    * @param {number} port - The port number on which the server will listen for incoming connections.
    */
    start(port: number): void {
        this.http_server.listen(port, () => ChatServer.debug(`Server running on port:${port}`));
        
        // Middleware to authenticate the socket connection using JWT
        this.authenticateClient()
        this.handleClient();

        // All middleware to parse JSON and URL-encoded data. Handles corresponding fetch requests from the client
        // Associates the routes with their respective controller functions
        this.app.post('/api/check-username', checkUsername); 
        console.log(`Profile creation is ${process.env.ENABLE_PROFILE_CREATION}`);
        if(process.env.ENABLE_PROFILE_CREATION === "true") {
            this.app.post('/api/create-user', createUser); 
        }
        this.app.post('/api/login', loginUser);
        this.app.post('/api/upload', uploadUserPhoto);
    }

    /**
    * Middleware to authenticate the socket connection using JWT.
    */
    authenticateClient(): void {
        // This function is called when a new socket connection is established
        this.io.use((socket: AuthenticatedSocket, next) => {
            // Check if the token is valid
            const token = socket.handshake.auth.token;
            if (!token) {
                ChatServer.debug(`'${socket.id}' didn't provide a token!`);
                socket.emit("authError");
                socket.disconnect();
                return next(new Error('Authentication error'));
            }

            try {
                const payload = jwt.verify(token, ChatServer.SECRET_KEY) as { username: string };
                socket.user = payload.username;
                ChatServer.debug(`'${socket.user}' connected with token: ${token}`);
                next();
            } catch (err) {
                ChatServer.debug(`'${socket.id}' has an invalid token!`);
                socket.emit("authError");
                socket.disconnect();
                return next(new Error('Invalid token'));
            }
        });
    }

    /**
    * Handles incoming socket connections and events.
    */ 
    handleClient(): void {
        this.io.on("connection", (socket: AuthenticatedSocket) => {
            this.addClient(socket);

            // When this client uses the 'sendMessage' event, this callback is executed
            socket.on("sendMessage", (obj: Message) => {
                this.sendMessage(socket, obj);
            });
        
            // Handle disconnections to avoid memory leaks
            socket.on("disconnect", () => {
                this.removeClient(socket);
            });

            socket.on("typing", () => {
                this.io.emit("typing", { sender: socket.user?.toString() });
            });

            socket.on("stopTyping", () => {
                this.io.emit("stopTyping", { sender: socket.user?.toString() });
            });
        });
    }

    /**
    * Adds a new client to the server and sends them the message history.
    * 
    * @param {object} socket - The socket object representing the connected client.
    */
    addClient(socket: AuthenticatedSocket): void {
        this.clients.push(socket);
        ChatServer.debug(`User '${socket.user}' connected`);                                              
        socket.emit("messageHistory", { history: this.messageHistory, sender: socket.user?.toString() }); 
    }

    /**
    * Sends a message to all connected clients and stores it in the message history.
    * 
    * @param {object} socket - The socket object representing the client sending the message.
    * @param {object} obj - The message object containing the text and sender information.
    */
    sendMessage(socket: AuthenticatedSocket, obj: Message): void {
        ChatServer.debug(`${socket.user}: ${obj.text}`);
        this.messageHistory.push(obj);
        this.io.emit("receiveMessage", obj);
    }

    /**
    * Removes a client from the server when they disconnect.
    * 
    * @param {object} socket - The socket object representing the disconnected client.
    */
    removeClient(socket: AuthenticatedSocket): void {
        // Remove the client from the list of connected clients
        this.clients = this.clients.filter(c => c !== socket);
        ChatServer.debug(`User '${socket.user}' disconnected`);
    }

    /**
    * Logs debug messages to the console with a timestamp.
    * 
    * @param {string} message - The debug message to log.
    */
    static debug(message: string): void {
        const date = new Date();
        console.log(`${date.toTimeString().slice(0, 8)}: ${message}`);
    }
}