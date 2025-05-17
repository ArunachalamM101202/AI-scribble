// import React, { useEffect, useState } from "react";
// import { useGame } from "./components/GameContext";
// import Lobby from "./components/Lobby";
// import WaitingRoom from "./components/WaitingRoom";
// import DrawCanvas from "./components/DrawCanvas";
// import GameLoop from "./components/GameLoop";

// function App() {
//   const { gameStarted, setGameStarted, playerName } = useGame();

//   const [drawingSubmitted, setDrawingSubmitted] = useState(false);
//   const [generatedImageURL, setGeneratedImageURL] = useState(null);
//   const [submissionError, setSubmissionError] = useState(null);

//   // 🔁 Poll for global game state if game hasn't started yet
//   useEffect(() => {
//     if (gameStarted || !playerName) return;

//     const interval = setInterval(async () => {
//       try {
//         const res = await fetch("http://localhost:5050/game-state");
//         const data = await res.json();
//         if (data.started) {
//           setGameStarted(true);
//         }
//       } catch (err) {
//         console.error("Error polling game state:", err);
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [gameStarted, playerName, setGameStarted]);

//   // 🔁 Poll for AI-generated image once drawing is submitted
//   useEffect(() => {
//     if (!drawingSubmitted || !playerName) return;

//     const interval = setInterval(async () => {
//       try {
//         const res = await fetch("http://localhost:5050/images");
//         const data = await res.json();

//         const image = data.images.find(img => img.player === playerName);
//         if (image) {
//           setGeneratedImageURL(image.image_url);
//           clearInterval(interval); // Stop polling once found
//         }
//       } catch (err) {
//         console.error("Error fetching images:", err);
//       }
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [drawingSubmitted, playerName]);

//   // 🎯 Submit drawing to Flask backend
//   const handleDrawingSubmit = async (data) => {
//     try {
//       const response = await fetch("http://localhost:5050/submit-drawing", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           player: playerName,
//           word: "Tiger",
//           imageData: data.imageData,
//         }),
//       });

//       const result = await response.json();
//       if (!response.ok || result.status !== "success") {
//         throw new Error(result.message);
//       }

//       setDrawingSubmitted(true);
//     } catch (error) {
//       console.error("Failed to submit drawing:", error);
//       setSubmissionError("Failed to submit drawing. Please try again.");
//     }
//   };

//   // 👥 Lobby before game starts
//   if (!gameStarted) return <Lobby />;

//   // 🎨 Drawing phase
//   if (!drawingSubmitted) {
//     return (
//       <>
//         <DrawCanvas wordToDraw="Tiger" onSubmitDrawing={handleDrawingSubmit} />
//         {submissionError && (
//           <p style={{ color: "red", textAlign: "center" }}>{submissionError}</p>
//         )}
//       </>
//     );
//   }

//   // 🖼️ Display generated image when available
//   if (generatedImageURL) {
//     return (
//       <div style={{ textAlign: "center", paddingTop: "40px" }}>
//         <h2>🎨 AI Generated Image</h2>
//         <img
//           src={generatedImageURL}
//           alt="AI Generated from sketch"
//           width="512"
//           style={{
//             border: "1px solid #ccc",
//             borderRadius: "8px",
//             margin: "20px 0",
//           }}
//         />
//         <p>
//           <em>Can you guess what the original drawing was?</em>
//         </p>
//         {/* TODO: Add guessing input here */}
//       </div>
//     );
//   }

//   // ⌛ Waiting while image is being generated
//   return (
//     <div style={{ textAlign: "center", marginTop: "40px" }}>
//       <h3>⏳ Generating your AI image...</h3>
//       <p>Please wait while we turn your sketch into something amazing.</p>
//     </div>
//   );
// }

// export default App;


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

  // 🔁 Poll global game state
  useEffect(() => {
    if (gameStarted || !playerName) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5050/game-state");
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

  // 🔁 Poll for AI image
  useEffect(() => {
    if (!drawingSubmitted || !playerName || generatedImageURL) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5050/images");
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

  // 📤 Submit drawing to backend
  const handleDrawingSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:5050/submit-drawing", {
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

  // 🖼️ Display AI image before round begins
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
        <button onClick={() => setGameLoopStarted(true)} style={{ marginTop: "20px" }}>
          ▶️ Start Guessing Rounds
        </button>
      </div>
    );
  }

  // 🧠 GameLoop phase
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

  // ⌛ Fallback while AI image is generating
  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h3>⏳ Generating your AI image...</h3>
      <p>Please wait while we turn your sketch into something amazing.</p>
    </div>
  );
}

export default App;