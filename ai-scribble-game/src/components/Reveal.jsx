// export default function Reveal({ aiImage, sketchPath, word, player, guesses }) {
//   return (
//     <div style={{ textAlign: "center" }}>
//       <h2>✨ Time’s Up!</h2>
//       <p><strong>{player}</strong> drew <strong>{word}</strong></p>
//       <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
//         <div>
//           <h4>AI Image</h4>
//           <img src={aiImage} width="256" />
//         </div>
//         <div>
//           <h4>Original Drawing</h4>
//           <img src={sketchPath} width="256" />
//         </div>
//       </div>
//       <div style={{ marginTop: "20px" }}>
//         <h4>📝 Player Guesses</h4>
//         <ul style={{ listStyle: "none" }}>
//           {Object.entries(guesses).map(([player, guess]) => (
//             <li key={player}>
//               <strong>{player}:</strong> {guess}
//               {guess.trim().toLowerCase() === word.toLowerCase()
//                 ? " ✅"
//                 : " ❌"}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }


import React from "react";
import "./Reveal.css";

export default function Reveal({ aiImage, sketchPath, word, player, guesses }) {
  // Function to get player initials for avatar
  const getInitials = (playerName) => {
    return playerName.charAt(0).toUpperCase();
  };

  // Generate random pastel color based on player name
  const getAvatarColor = (playerName) => {
    let hash = 0;
    for (let i = 0; i < playerName.length; i++) {
      hash = playerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Calculate score (percentage of correct guesses)
  const calculateScore = () => {
    if (Object.keys(guesses).length === 0) return 0;
    
    const correctGuesses = Object.values(guesses).filter(
      guess => guess.trim().toLowerCase() === word.toLowerCase()
    ).length;
    
    return Math.round((correctGuesses / Object.keys(guesses).length) * 100);
  };

  const score = calculateScore();

  return (
    <div className="reveal-container">
      <h2 className="reveal-title">
        <span className="icon">✨</span> Time's Up!
      </h2>
      
      <p className="reveal-subtitle">
        <strong>{player}</strong> drew <span className="highlight">{word}</span>
      </p>
      
      <div className="images-container">
        <div className="image-card">
          <h4 className="image-title">
            Generated Image
            <span className="ai-badge">
              <span>🤖</span> AI
            </span>
          </h4>
          <div className="image-frame">
            <img src={aiImage} alt={`AI generated ${word}`} />
          </div>
        </div>
        
        <div className="image-card">
          <h4 className="image-title">
            Original Drawing
            <span className="drawing-badge">
              <span>✏️</span> Player
            </span>
          </h4>
          <div className="image-frame">
            <img src={sketchPath} alt={`${player}'s drawing of ${word}`} />
          </div>
        </div>
      </div>
      
      <div className="guesses-container">
        <h4 className="guesses-title">
          <span>📝</span> Player Guesses 
          {score > 0 && (
            <span style={{ fontSize: '16px', marginLeft: '10px', color: '#586069' }}>
              ({score}% correct)
            </span>
          )}
        </h4>
        
        <ul className="guesses-list">
          {Object.entries(guesses).map(([guessingPlayer, guess], index) => {
            const isCorrect = guess.trim().toLowerCase() === word.toLowerCase();
            return (
              <li 
                key={guessingPlayer} 
                className="guess-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="player-info">
                  <div 
                    className="player-avatar" 
                    style={{ backgroundColor: getAvatarColor(guessingPlayer) }}
                  >
                    {getInitials(guessingPlayer)}
                  </div>
                  <span className="player-name">{guessingPlayer}</span>
                </div>
                
                <span className="guess-text">guessed "{guess}"</span>
                
                <span className={`guess-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? "✅" : "❌"}
                </span>
              </li>
            );
          })}
          
          {Object.keys(guesses).length === 0 && (
            <li className="guess-item">
              <em>No guesses were submitted</em>
            </li>
          )}
        </ul>
      </div>
      
      {/* Optional: Add game control buttons */}
      <div className="reveal-actions">
        <button className="next-round-button">
          Next Round <span>→</span>
        </button>
        <button className="lobby-button">
          Back to Lobby
        </button>
      </div>
      
      {/* Add confetti effect for visual flair */}
      {score >= 50 && Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i} 
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
}