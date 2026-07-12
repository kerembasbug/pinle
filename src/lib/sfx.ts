// Hafif "pinleme" sesi — WebAudio ile üretilir (asset yok, offline çalışır).
// Kısa, yükselen iki notalı hoş "pop": dopamin dokunuşu, rahatsız etmez.
// Kullanıcı jesti (dokunma) sonucu çalar → autoplay politikasına takılmaz.
// localStorage "pinle-muted"=="1" ise susar.

let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  try {
    return localStorage.getItem("pinle-muted") === "1";
  } catch {
    return false;
  }
}

export function setMuted(m: boolean) {
  try {
    localStorage.setItem("pinle-muted", m ? "1" : "0");
  } catch {
    /* yoksay */
  }
}

export function playPinSound() {
  if (typeof window === "undefined" || isMuted()) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    // İki nota: E5→B5 gibi yükselen kısa çınlama
    const notes: [number, number][] = [
      [659, 0],
      [988, 0.075],
    ];
    for (const [freq, t] of notes) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now + t);
      g.gain.exponentialRampToValueAtTime(0.16, now + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.17);
      osc.connect(g).connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.19);
    }
  } catch {
    /* ses desteklenmiyorsa sessizce geç */
  }
}
