import React, { useState, useEffect } from "react";
import { socket } from "../Socket";
import { motion } from "framer-motion";
import { useWindowSize } from "react-use"; // Use the hook to get viewport dimensions
import "./Board.css"; // Import the external CSS file

const Board = ({ room, name }) => {
  const { width, height } = useWindowSize(); // Get dynamic viewport width & height
  const [game, setGame] = useState({ board: Array(9).fill(null), turn: "X", winner: null });
  const [message, setMessage] = useState("");
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.emit("joinGame", { room, name });

    socket.on("gameState", (data) => setGame(data));
    socket.on("playerJoined", (playersList) => setPlayers(playersList));
    socket.on("assignedPlayer", (assigned) => setPlayer(assigned));
    socket.on("message", (msg) => setMessage(msg));

    return () => {
      socket.off("gameState");
      socket.off("message");
      socket.off("playerJoined");
      socket.off("assignedPlayer");
    };
  }, [room, name]);

  const handleClick = (index) => {
    if (!game.winner && game.board[index] === null && game.turn === player) {
      socket.emit("makeMove", { room, index });
    }
  };

  const handleRestart = () => {
    socket.emit("resetGame", { room });
  };

  return (
    <div className="board-container">
      <h2 className="room-id">Room ID: {room}</h2>
      <h3 className="game-status">
        {game.winner ? `Winner: ${game.winner}` : `Current Turn: ${game.turn}`}
      </h3>
      <h3 className="player-status">
        You are: {player} ({name})
      </h3>

      {/* Responsive Grid with Gap between Boxes */}
      <div className={`grid-container ${game.winner ? "disabled" : ""}`}>
        {game.board.map((cell, index) => (
          <motion.button
            key={index}
            onClick={() => handleClick(index)}
            whileTap={{ scale: 0.9 }}
            animate={{ opacity: cell ? 1 : 0.6 }}
            className={`grid-item ${cell === "X" ? "x" : cell === "O" ? "o" : ""}`}
          >
            {cell}
          </motion.button>
        ))}
      </div>

      {game.winner && (
        <motion.h3
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className={`text-3xl font-bold mt-6 p-3 rounded-lg shadow-lg ${
            game.winner === "Draw"
              ? "text-yellow-400 bg-gray-700"
              : game.winner === player
              ? "text-green-400 bg-black"
              : "text-red-400 bg-gray-700"
          }`}
        >
          {game.winner === "Draw"
            ? "It's a Draw!"
            : game.winner === player
            ? "You Win! 🎉"
            : "You Lost! 😢"}
        </motion.h3>
      )}

      {game.winner && (
        <button className="restart-button" onClick={handleRestart}>
          Restart Game
        </button>
      )}

      <p className="message">{message}</p>
      <div className="players-list">
        Players in Room: {players.map((p) => `${p.name} (${p.symbol})`).join(", ")}
      </div>
    </div>
  );
};

export default Board;
