/** ライフ表示（ハート3個） */

import type { Renderer } from '../core/Renderer';

export class LifeDisplay {
  private r: Renderer;

  constructor(renderer: Renderer) {
    this.r = renderer;
  }

  /** @param lives 現在のライフ数 */
  render(lives: number) {
    const ctx = this.r.ctx;
    for (let i = 0; i < 3; i++) {
      const x = 16 + i * 26;
      const y = 28;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = i < lives ? '#ff4444' : '#444444';
      ctx.fill();
      if (i < lives) {
        ctx.strokeStyle = '#ff9999';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }
}
