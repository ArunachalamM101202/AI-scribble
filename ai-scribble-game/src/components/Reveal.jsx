// import React from "react";

// export default function Reveal({ aiImage, sketchPath, word, player }) {
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
//     </div>
//   );
// }


export default function Reveal({ aiImage, sketchPath, word, player, guesses }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h2>✨ Time’s Up!</h2>
      <p><strong>{player}</strong> drew <strong>{word}</strong></p>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <div>
          <h4>AI Image</h4>
          <img src={aiImage} width="256" />
        </div>
        <div>
          <h4>Original Drawing</h4>
          <img src={sketchPath} width="256" />
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h4>📝 Player Guesses</h4>
        <ul style={{ listStyle: "none" }}>
          {Object.entries(guesses).map(([player, guess]) => (
            <li key={player}>
              <strong>{player}:</strong> {guess}
              {guess.trim().toLowerCase() === word.toLowerCase()
                ? " ✅"
                : " ❌"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}