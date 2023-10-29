import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { useAnimationFrame } from "./hooks/useClock";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(100);
  const [led, setLed] = useState(false);
  const [activeAudio, setActiveAudio] = useState(false);

  const audioContext = useRef<AudioContext>();
  const kickBuffer = useRef<AudioBuffer>();

  function activateAudioCtxt() {
    audioContext.current = new AudioContext();
    setActiveAudio(true);
  }

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

  function playSound(buffer: AudioBuffer) {
    if (!audioContext.current) return;
    const source = audioContext.current.createBufferSource(); // creates a sound source
    source.buffer = buffer; // tell the source which sound to play
    source.connect(audioContext.current.destination); // connect the source to the context's destination (the speakers)
    source.start(audioContext.current.currentTime); // play the source now
  }

  useEffect(() => {
    loadKick("samples/kick.wav");
  }, [activeAudio]);

  useAnimationFrame(
    bpm,
    () => {
      setLed((prev) => !prev);
      if (kickBuffer.current) playSound(kickBuffer.current);
    },
    isPlaying
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
      <button
        onClick={() => {
          activateAudioCtxt();
        }}
      >
        Activate audio {activeAudio && "🟢"}
      </button>
      <div>{led ? "🔴" : "⚫️"}</div>
    </div>
  );
}

export default App;
