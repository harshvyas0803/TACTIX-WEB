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
        winner: null,
      };
    }

    const game = games[room];
    const playerIds = Object.keys(game.players);

    if (playerIds.length >= 2) {
      socket.emit("message", "Room is full!");
      console.log(`Room ${room} is full!`);
      return;
    }

    if (Object.values(game.players).some((p) => p.name === name)) {
      socket.emit("message", "You are already in this game.");
      console.log(`${name} is already in room ${room}`);
      return;
    }

    const assignedSymbol = playerIds.length === 0 ? "X" : "O";
    game.players[socket.id] = { name, symbol: assignedSymbol };

    socket.join(room);
    socket.emit("assignedPlayer", assignedSymbol);
    io.to(room).emit("playerJoined", Object.values(game.players));

    console.log(`${name} joined room ${room} as ${assignedSymbol}`);
    io.to(room).emit("gameState", game);
  });

  socket.on("makeMove", ({ room, index }) => {
    if (!games[room]) return;
    const game = games[room];

    if (game.winner) return; // Prevent moves after game is over

    if (game.board[index] === null) {
      game.board[index] = game.turn;
      game.turn = game.turn === "X" ? "O" : "X";

      const winner = checkWinner(game.board);
      if (winner) {
        game.winner = winner;
      }

      io.to(room).emit("gameState", game);
    }
  });

  socket.on("resetGame", ({ room }) => {
    if (games[room]) {
      games[room].board = Array(9).fill(null);
      games[room].turn = "X";
      games[room].winner = null;

      io.to(room).emit("gameState", games[room]);
      console.log(`Game reset in room ${room}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const room in games) {
      if (games[room].players[socket.id]) {
        delete games[room].players[socket.id];

        if (Object.keys(games[room].players).length === 0) {
          delete games[room]; // Delete game if no players left
        } else {
          io.to(room).emit("playerJoined", Object.values(games[room].players));
        }
      }
    }
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));

const checkWinner = (board) => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.includes(null) ? null : "Draw";
};
