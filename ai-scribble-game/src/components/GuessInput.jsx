// import React, { useState } from "react";
// import { useGame } from "./GameContext";

// export default function GuessInput({ imageIndex, correctWord, onGuess }) {
//   const { playerName } = useGame();
//   const [guess, setGuess] = useState("");
//   const [result, setResult] = useState(null);
//   const [submitted, setSubmitted] = useState(false);

//   const submitGuess = async () => {
//     if (!guess.trim()) return;

//     await fetch("http://192.168.11.161:5050/submit-guess", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         player: playerName,
//         guess: guess.trim(),
//         image_index: imageIndex,
//       }),
//     });

//     const isCorrect = guess.trim().toLowerCase() === correctWord.toLowerCase();

//     setResult(isCorrect ? "✅ Correct!" : "❌ Incorrect.");
//     setSubmitted(true);
//     onGuess && onGuess(guess);
//   };

//   return (
//     <div style={{ marginBottom: "20px" }}>
//       <input
//         type="text"
//         placeholder="Type your guess"
//         value={guess}
//         onChange={(e) => setGuess(e.target.value)}
//         style={{
//           padding: "10px",
//           width: "250px",
//           fontSize: "16px",
//           marginRight: "10px",
//         }}
//         disabled={submitted}
//       />
//       <button
//         onClick={submitGuess}
//         disabled={submitted || !guess.trim()}
//         style={{
//           padding: "10px 15px",
//           fontSize: "16px",
//           cursor: "pointer",
//         }}
//       >
//         Submit
//       </button>
//       {result && <p style={{ marginTop: "10px", fontWeight: "bold" }}>{result}</p>}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { useGame } from "./GameContext";
import "./GuessInput.css";

export default function GuessInput({ imageIndex, correctWord, onGuess }) {
  const { playerName } = useGame();
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [shake, setShake] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30); // Example time limit
  const [isLoading, setIsLoading] = useState(false);

  // Optional timer effect - remove if not needed
  useEffect(() => {
    if (!submitted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, submitted]);

  const submitGuess = async () => {
    if (!guess.trim()) return;
    
    setIsLoading(true);
    
    try {
      await fetch("http://192.168.11.161:5050/submit-guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: playerName,
          guess: guess.trim(),
          image_index: imageIndex,
        }),
      });

      const isCorrect = guess.trim().toLowerCase() === correctWord.toLowerCase();

      setResult(isCorrect);
      setSubmitted(true);
      onGuess && onGuess(guess);
      
      if (!isCorrect) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && guess.trim() && !submitted) {
      submitGuess();
    }
  };

  // Optional: Word length hint
  const renderWordLengthHint = () => {
    if (!correctWord) return null;
    
    return (
      <div className="word-length-hint">
        {Array.from({ length: correctWord.length }).map((_, index) => (
          <div key={index} className="letter-placeholder"></div>
        ))}
      </div>
    );
  };

  return (
    <div className="guess-input-container">
      <div className={`guess-form ${shake ? 'shake' : ''}`}>
        <input
          type="text"
          className="guess-input"
          placeholder="What do you think this is?"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={submitted || isLoading}
          autoFocus
        />
        <button
          className="submit-button"
          onClick={submitGuess}
          disabled={submitted || !guess.trim() || isLoading}
        >
          {isLoading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              Submit
              <span className="submit-icon">➜</span>
            </>
          )}
        </button>
      </div>

      {renderWordLengthHint()}

      {result !== null && (
        <div className={`result-message ${result ? 'result-correct' : 'result-incorrect'}`}>
          <span className="result-icon">{result ? '✅' : '❌'}</span>
          {result ? 'Correct! Great job!' : 'Not quite right, but nice try!'}
        </div>
      )}

      {!submitted && (
        <div className="time-remaining">
          Time remaining: {timeRemaining}s
          <div className="timer-bar">
            <div 
              className="timer-progress" 
              style={{ width: `${(timeRemaining / 30) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {!submitted && (
        <div className="hint-container">
          Tip: Look carefully at the image and type your best guess!
        </div>
      )}
    </div>
  );
}