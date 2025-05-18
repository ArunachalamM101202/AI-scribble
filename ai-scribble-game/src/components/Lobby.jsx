import React, { useState, useEffect } from "react";
import { useGame } from "./GameContext";

export default function Lobby() {
  const [name, setName] = useState("");
  const {
    playerName, setPlayerName,
    players, setPlayers,
    setGameStarted, setIsHost
  } = useGame();

  const handleJoin = async () => {
    if (!name.trim()) return;

    try {
      const response = await fetch("http://192.168.11.161:5050/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      setPlayerName(name);
      setPlayers(data.players);

      if (data.players[0] === name) {
        setIsHost(true);
      }
    } catch (err) {
      console.error("Error joining game:", err);
    }
  };

//   const handleStart = () => {
//     setGameStarted(true);
//   };

const handleStart = async () => {
  try {
    await fetch("http://192.168.11.161:5050/start-game", {
      method: "POST"
    });
  } catch (err) {
    console.error("Error starting game:", err);
  }
};

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://192.168.11.161:5050/players");
        const data = await res.json();
        setPlayers(data.players);
      } catch (err) {
        console.error("Failed to fetch players:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [setPlayers]);

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>🎮 Join AI Scribble Game</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", margin: "10px", width: "200px" }}
      />
      <br />
      <button onClick={handleJoin} style={{ padding: "10px 20px" }}>
        Join
      </button>

      {players.length > 0 && (
        <>
          <h2>👥 Players in Lobby</h2>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {players.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {/* ✅ Check against playerName */}
      {players.length > 1 && players[0] === playerName && (
        <button onClick={handleStart} style={{ padding: "10px 20px", marginTop: "20px" }}>
          🚀 Start Game
        </button>
      )}
    </div>
  );
}