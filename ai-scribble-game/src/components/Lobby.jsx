// import React, { useState, useEffect } from "react";
// import { useGame } from "./GameContext";
// import "./GameStyles.css";

// export default function Lobby() {
//   const [name, setName] = useState("");
//   const {
//     playerName, setPlayerName,
//     players, setPlayers,
//     setGameStarted, setIsHost
//   } = useGame();

//   const handleJoin = async () => {
//     if (!name.trim()) return;

//     try {
//       const response = await fetch("http://192.168.11.161:5050/join", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ name }),
//       });

//       const data = await response.json();
//       setPlayerName(name);
//       setPlayers(data.players);

//       if (data.players[0] === name) {
//         setIsHost(true);
//       }
//     } catch (err) {
//       console.error("Error joining game:", err);
//     }
//   };

// //   const handleStart = () => {
// //     setGameStarted(true);
// //   };

// const handleStart = async () => {
//   try {
//     await fetch("http://192.168.11.161:5050/start-game", {
//       method: "POST"
//     });
//   } catch (err) {
//     console.error("Error starting game:", err);
//   }
// };

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       try {
//         const res = await fetch("http://192.168.11.161:5050/players");
//         const data = await res.json();
//         setPlayers(data.players);
//       } catch (err) {
//         console.error("Failed to fetch players:", err);
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [setPlayers]);

//   return (
//     <div style={{ textAlign: "center", marginTop: "60px" }}>
//       <h1>🎮 Join AI Scribble Game</h1>
//       <input
//         type="text"
//         placeholder="Enter your name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         style={{ padding: "10px", margin: "10px", width: "200px" }}
//       />
//       <br />
//       <button onClick={handleJoin} style={{ padding: "10px 20px" }}>
//         Join
//       </button>

//       {players.length > 0 && (
//         <>
//           <h2>👥 Players in Lobby</h2>
//           <ul style={{ listStyleType: "none", padding: 0 }}>
//             {players.map((p, i) => (
//               <li key={i}>{p}</li>
//             ))}
//           </ul>
//         </>
//       )}

//       {/* ✅ Check against playerName */}
//       {players.length > 1 && players[0] === playerName && (
//         <button onClick={handleStart} style={{ padding: "10px 20px", marginTop: "20px" }}>
//           🚀 Start Game
//         </button>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useGame } from "./GameContext";
import "./GameStyles.css";

export default function Lobby() {
  const [name, setName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const {
    playerName, setPlayerName,
    players, setPlayers,
    setGameStarted, setIsHost
  } = useGame();

  const handleJoin = async () => {
    if (!name.trim()) return;
    
    setIsJoining(true);
    try {
      const response = await fetch("http://192.168.11.161:5050/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      setPlayerName(name);
      setPlayers(data.players);

      if (data.players[0] === name) {
        setIsHost(true);
      }
    } catch (err) {
      console.error("Error joining game:", err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await fetch("http://192.168.11.161:5050/start-game", {
        method: "POST"
      });
      // The game will start when the server sends the appropriate event
    } catch (err) {
      console.error("Error starting game:", err);
      setIsStarting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      handleJoin();
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://192.168.11.161:5050/players");
        const data = await res.json();
        setPlayers(data.players);
        
        // Check if game has started from server response
        if (data.gameStarted) {
          setGameStarted(true);
        }
      } catch (err) {
        console.error("Failed to fetch players:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [setPlayers, setGameStarted]);

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

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="game-logo">🎮</div>
        <h1 className="lobby-title">AI Scribble Game</h1>
        <p className="lobby-subtitle">
          Join the fun with friends and test your drawing skills!
        </p>

        {!playerName ? (
          <>
            <input
              className="lobby-input"
              type="text"
              placeholder="Enter your name to join"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={15}
            />
            <button 
              className="lobby-button" 
              onClick={handleJoin}
              disabled={isJoining || !name.trim()}
            >
              {isJoining ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                "Join Game"
              )}
            </button>
          </>
        ) : (
          <>
            {players.length > 0 && (
              <div className="players-list">
                <h2 className="players-title">
                  <span>👥</span> Players in Lobby
                </h2>
                {players.length === 1 && (
                  <div className="waiting-message">
                    Waiting for other players to join...
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <ul>
                  {players.map((p, i) => (
                    <li key={i} className="player-item">
                      <div 
                        className="player-avatar" 
                        style={{ backgroundColor: getAvatarColor(p) }}
                      >
                        {getInitials(p)}
                      </div>
                      <span className="player-name">{p}</span>
                      {i === 0 && <span className="host-badge">Host</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {players.length > 1 && players[0] === playerName && (
              <button 
                className="start-button" 
                onClick={handleStart}
                disabled={isStarting}
              >
                {isStarting ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  "🚀 Start Game"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}