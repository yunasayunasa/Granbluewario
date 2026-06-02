/** Web Audio APIでBGMと効果音を生成する。 */
export class AudioManager {
  private context: AudioContext | null = null;
  private muted = false;
  private bgmTimer: number | null = null;
  private tempo = 1;

  /** ミュート状態を切り替える。 */
  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) this.stopBgm();
    return this.muted;
  }

  /** ミュート中か返す。 */
  public isMuted(): boolean {
    return this.muted;
  }

  /** UI操作音を鳴らす。 */
  public tap(): void {
    this.tone(520, 0.04, 'square', 0.06);
  }

  /** 成功音を鳴らす。 */
  public success(): void {
    this.sequence([660, 880, 1100], 0.07, 'triangle');
  }

  /** 失敗音を鳴らす。 */
  public failure(): void {
    this.sequence([240, 180], 0.12, 'sawtooth');
  }

  /** カットイン音を鳴らす。 */
  public cutIn(): void {
    this.tone(740, 0.08, 'square', 0.05);
  }

  /** リザルト音を鳴らす。 */
  public result(): void {
    this.sequence([440, 554, 659, 880], 0.1, 'triangle');
  }

  /** BGMを開始する。 */
  public startBgm(tempo = 1): void {
    this.tempo = tempo;
    if (this.bgmTimer !== null || this.muted) return;
    let step = 0;
    const notes = [330, 392, 440, 392, 523, 494, 392, 440];
    const play = (): void => {
      this.tone(notes[step % notes.length], 0.08, 'square', 0.025);
      step += 1;
      this.bgmTimer = window.setTimeout(play, 220 / this.tempo);
    };
    play();
  }

  /** BGMを停止する。 */
  public stopBgm(): void {
    if (this.bgmTimer !== null) window.clearTimeout(this.bgmTimer);
    this.bgmTimer = null;
  }

  /** BGMテンポを更新する。 */
  public setTempo(tempo: number): void {
    this.tempo = tempo;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    this.context ??= new AudioContext();
    return this.context;
  }

  private tone(frequency: number, seconds: number, type: OscillatorType, gainValue: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + seconds);
  }

  private sequence(notes: number[], seconds: number, type: OscillatorType): void {
    notes.forEach((note, index) => window.setTimeout(() => this.tone(note, seconds, type, 0.07), index * seconds * 800));
  }
}
