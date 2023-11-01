import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "./hooks/useClock";
import { EST_REFRESH_PERIOD, GRID_LENGTH, INIT_TEMPO, LOOKAHEAD_TIME } from "./constants";
import { bpmToPeriod } from "./utils";
import "./App.css";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(100);
  const [led, setLed] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(GRID_LENGTH).fill(true));
  const [currentBeat, setCurrentBeat] = useState<null | number>(null);

  const audioContext = useRef<AudioContext>();
  const kickBuffer = useRef<AudioBuffer>();
  const frame = useRef<number | null>(null);

  function activateAudioCtxt() {
    audioContext.current = new AudioContext();
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

  function playSound(buffer: AudioBuffer, time?: number) {
    if (!audioContext.current) return;
    const source = audioContext.current.createBufferSource(); // creates a sound source
    source.buffer = buffer; // tell the source which sound to play
    source.connect(audioContext.current.destination); // connect the source to the context's destination (the speakers)
    source.start(time); // time is relative to audiocontext / en secondes !!
  }

  function changeBeat() {
    console.log("change beat", audioContext.current?.currentTime);

    setCurrentBeat((prev) => {
      if (prev === null || prev + 1 === GRID_LENGTH) {
        return 0;
      } else {
        return prev + 1;
      }
    });

    setLed((prev) => !prev);
  }

  function scheduleInitNote() {
    if (!kickBuffer.current) return;
    if (currentBeat === null && grid[0]) {
      playSound(kickBuffer.current, INIT_TEMPO);
      console.log("kick init");
    }
  }

  function scheduleNote(): number | undefined {
    console.log("time", audioContext.current?.currentTime, currentBeat);

    if (!kickBuffer.current || currentBeat === null || !audioContext.current) return;

    if (currentBeat >= 0 && grid[currentBeat + 1]) {
      playSound(kickBuffer.current, INIT_TEMPO + (bpmToPeriod(bpm) / 1000) * (currentBeat + 1));
      console.log("schedule time", audioContext.current?.currentTime);
      console.log("kick prog at : ", INIT_TEMPO + (bpmToPeriod(bpm) / 1000) * (currentBeat + 1));
    }

    // retourne la diff entre le temps actuel et la programmation de la note
    return audioContext.current.currentTime - (INIT_TEMPO + (bpmToPeriod(bpm) / 1000) * (currentBeat + 1));
  }

  function animate(oldTime: number) {
    const currentTime = audioContext.current!.currentTime * 1000;
    const timeDiff = currentTime - oldTime;

    if (timeDiff + EST_REFRESH_PERIOD / 2 + LOOKAHEAD_TIME >= bpmToPeriod(bpm)) {
      console.log("dakkkk");
      changeBeat();
      scheduleNote();
      frame.current = requestAnimationFrame(() => animate(currentTime));
    } else {
      frame.current = requestAnimationFrame(() => animate(oldTime));
    }
  }

  // const cachedAnimate = useCallback(animate, [currentBeat]);

  useEffect(() => {
    activateAudioCtxt();
    loadKick("samples/kick.wav");
  }, []);

  useEffect(() => {
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

    if (isPlaying) {
      activateAudioCtxt();
      scheduleInitNote();
      setTimeout(() => changeBeat(), INIT_TEMPO * 1000);
      const initialTime = audioContext.current!.currentTime * 1000;
      frame.current = requestAnimationFrame(() => animate(initialTime));
    }
  }, [isPlaying]);

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
        onClick={async () => {
          setIsPlaying((prev) => !prev);
        }}
      >
        {isPlaying ? "⏸️ Pause" : "▶️ Play"}
      </button>
      <input type="number" pattern="[0-9]*" value={bpm} onChange={handleBpmChange} />
      <div>
        {led ? "🔴" : "⚫️"} time: {currentBeat}
      </div>
    </div>
  );
}

export default App;
