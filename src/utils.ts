/**
 * bpm : (beat per minute) to period (ms)
 */
export function bpmToPeriod(tempo: number): number {
  return 1000 / (tempo / 60);
}

export function playSample(sample: HTMLAudioElement) {
  sample.pause();
  sample.load();
  sample.play();
}
