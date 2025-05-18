import React, { useEffect, useState } from "react";
import { useGame } from "./components/GameContext";
import Lobby from "./components/Lobby";
import WaitingRoom from "./components/WaitingRoom";
import DrawCanvas from "./components/DrawCanvas";
import GameLoop from "./components/GameLoop";

function App() {
  const { gameStarted, setGameStarted, playerName } = useGame();

  const [drawingSubmitted, setDrawingSubmitted] = useState(false);
  const [generatedImageURL, setGeneratedImageURL] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [gameLoopStarted, setGameLoopStarted] = useState(false);

  // 🔁 Poll global game state (host starts game)
  useEffect(() => {
    if (gameStarted || !playerName) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://192.168.11.161:5050/game-state");
        const data = await res.json();
        if (data.started) {
          setGameStarted(true);
        }
      } catch (err) {
        console.error("Error polling game state:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [gameStarted, playerName, setGameStarted]);

  // 🔁 Poll for AI image after drawing is submitted
  useEffect(() => {
    if (!drawingSubmitted || !playerName || generatedImageURL) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://192.168.11.161:5050/images");
        const data = await res.json();
        const image = data.images.find(img => img.player === playerName);
        if (image) {
          setGeneratedImageURL(image.image_url);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [drawingSubmitted, playerName, generatedImageURL]);

  // 🔁 Poll if all images are ready → start game loop
  useEffect(() => {
    if (!generatedImageURL || gameLoopStarted) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://192.168.11.161:5050/all-images-ready");
        const data = await res.json();
        if (data.ready) {
          clearInterval(interval);
          setGameLoopStarted(true);
        }
      } catch (err) {
        console.error("Polling all-images-ready failed:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [generatedImageURL, gameLoopStarted]);

  // 📤 Submit drawing to backend
  const handleDrawingSubmit = async (data) => {
    try {
      const response = await fetch("http://192.168.11.161:5050/submit-drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          player: playerName,
          word: "Tiger",
          imageData: data.imageData,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message);
      }

      setDrawingSubmitted(true);
    } catch (error) {
      console.error("Failed to submit drawing:", error);
      setSubmissionError("Failed to submit drawing. Please try again.");
    }
  };

  // 👥 Lobby phase
  if (!gameStarted) return <Lobby />;

  // 🎨 Drawing phase
  if (!drawingSubmitted) {
    return (
      <>
        <DrawCanvas wordToDraw="Tiger" onSubmitDrawing={handleDrawingSubmit} />
        {submissionError && (
          <p style={{ color: "red", textAlign: "center" }}>{submissionError}</p>
        )}
      </>
    );
  }

  // 🖼️ Waiting for others after image is ready
  if (generatedImageURL && !gameLoopStarted) {
    return (
      <div style={{ textAlign: "center", paddingTop: "40px" }}>
        <h2>🎨 AI Generated Image</h2>
        <img
          src={generatedImageURL}
          alt="AI Generated from sketch"
          width="512"
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            margin: "20px 0",
          }}
        />
        <p><em>Waiting for other players to finish...</em></p>
      </div>
    );
  }

  // 🔁 Game loop phase
  if (gameLoopStarted) {
    return (
      <GameLoop
        onComplete={() => {
          setGameStarted(false);
          setDrawingSubmitted(false);
          setGeneratedImageURL(null);
          setGameLoopStarted(false);
        }}
      />
    );
  }

  // ⌛ Fallback: waiting for AI generation
  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h3>⏳ Generating your AI image...</h3>
      <p>Please wait while we turn your sketch into something amazing.</p>
    </div>
  );
}

export default App;