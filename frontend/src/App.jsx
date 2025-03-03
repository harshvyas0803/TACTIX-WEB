import React, { useState } from "react";
import Board from "./components/Board";

function App() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 bg-cover bg-fixed">
      {!joined ? (
        <div className="text-center text-white space-y-6 p-8 bg-gray-800 bg-opacity-70 rounded-lg shadow-xl w-80 sm:w-96 lg:w-1/3 transform transition-transform duration-500 hover:scale-105">
          <h1 className="text-3xl font-bold text-blue-400 animate__animated animate__fadeIn">Welcome to TacTix</h1>
          <p className="text-gray-300">Play Tic-Tac-Toe  with friends in real-time!</p>

          {/* Input fields with hover effect */}
          <input
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
          />

          <input
            type="text"
            placeholder="Enter Room ID or Create Game"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 ease-in-out"
          />

          {/* Buttons with hover and scale effects */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="w-full sm:w-1/2 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => name && setJoined(true)}
            >
              Join Game
            </button>
            <button
              className="w-full sm:w-1/2 p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                if (name) {
                  const newRoom = Math.random().toString(36).substring(2, 7);
                  setRoom(newRoom);
                  setJoined(true);
                }
              }}
            >
              Create Game
            </button>
          </div>
        </div>
      ) : (
        <Board room={room} name={name} />
      )}
    </div>
  );
}

export default App;
