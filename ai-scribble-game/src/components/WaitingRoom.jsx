import React from "react";
import { useGame } from "./GameContext";

export default function WaitingRoom() {
  const { players } = useGame();

  return (
    <div>
      <h2>Waiting for players to join...</h2>
      <ul>
        {players.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}