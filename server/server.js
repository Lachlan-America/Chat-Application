import { Server as SocketServer } from "socket.io";
import http from "http"; 
import express from "express";
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mongoose from "mongoose";

import User from "./models/User.js"; 
import { createUser, checkUsername, loginUser, uploadUserPhoto } from "./auth_controller.js";
import { debug } from "console";
import dotenv from "dotenv";
dotenv.config();

export default class ChatServer {
    static SECRET_KEY = process.env.SECRET_KEY;
    // Currently username to JWT
    static USERS = new Map(); 

    constructor() {
        this.clients = [];
        this.messageHistory = []; 
        this.session = {}; // Store user sessions

        this.app = express(); // Create an Express app
        this.app.use(express.json()); // Middleware to parse JSON bodies
        this.app.use(cors()); // Middleware to enable CORS (Cross-Origin Resource Sharing)
        
        mongoose.connect(process.env.DATABASE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log('MongoDB connected');
        }).catch(err => {
            console.error('MongoDB connection error:', err);
        });          

        this.http_server = http.createServer(this.app);
        this.io = new SocketServer(this.http_server, {
            cors: {
                origin: [process.env.ORIGIN], // Don't want other domains to run scripts on this server
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
    start(port) {
        this.http_server.listen(port, () => ChatServer.debug(`Server running on http://localhost:${port}`));
        
        // Middleware to authenticate the socket connection using JWT
        this.authenticateClient()
        this.handleClient();

        // All middleware to parse JSON and URL-encoded data. Handles corresponding fetch requests from the client
        this.app.post('/api/check-username', checkUsername); 
        this.app.post('/api/create-user', createUser); 
        this.app.post('/api/login', loginUser);
        this.app.post('/api/upload', uploadUserPhoto);
    }

    /**
    * Middleware to authenticate the socket connection using JWT.
    */
    authenticateClient() {     
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
          
            if (!token) {
                ChatServer.debug(`'${socket.id}' didn't provide a token!`);
                return next(new Error('Authentication error'));
            }
          
            try {
                const payload = jwt.verify(token, ChatServer.SECRET_KEY);
                socket.user = payload.username; 
                ChatServer.debug(`'${socket.user}' connected with token: ${token}`);
                next();

            } catch (err) {
                ChatServer.debug(`'${socket.id}' has a invalid token!`);
                return next(new Error('Invalid token'));
            }
        });
    }

    /**
    * Handles incoming socket connections and events.
    */ 
    handleClient() {
        this.io.on("connection", (socket) => {
            this.addClient(socket)

            // When this client uses the 'sendMessage' event, this callback is executed
            socket.on("sendMessage", (obj) => {
                this.sendMessage(socket, obj);
            });
        
            // Handle disconnections to avoid memory leaks
            socket.on("disconnect", () => {
                this.removeClient(socket);
            });
        });
    }

    /**
    * Adds a new client to the server and sends them the message history.
    * 
    * @param {object} socket - The socket object representing the connected client.
    */
    addClient(socket) {
        this.clients.push(socket);
        ChatServer.debug(`User '${socket.user}' connected`);                                              
        socket.emit("messageHistory", { history: this.messageHistory, sender: socket.user.toString() }); 
    }

    /**
    * Sends a message to all connected clients and stores it in the message history.
    * 
    * @param {object} socket - The socket object representing the client sending the message.
    * @param {object} obj - The message object containing the text and sender information.
    */
    sendMessage(socket, obj) {
        ChatServer.debug(`${socket.user}: ${obj.text}`);
        this.messageHistory.push({text: obj.text, sender: socket.user.toString()});
        this.io.emit("receiveMessage", { text: obj.text, sender: socket.user.toString() });
    }

    /**
    * Removes a client from the server when they disconnect.
    * 
    * @param {object} socket - The socket object representing the disconnected client.
    */
    removeClient(socket) {
        // Remove the client from the list of connected clients
        this.clients = this.clients.filter(c => c !== socket);
        ChatServer.debug(`User '${socket.user}' disconnected`);
    }

    /**
    * Logs debug messages to the console with a timestamp.
    * 
    * @param {string} message - The debug message to log.
    */
    static debug(message){
        const date = new Date();
        console.log(`${date.toTimeString().slice(0, 8)}: ${message}`);
    }
}  