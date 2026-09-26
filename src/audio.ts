let context: AudioContext | null = null;
export function playTone(kind: 'select' | 'move' | 'flip', enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(kind === 'move' ? 260 : kind === 'flip' ? 380 : 520, now);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'select' ? 780 : 160, now + .12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.035, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .18);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(now); oscillator.stop(now + .2);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  } catch { /* Audio is an optional enhancement. */ }
}
