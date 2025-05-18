import React, { useEffect, useState, useRef } from "react";
import GuessInput from "./GuessInput";
import Reveal from "./Reveal";
import { useGame } from "./GameContext";

export default function GameLoop({ onComplete }) {
  const { playerName } = useGame();

  const [imageList, setImageList] = useState([]);
  const [imageIndex, setImageIndex] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [showReveal, setShowReveal] = useState(false);
  const [allGuesses, setAllGuesses] = useState({});

  const timerRef = useRef(null);
  const revealTimerRef = useRef(null);

  // 🧠 Step 1: Poll current image index
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://192.168.11.161:5050/current-round");
        const data = await res.json();
        setImageIndex(data.index);
      } catch (err) {
        console.error("Error polling current round:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 🔁 Step 2: Fetch full list of images once
  useEffect(() => {
    const loadAllImages = async () => {
      const res = await fetch("http://192.168.11.161:5050/images");
      const data = await res.json();
      setImageList(data.images); // [{ player, word, image_url }]
    };
    loadAllImages();
  }, []);

  // Step 3: Set current imageData from imageList[imageIndex]
  useEffect(() => {
    if (imageList.length && imageIndex !== null) {
      const current = imageList[imageIndex];
      if (!current) {
        // Reached end
        setTimeout(() => onComplete(), 5000);
      } else {
        setImageData(current);
        setShowReveal(false);
        setAllGuesses({});
      }
    }
  }, [imageIndex, imageList]);

  // Step 4: Set timers for guess + reveal
  useEffect(() => {
    if (!imageData) return;

    timerRef.current = setTimeout(async () => {
      await fetchGuesses();
      setShowReveal(true);

      revealTimerRef.current = setTimeout(async () => {
        await fetch("http://192.168.11.161:5050/advance-round", {
          method: "POST",
        });
        await fetch("http://192.168.11.161:5050/next-round", {
          method: "POST",
        });
      }, 5000);
    }, 15000);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(revealTimerRef.current);
    };
  }, [imageData]);

  const fetchGuesses = async () => {
    const res = await fetch(`http://192.168.11.161:5050/guesses/${imageIndex}`);
    const data = await res.json();
    setAllGuesses(data);
  };

  if (!imageData) return <h3>⏳ Loading image...</h3>;

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      {!showReveal ? (
        <>
          <h2>🖼️ Image {imageIndex + 1} of {imageList.length}</h2>
          <h3>⏳ You have 15 seconds to guess!</h3>
          <img src={imageData.image_url} width="512" />
          <GuessInput imageIndex={imageIndex} correctWord={imageData.word} />
        </>
      ) : (
        <Reveal
          aiImage={imageData.image_url}
          sketchPath={`http://192.168.11.161:5050/uploads/${imageData.player}_${imageData.word}.png`}
          word={imageData.word}
          player={imageData.player}
          guesses={allGuesses}
        />
      )}
    </div>
  );
}