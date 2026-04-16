/** ミニゲーム間カットイン演出（指示文を大きく表示） */

import type { Scene } from '../core/GameManager';
import type { GameManager } from '../core/GameManager';
import { Renderer } from '../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

export class TransitionScene implements Scene {
  private gm: GameManager;
  private instruction: string;
  private duration: number;
  private onDone: () => void;
  private elapsed = 0;

  constructor(gm: GameManager, instruction: string, onDone: () => void, duration = 1.0) {
    this.gm = gm;
    this.instruction = instruction;
    this.onDone = onDone;
    this.duration = duration;
  }

  init() {
    this.elapsed = 0;
    this.gm.audio.playCutIn();
  }

  update(dt: number) {
    this.elapsed += dt;
    if (this.elapsed >= this.duration) this.onDone();
  }

  render() {
    const r = this.gm.renderer;
    const progress = Math.min(this.elapsed / this.duration, 1);
    r.clear('#0a0a1e');

    // フラッシュ背景
    const alpha = Math.sin(progress * Math.PI) * 0.3;
    r.ctx.fillStyle = `rgba(255,215,0,${alpha})`;
    r.ctx.fillRect(0, 0, W, H);

    // 指示文（ズームイン）
    const scale = progress < 0.25 ? 1 + (1 - progress / 0.25) * 0.4 : 1;
    const opacity = progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
    r.ctx.save();
    r.ctx.globalAlpha = opacity;
    r.ctx.translate(W / 2, H / 2);
    r.ctx.scale(scale, scale);
    r.ctx.translate(-W / 2, -H / 2);
    r.text(this.instruction, W / 2, H / 2, 38, '#ffd700');
    r.ctx.restore();

    // 下部プログレスバー
    r.roundRect(0, H - 6, W * (1 - progress), 6, 0, '#ffd700');
  }

  destroy() {}
}
