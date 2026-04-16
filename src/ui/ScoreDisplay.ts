/** スコア表示 */

import type { Renderer } from '../core/Renderer';

export class ScoreDisplay {
  private r: Renderer;

  constructor(renderer: Renderer) {
    this.r = renderer;
  }

  /** @param score 現在のスコア */
  render(score: number) {
    this.r.text(`${score}`, 300, 28, 20, '#ffd700', 'right');
  }
}
