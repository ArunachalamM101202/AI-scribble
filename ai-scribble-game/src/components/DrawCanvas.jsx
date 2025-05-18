// import React, { useRef, useState, useEffect } from "react";
// import CanvasDraw from "react-canvas-draw";
// import { useGame } from "./GameContext";

// export default function DrawCanvas({ wordToDraw, onSubmitDrawing }) {
//   const canvasRef = useRef(null);
//   const { playerName } = useGame();

//   const [timer, setTimer] = useState(10);
//   const [submitted, setSubmitted] = useState(false);
  

//   // Countdown timer
//   useEffect(() => {
//     if (timer > 0 && !submitted) {
//       const t = setTimeout(() => setTimer(timer - 1), 1000);
//       return () => clearTimeout(t);
//     } else if (timer === 0 && !submitted) {
//       handleSubmit(); // auto-submit when timer ends
//     }
//   }, [timer, submitted]);

//   const handleSubmit = () => {
//     if (submitted) return;
//     setSubmitted(true);

//     // Export canvas to image as Base64
//     const imageData = canvasRef.current.getDataURL("image/png");

//     // Send image and player name to parent
//     onSubmitDrawing({
//       player: playerName,
//       imageData,
//       word: wordToDraw,
//     });
//   };

//   const handleClear = () => {
//     canvasRef.current.clear();
//   };

//   return (
//     <div>
//       <h2>🖌️ Draw: <strong>{wordToDraw}</strong></h2>
//       <p>⏱ Time left: {timer}s</p>

//       <CanvasDraw
//         ref={canvasRef}
//         canvasWidth={500}
//         canvasHeight={400}
//         brushColor="#000"
//         brushRadius={3}
//         hideGrid
//       />

//       <div style={{ marginTop: "10px" }}>
//         <button onClick={handleClear} disabled={submitted}>Clear</button>{" "}
//         <button onClick={handleSubmit} disabled={submitted}>
//           {submitted ? "Submitted!" : "Submit Drawing"}
//         </button>
//       </div>
//     </div>
//   );
// }


import React, { useRef, useState, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import { useGame } from "./GameContext";
import "./DrawCanvas.css";

export default function DrawCanvas({ wordToDraw, onSubmitDrawing }) {
  const canvasRef = useRef(null);
  const { playerName } = useGame();

  const [timer, setTimer] = useState(15); // Keeping the original timer value (10)
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(3);
  
  // Calculate timer class based on remaining time
  const getTimerClass = () => {
    if (timer > 6) return "timer-high";
    if (timer > 3) return "timer-medium";
    return "timer-low";
  };

  // Countdown timer - keeping the exact same logic
  useEffect(() => {
    if (timer > 0 && !submitted) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (timer === 0 && !submitted) {
      handleSubmit(); // auto-submit when timer ends
    }
  }, [timer, submitted]);

  const handleSubmit = () => {
    if (submitted || isSubmitting) return;
    setIsSubmitting(true);

    // Export canvas to image as Base64
    const imageData = canvasRef.current.getDataURL("image/png");

    // Send image and player name to parent
    onSubmitDrawing({
      player: playerName,
      imageData,
      word: wordToDraw,
    });

    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleClear = () => {
    canvasRef.current.clear();
  };

  // Color options for the drawing
  const colorOptions = [
    "#000000", // Black
    "#e63946", // Red
    "#3a86ff", // Blue
    "#38b000", // Green
    "#9d4edd", // Purple
    "#ff7b00", // Orange
    "#6c757d", // Gray
  ];

  return (
    <div className="draw-canvas-container">
      <div className="draw-canvas-header">
        <h2 className="draw-canvas-title">
          <span>🖌️</span> Draw: 
          <span className="draw-canvas-word">{wordToDraw}</span>
        </h2>
        
        <div className="timer-container">
          <span>⏱</span> Time left: 
          <span className={`timer-value ${getTimerClass()} ${timer === 0 ? 'time-up' : ''}`}>
            {timer}s
          </span>
        </div>
        
        <div className="draw-canvas-timer-bar">
          <div 
            className="draw-canvas-timer-progress" 
            style={{ width: `${(timer / 60) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="brush-controls">
        <div className="brush-size-control">
          <span className="brush-size-label">Brush Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushRadius}
            onChange={(e) => setBrushRadius(parseInt(e.target.value))}
            className="brush-size-input"
            disabled={submitted}
          />
        </div>
        
        <div className="color-picker">
          {colorOptions.map((color) => (
            <div
              key={color}
              className={`color-option ${brushColor === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setBrushColor(color)}
            />
          ))}
        </div>
      </div>

      <div className="canvas-wrapper">
        <CanvasDraw
          ref={canvasRef}
          canvasWidth={500}
          canvasHeight={400}
          brushColor={brushColor}
          brushRadius={brushRadius}
          hideGrid
          disabled={submitted}
          lazyRadius={0}
          immediateLoading={true}
        />
      </div>

      <div className="canvas-actions">
        <button 
          className="canvas-button clear-button"
          onClick={handleClear} 
          disabled={submitted || timer === 0}
        >
          <span>🧹</span> Clear
        </button>
        
        <button 
          className="canvas-button submit-drawing-button"
          onClick={handleSubmit} 
          disabled={submitted || isSubmitting}
        >
          {submitted ? (
            <div className="submitted-indicator">
              <span className="submitted-checkmark">✓</span> Submitted!
            </div>
          ) : isSubmitting ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              <span>📤</span> Submit Drawing
            </>
          )}
        </button>
      </div>
      
      {!submitted && (
        <div className="drawing-tip">
          <strong>Tip:</strong> Keep your drawing simple and clear. Focus on the main features of "{wordToDraw}".
        </div>
      )}
    </div>
  );
}