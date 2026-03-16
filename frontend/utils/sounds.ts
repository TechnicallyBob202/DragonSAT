function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

function playTone(freq: number, duration: number, startOffset = 0, volume = 0.25) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  const t = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

/** Single short beep — plays when timer enters warning territory */
export function playTimerWarning() {
  try {
    playTone(523, 0.25); // C5
  } catch { /* ignore */ }
}

/** Three descending tones — plays when time expires */
export function playTimerExpired() {
  try {
    playTone(440, 0.2, 0);    // A4
    playTone(349, 0.2, 0.25); // F4
    playTone(262, 0.35, 0.5); // C4
  } catch { /* ignore */ }
}
