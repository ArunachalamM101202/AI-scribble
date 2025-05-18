import React, { useEffect, useState } from "react";
import "./GameSummary.css";

export default function GameSummary({ onRestart }) {
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("http://localhost/scores");
        const data = await res.json();
        setScores(data);

        // Find the winner - maintaining the same logic
        const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
        setWinner(sorted.length > 0 ? sorted[0][0] : null);
      } catch (err) {
        console.error("Error fetching scores:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, []);

  // Function to get player initials for avatar
  const getInitials = (playerName) => {
    return playerName.charAt(0).toUpperCase();
  };

  // Generate random pastel color based on player name - same as other components
  const getAvatarColor = (playerName) => {
    let hash = 0;
    for (let i = 0; i < playerName.length; i++) {
      hash = playerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Render confetti for celebration
  const renderConfetti = () => {
    return Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 10 + 5}px`,
          height: `${Math.random() * 10 + 5}px`,
          backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${Math.random() * 3 + 3}s`
        }}
      />
    ));
  };

  return (
    <div className="game-summary-container">
      <div className="summary-card">
        <h1 className="summary-title">
          <span className="icon">🎉</span> Game Over
        </h1>
        
        {isLoading ? (
          <div className="loading-dots" style={{ margin: "30px auto" }}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <>
            {winner && (
              <div className="winner-section">
                <div className="winner-backdrop"></div>
                <div className="confetti-container">
                  {renderConfetti()}
                </div>
                <div className="winner-trophy">🏆</div>
                <h2 className="winner-announcement">
                  Winner: <span className="winner-name">{winner}</span>
                </h2>
              </div>
            )}

            <div className="scores-section">
              <h3 className="scores-title">
                <span>📊</span> Final Scores
              </h3>
              <ul className="scores-list">
                {Object.entries(scores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score], index) => (
                    <li 
                      key={name} 
                      className={`score-item ${index === 0 ? 'first-place' : index === 1 ? 'second-place' : index === 2 ? 'third-place' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="player-name">
                        <div 
                          className="player-avatar" 
                          style={{ backgroundColor: getAvatarColor(name) }}
                        >
                          {getInitials(name)}
                        </div>
                        {name}
                        {index === 0 && <span className="winner-badge">🏆 Winner</span>}
                      </div>
                      <div className="player-score">{score}</div>
                    </li>
                  ))}
              </ul>
            </div>

            <button className="restart-button" onClick={onRestart}>
              <span className="restart-icon">🔁</span> Restart Game
            </button>
          </>
        )}
      </div>
    </div>
  );
}