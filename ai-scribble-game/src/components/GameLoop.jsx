import React, { useEffect, useState } from "react";
import GuessInput from "./GuessInput";
import Reveal from "./Reveal";
import { useGame } from "./GameContext";

export default function GameLoop({ onComplete }) {
  const { playerName } = useGame();
  const [imageData, setImageData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showReveal, setShowReveal] = useState(false);

  // ⏳ Timer
  useEffect(() => {
    if (!imageData || showReveal) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setShowReveal(true);
          setTimeout(() => {
            handleNext();
          }, 5000); // show reveal for 5s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [imageData, showReveal]);

  // 📦 Load next image
  const fetchImage = async () => {
    const res = await fetch("http://localhost:5050/next-image");
    const data = await res.json();
    if (data.done) {
      onComplete();
    } else {
      setImageData(data);
      setTimeLeft(15);
      setShowReveal(false);
    }
  };

  const handleNext = async () => {
    await fetch("http://localhost:5050/advance-round", { method: "POST" });
    fetchImage();
  };

  useEffect(() => {
    fetchImage();
  }, []);

  if (!imageData) return <h3>Loading...</h3>;

  return (
    <div style={{ textAlign: "center" }}>
      {!showReveal ? (
        <>
          <h2>⏳ Time left: {timeLeft}s</h2>
          <img src={imageData.image_url} width="512" />
          <GuessInput />
        </>
      ) : (
        <Reveal
          aiImage={imageData.image_url}
          sketchPath={`http://localhost:5050/uploads/${imageData.player}_${imageData.word}.png`}
          word={imageData.word}
          player={imageData.player}
        />
      )}
    </div>
  );
}