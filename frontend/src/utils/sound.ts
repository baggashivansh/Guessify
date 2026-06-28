import confetti from 'canvas-confetti';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  if (localStorage.getItem('guessify_muted') === 'true') return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export const sounds = {
  higher: () => playTone(300, 0.15),
  lower: () => playTone(200, 0.15),
  correct: () => {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 100);
    setTimeout(() => playTone(784, 0.2), 200);
  },
  win: () => {
    playTone(440, 0.1);
    setTimeout(() => playTone(554, 0.1), 80);
    setTimeout(() => playTone(659, 0.1), 160);
    setTimeout(() => playTone(880, 0.3), 240);
  },
};

export function celebrateWin() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#6366f1', '#818cf8', '#a5b4fc', '#16a34a'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#6366f1', '#818cf8', '#a5b4fc', '#16a34a'],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  sounds.win();
}

export function isMuted(): boolean {
  return localStorage.getItem('guessify_muted') === 'true';
}

export function toggleMute(): boolean {
  const muted = !isMuted();
  localStorage.setItem('guessify_muted', String(muted));
  return muted;
}
