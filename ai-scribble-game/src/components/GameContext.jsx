// GameContext.jsx
import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false); // ✅ new

  

  return (
    <GameContext.Provider value={{
      playerName,
      setPlayerName,
      players,
      setPlayers,
      gameStarted,
      setGameStarted,
      isHost,
      setIsHost
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);