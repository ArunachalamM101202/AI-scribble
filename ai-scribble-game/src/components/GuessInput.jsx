
import React, { useState, useEffect } from "react";
import { useGame } from "./GameContext";
import "./GuessInput.css";

export default function GuessInput({ imageIndex, correctWord, onGuess }) {
  const { playerName } = useGame();
  const [guess, setGuess] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // 🕒 Timer countdown
  useEffect(() => {
    if (isCorrect || timeRemaining <= 0) return;
    const timer = setTimeout(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeRemaining, isCorrect]);

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

      const isCorrectGuess = guess.trim().toLowerCase() === correctWord.toLowerCase();
      setIsCorrect(isCorrectGuess);
      onGuess && onGuess(guess);

      if (!isCorrectGuess) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }

      setGuess(""); // clear input for next try
    } catch (err) {
      console.error("Failed to submit guess:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && guess.trim()) {
      submitGuess();
    }
  };

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
      <div className={`guess-form ${shake ? "shake" : ""}`}>
        <input
          type="text"
          className="guess-input"
          placeholder="What do you think this is?"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isCorrect || timeRemaining <= 0}
          autoFocus
        />
        <button
          className="submit-button"
          onClick={submitGuess}
          disabled={!guess.trim() || isLoading || isCorrect || timeRemaining <= 0}
        >
          {isLoading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              Submit <span className="submit-icon">➜</span>
            </>
          )}
        </button>
      </div>

      {renderWordLengthHint()}

      {isCorrect && (
        <div className="result-message result-correct">
          <span className="result-icon">✅</span> Correct! Great job!
        </div>
      )}

      {!isCorrect && timeRemaining > 0 && (
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

      {!isCorrect && (
        <div className="hint-container">
          Tip: Look carefully at the image and try as many guesses as you like!
        </div>
      )}
    </div>
  );
}