import { ChangeEvent, useRef, useState } from "react";
import "./App.css";
import { useAnimationFrame } from "./hooks/useClock";
import { playSample } from "./utils";

function App() {
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(100);
  const [led, setLed] = useState(false);

  const sample = useRef(new Audio("samples/kick.wav"))

  useAnimationFrame(
    bpm,
    () => {
      setCount((prev) => prev + 1);
      setLed((prev) => !prev);
      playSample(sample.current);
    },
    isPlaying
  );

  function handleBpmChange(e: ChangeEvent<HTMLInputElement>) {
    setBpm((prev) => Number(e.target.validity.valid ? e.target.value : prev));
  }

  return (
    <div>
      <button onClick={() => playSample(sample.current)}>count is {count}</button>
      <button
        onClick={() => {
          setIsPlaying((prev) => !prev);
        }}
      >
        {isPlaying ? "⏸️ Pause" : "▶️ Play"}
      </button>
      <input
        type="number"
        pattern="[0-9]*"
        value={bpm}
        onChange={handleBpmChange}
      />
      <div>{led ? "🔴" : "⚫️"}</div>
    </div>
  );
}

export default App;
