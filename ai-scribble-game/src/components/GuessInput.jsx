import React, { useState } from "react";
import { useGame } from "./GameContext";

export default function GuessInput() {
  const { playerName } = useGame();
  const [guess, setGuess] = useState("");

  const submitGuess = async () => {
    await fetch("http://localhost:5050/submit-guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player: playerName, guess }),
    });
    setGuess("");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Your guess"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        style={{ padding: "8px", width: "300px" }}
      />
      <button onClick={submitGuess} style={{ marginLeft: "10px" }}>
        Submit
      </button>
    </div>
  );
}