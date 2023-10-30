import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { useAnimationFrame } from "./hooks/useClock";
import { GRID_LENGTH } from "./constants";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(100);
  const [led, setLed] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(GRID_LENGTH).fill(false));
  const [currentBeat, setCurrentBeat] = useState<null | number>(null);

  const audioContext = useRef<AudioContext>();
  const kickBuffer = useRef<AudioBuffer>();

  function activateAudioCtxt() {
    audioContext.current = new AudioContext();
  }

  // const tab = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]

  async function loadKick(url: string) {
    if (!audioContext.current) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      audioContext.current.decodeAudioData(
        arrayBuffer,
        (buffer) => {
          kickBuffer.current = buffer;
        },
        () => console.error("Failed to buffer")
      );
    } catch (error) {
      console.error("Failed to fetch", error);
    }
  }

  function playSound(buffer: AudioBuffer, time?: number) {
    if (!audioContext.current) return;
    const source = audioContext.current.createBufferSource(); // creates a sound source
    source.buffer = buffer; // tell the source which sound to play
    source.connect(audioContext.current.destination); // connect the source to the context's destination (the speakers)
    source.start(time); // time is relative to audiocontext
  }

  function handleCurrentBeat() {
    setCurrentBeat((prev) => {
      if (prev === null || prev + 1 === GRID_LENGTH) {
        return 0;
      } else {
        return prev + 1;
      }
    });
  }

  function scheduleNote() {
    if (!kickBuffer.current) return;
    if (currentBeat === null && grid[0]) {
      playSound(kickBuffer.current, 0.5);
    }
    if (currentBeat && grid[currentBeat + 1]) {
      playSound(kickBuffer.current);
    }
  }

  useEffect(() => {
    loadKick("samples/kick.wav");
    setCurrentBeat(null);
    setGrid([
      true,
      true,
      true,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
  }, [isPlaying]);

  useAnimationFrame(
    bpm,
    () => {
      setLed((prev) => !prev);
      handleCurrentBeat();
      scheduleNote();
    },
    isPlaying,
    audioContext
  );

  function handleBpmChange(e: ChangeEvent<HTMLInputElement>) {
    setBpm(() => Number(e.target.value));
  }

  return (
    <div>
      <button
        onMouseDown={() => {
          if (kickBuffer.current) playSound(kickBuffer.current);
        }}
      >
        Play once
      </button>
      <button
        onClick={() => {
          setIsPlaying((prev) => !prev);
          activateAudioCtxt();
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
      <div>
        {led ? "🔴" : "⚫️"} time: {currentBeat}
      </div>
    </div>
  );
}

export default App;
