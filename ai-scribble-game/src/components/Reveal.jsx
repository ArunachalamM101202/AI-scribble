import React from "react";

export default function Reveal({ aiImage, sketchPath, word, player }) {
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
    </div>
  );
}