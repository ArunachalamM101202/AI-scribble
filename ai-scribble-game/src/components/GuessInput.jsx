// import React, { useState } from "react";
// import { useGame } from "./GameContext";

// export default function GuessInput() {
//   const { playerName } = useGame();
//   const [guess, setGuess] = useState("");

//   const submitGuess = async () => {
//     await fetch("http://192.168.11.161:5050/submit-guess", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ player: playerName, guess }),
//     });
//     setGuess("");
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Your guess"
//         value={guess}
//         onChange={(e) => setGuess(e.target.value)}
//         style={{ padding: "8px", width: "300px" }}
//       />
//       <button onClick={submitGuess} style={{ marginLeft: "10px" }}>
//         Submit
//       </button>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useGame } from "./GameContext";

export default function GuessInput({ imageIndex, correctWord, onGuess }) {
  const { playerName } = useGame();
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null);

  const submitGuess = async () => {
    await fetch("http://192.168.11.161:5050/submit-guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player: playerName, guess, image_index: imageIndex }),
    });

    if (guess.trim().toLowerCase() === correctWord.toLowerCase()) {
      setResult("✅ Correct!");
    } else {
      setResult("❌ Incorrect.");
    }

    onGuess && onGuess(guess);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Guess the word"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />
      <button onClick={submitGuess} style={{ marginLeft: "10px" }}>
        Submit
      </button>
      {result && <p style={{ marginTop: "10px" }}>{result}</p>}
    </div>
  );
}