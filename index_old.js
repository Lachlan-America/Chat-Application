// ECMA scripts are asynchronous, compared to CommonJS
import { Server } from "socket.io";
const io = Server;

let lobbies = {}; // Stores active lobbies

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("joinLobby", (userId) => {
    let lobbyId = findAvailableLobby();
    socket.join(lobbyId);

    // Track user in lobby
    if (!lobbies[lobbyId]) lobbies[lobbyId] = [];
    lobbies[lobbyId].push(userId);

    console.log(`User ${userId} joined ${lobbyId}`);

    // Start debate if lobby is full
    if (lobbies[lobbyId].length === 6) {
      io.to(lobbyId).emit("debateStart", { lobbyId });
      console.log(`Debate started in ${lobbyId}`);
    }
  });

  socket.on("disconnect", () => {
    // Remove user from any lobby
    for (const [lobbyId, users] of Object.entries(lobbies)) {
      lobbies[lobbyId] = users.filter((id) => id !== socket.id);
      if (lobbies[lobbyId].length === 0) {
        delete lobbies[lobbyId]; // Clean up empty lobbies
      }
    }
    console.log(`User ${socket.id} disconnected`);
  });
});

// Function to find an available lobby or create a new one
function findAvailableLobby() {
  for (const lobbyId in lobbies) {
    if (lobbies[lobbyId].length < 6) return lobbyId;
  }
  return `lobby_${Object.keys(lobbies).length + 1}`; // New lobby
}