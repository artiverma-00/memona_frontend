import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function ConfettiAnimation({ isActive }) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.4}
      colors={["#F4B400", "#E8A600", "#ffd700", "#FFE082", "#FFD54F"]}
    />
  );
}
