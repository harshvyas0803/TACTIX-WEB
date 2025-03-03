import React, { useState, useEffect } from "react";
import { socket } from "../Socket";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const Board = ({ room, name }) => {
  const { width, height } = useWindowSize();
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
  }, [room]);

  const handleClick = (index) => {
    if (!game.winner && game.board[index] === null && game.turn === player) {
      socket.emit("makeMove", { room, index });
    }
  };

  const handleRestart = () => {
    socket.emit("resetGame", { room });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4">
      {game.winner && game.winner !== "Draw" && <Confetti width={width} height={height} />} 
      <h2 className="text-2xl font-bold mb-4 text-blue-400 drop-shadow-lg">Room ID: {room}</h2>
      <h3 className="text-lg font-semibold mb-2 text-yellow-300 drop-shadow-lg">
        {game.winner ? `Winner: ${game.winner}` : `Current Turn: ${game.turn}`}
      </h3>
      <h3 className="text-lg font-semibold mb-2 text-green-300 drop-shadow-lg">You are: {player} ({name})</h3>

      <div className={`grid grid-cols-3 gap-4 w-72 sm:w-80 md:w-96 p-6 bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-700 ${game.winner ? "pointer-events-none opacity-50" : ""}`}>
        {game.board.map((cell, index) => (
          <motion.button
            key={index}
            onClick={() => handleClick(index)}
            whileTap={{ scale: 0.9 }}
            animate={{ opacity: cell ? 1 : 0.6 }}
            className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl font-extrabold bg-gray-700 border border-gray-500 hover:bg-gray-600 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
          >
            {cell}
          </motion.button>
        ))}
      </div>

      {game.winner && (
        <h3 className={`text-3xl font-bold mt-6 p-3 rounded-lg shadow-lg ${game.winner === "Draw" ? "text-yellow-400 bg-gray-700" : game.winner === player ? "text-green-400 bg-black" : "text-red-400 bg-gray-700"}`}>
          {game.winner === "Draw" ? "It's a Draw!" : game.winner === player ? "You Win! 🎉" : "You Lost! 😢"}
        </h3>
      )}

      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition"
        onClick={handleRestart}>
        Restart Game
      </button>

      <p className="text-red-400 mt-3 text-lg">{message}</p>
      <div className="mt-4 text-gray-300 text-sm text-center">Players in Room: {players.map((p) => `${p.name} (${p.symbol})`).join(", ")}</div>
    </div>
  );
};

export default Board;
