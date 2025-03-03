import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let games = {};

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on("joinGame", ({ room, name }) => {
    if (!games[room]) {
      games[room] = {
        board: Array(9).fill(null),
        turn: "X",
        players: {},
      };
    }

    const game = games[room];
    const playerIds = Object.keys(game.players);
    
    if (playerIds.length >= 2) {
      socket.emit("message", "Room is full!");
      console.log(`Room ${room} is full!`);
      return;
    }

    // Prevent duplicate joins
    if (Object.values(game.players).some((p) => p.name === name)) {
      socket.emit("message", "You are already in this game.");
      console.log(`${name} is already in room ${room}`);
      return;
    }

    // Assign X or O
    const assignedSymbol = playerIds.length === 0 ? "X" : "O";
    game.players[socket.id] = { name, symbol: assignedSymbol };

    socket.join(room);
    socket.emit("assignedPlayer", assignedSymbol);
    io.to(room).emit("playerJoined", Object.values(game.players));

    console.log(`${name} joined room ${room} as ${assignedSymbol}`);
    io.to(room).emit("gameState", game);
  });

  socket.on("makeMove", ({ room, index }) => {
    console.log(`Move received: Room ${room}, Index ${index}`);

    if (!games[room]) return;
    const game = games[room];

    if (game.board[index] === null) {
      game.board[index] = game.turn;
      game.turn = game.turn === "X" ? "O" : "X";
      io.to(room).emit("gameState", game);
      console.log(`Board updated:`, game.board);
    } else {
      console.log("Invalid move, cell already occupied.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));
