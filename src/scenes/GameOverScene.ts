/** ゲームオーバー画面 */

import type { Scene } from '../core/GameManager';
import type { GameManager } from '../core/GameManager';
import { Renderer } from '../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

export class GameOverScene implements Scene {
  private gm: GameManager;

  constructor(gm: GameManager) {
    this.gm = gm;
  }

  init() {
    this.gm.input.onTap((e) => {
      const cx = W / 2;

      // もう一度ボタン (cx-110, 370) 220×65
      if (e.x >= cx - 110 && e.x <= cx + 110 && e.y >= 370 && e.y <= 435) {
        this.gm.audio.playTap();
        this.gm.resetGame();
        this.gm.changeScene('play');
        return;
      }

      // タイトルへボタン (cx-110, 455) 220×65
      if (e.x >= cx - 110 && e.x <= cx + 110 && e.y >= 455 && e.y <= 520) {
        this.gm.audio.playTap();
        this.gm.changeScene('title');
      }
    });
  }

  update(_dt: number) {}

  render() {
    const r = this.gm.renderer;
    r.clear('#1a0000');

    // 背景グロー
    const ctx = r.ctx;
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 250);
    grad.addColorStop(0, 'rgba(255,0,0,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    r.text('ゲームオーバー', W / 2, 160, 34, '#ff4444');

    // スコア表示
    r.text(`${this.gm.score}`, W / 2, 265, 72, '#ffd700');
    r.text('クリア数', W / 2, 315, 18, '#aaaaaa');

    // もう一度ボタン
    r.roundRect(W / 2 - 110, 370, 220, 65, 12, '#ffd700');
    r.text('もう一度', W / 2, 402, 24, '#1a1a2e');

    // タイトルへボタン
    r.roundRect(W / 2 - 110, 455, 220, 65, 12, '#334466');
    r.text('タイトルへ', W / 2, 487, 24, '#aaddff');

    r.text('タップして選択', W / 2, H - 30, 13, '#555577');
  }

  destroy() {
    this.gm.input.clearAll();
  }
}
