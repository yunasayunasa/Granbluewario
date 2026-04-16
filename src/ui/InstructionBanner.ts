/** ミニゲームプレイ中に上部へ表示する指示文バナー */

import type { Renderer } from '../core/Renderer';

export class InstructionBanner {
  private r: Renderer;

  constructor(renderer: Renderer) {
    this.r = renderer;
  }

  /** @param text 指示文 */
  render(text: string) {
    this.r.roundRect(10, 52, 340, 36, 6, 'rgba(0,0,0,0.65)');
    this.r.text(text, 180, 70, 16, '#ffd700');
  }
}
