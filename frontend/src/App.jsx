import React, { useState } from "react";
import Board from "./components/Board";

function App() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      {!joined ? (
        <div className="text-center space-y-6 p-8 bg-gray-800 rounded-lg shadow-lg w-96">
          <h1 className="text-3xl font-bold text-blue-400">Welcome to Tic-Tac-Toe</h1>
          <p className="text-gray-400">Play with friends in real-time!</p>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
          />
          <div className="flex gap-4">
            <button
              className="w-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded"
              onClick={() => name && setJoined(true)}
            >
              Join Game
            </button>
            <button
              className="w-1/2 p-2 bg-green-600 hover:bg-green-500 rounded"
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