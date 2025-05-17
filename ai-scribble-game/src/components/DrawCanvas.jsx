import React, { useRef, useState, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import { useGame } from "./GameContext";

export default function DrawCanvas({ wordToDraw, onSubmitDrawing }) {
  const canvasRef = useRef(null);
  const { playerName } = useGame();

  const [timer, setTimer] = useState(10);
  const [submitted, setSubmitted] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timer > 0 && !submitted) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (timer === 0 && !submitted) {
      handleSubmit(); // auto-submit when timer ends
    }
  }, [timer, submitted]);

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);

    // Export canvas to image as Base64
    const imageData = canvasRef.current.getDataURL("image/png");

    // Send image and player name to parent
    onSubmitDrawing({
      player: playerName,
      imageData,
      word: wordToDraw,
    });
  };

  const handleClear = () => {
    canvasRef.current.clear();
  };

  return (
    <div>
      <h2>🖌️ Draw: <strong>{wordToDraw}</strong></h2>
      <p>⏱ Time left: {timer}s</p>

      <CanvasDraw
        ref={canvasRef}
        canvasWidth={500}
        canvasHeight={400}
        brushColor="#000"
        brushRadius={3}
        hideGrid
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleClear} disabled={submitted}>Clear</button>{" "}
        <button onClick={handleSubmit} disabled={submitted}>
          {submitted ? "Submitted!" : "Submit Drawing"}
        </button>
      </div>
    </div>
  );
}