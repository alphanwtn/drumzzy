import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./App.css";
import { useAnimationFrame } from "./hooks/useClock";
import { GRID_LENGTH, INIT_TEMPO } from "./constants";
import { bpmToPeriod } from "./utils";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState<number>(100);
  const [led, setLed] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(GRID_LENGTH).fill(true));
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
    source.start(time); // time is relative to audiocontext / en secondes !!
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

  function scheduleInitNote() {
    if (!kickBuffer.current) return;
    if (currentBeat === null && grid[0]) {
      playSound(kickBuffer.current, INIT_TEMPO);
      console.log("kick init");
    }
  }

  function scheduleNote(): number | undefined {
    console.log("time", audioContext.current?.currentTime);

    if (!kickBuffer.current || currentBeat === null || !audioContext.current)
      return;

    if (currentBeat >= 0 && grid[currentBeat + 1]) {
      playSound(
        kickBuffer.current,
        INIT_TEMPO + (bpmToPeriod(bpm) / 1000) * (currentBeat + 1)
      );
      console.log("schedule time", audioContext.current?.currentTime);
      console.log(
        "kick prog at : ",
        INIT_TEMPO + (bpmToPeriod(bpm) / 1000) * (currentBeat + 1)
      );
    }

    // retourne la diff entre le temps actuel et la programmation de la note
    return (
      audioContext.current.currentTime -
      (INIT_TEMPO + (bpmToPeriod(bpm) / 1000) * (currentBeat + 1))
    );
  }

  useEffect(() => {
    activateAudioCtxt();
    loadKick("samples/kick.wav");
  }, []);

  useEffect(() => {
    setCurrentBeat(null);
    scheduleInitNote();
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
      scheduleNote();
      setLed((prev) => !prev);
      handleCurrentBeat();
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
        onClick={async () => {
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
      <div>
        {led ? "🔴" : "⚫️"} time: {currentBeat}
      </div>
    </div>
  );
}

export default App;
