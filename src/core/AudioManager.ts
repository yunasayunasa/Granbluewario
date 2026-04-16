/** BGM・効果音管理（Web Audio API によるプログラム生成） */

export class AudioManager {
  private actx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private bgmTimer: number | null = null;

  private getCtx(): AudioContext {
    if (!this.actx) {
      this.actx = new AudioContext();
      this.master = this.actx.createGain();
      this.master.connect(this.actx.destination);
    }
    return this.actx;
  }

  private getMaster(): GainNode {
    this.getCtx();
    return this.master!;
  }

  /** ミュート状態を設定 */
  setMuted(v: boolean) {
    this.muted = v;
    if (this.master) this.master.gain.value = v ? 0 : 1;
  }

  /** ミュート状態を返す */
  isMuted() {
    return this.muted;
  }

  private tone(
    freq: number,
    type: OscillatorType,
    dur: number,
    vol = 0.3,
    delay = 0
  ) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.getMaster());
    osc.start(t);
    osc.stop(t + dur);
  }

  /** 成功 SE */
  playSuccess() {
    this.tone(523, 'sine', 0.1, 0.4);
    this.tone(659, 'sine', 0.1, 0.4, 0.1);
    this.tone(784, 'sine', 0.25, 0.4, 0.2);
  }

  /** 失敗 SE */
  playFailure() {
    this.tone(300, 'sawtooth', 0.15, 0.3);
    this.tone(220, 'sawtooth', 0.3, 0.3, 0.15);
  }

  /** カットイン SE */
  playCutIn() {
    this.tone(880, 'square', 0.05, 0.2);
    this.tone(1100, 'square', 0.08, 0.2, 0.05);
  }

  /** タップ SE */
  playTap() {
    this.tone(660, 'sine', 0.06, 0.25);
  }

  /** ゲームオーバー SE */
  playGameOver() {
    this.tone(400, 'sawtooth', 0.2, 0.4);
    this.tone(350, 'sawtooth', 0.2, 0.4, 0.2);
    this.tone(300, 'sawtooth', 0.2, 0.4, 0.4);
    this.tone(250, 'sawtooth', 0.5, 0.4, 0.65);
  }

  /** BGM を開始（tempo > 1.0 で加速） */
  startBGM(tempo = 1.0) {
    this.stopBGM();
    this.scheduleBGM(tempo);
  }

  private scheduleBGM(tempo: number) {
    const melody = [261, 329, 392, 440, 392, 329, 523, 392];
    const nLen = 0.18 / tempo;
    melody.forEach((f, i) => this.tone(f, 'triangle', nLen * 0.75, 0.12, i * nLen));
    const loopMs = melody.length * nLen * 1000;
    this.bgmTimer = window.setTimeout(() => this.scheduleBGM(tempo), loopMs);
  }

  /** BGM を停止 */
  stopBGM() {
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  destroy() {
    this.stopBGM();
    this.actx?.close();
  }
}
