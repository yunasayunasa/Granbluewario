/** タイトル画面 */

import type { Scene } from '../core/GameManager';
import type { GameManager } from '../core/GameManager';
import { Renderer } from '../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

export class TitleScene implements Scene {
  private gm: GameManager;
  private tiltBtnAlpha = 1;

  constructor(gm: GameManager) {
    this.gm = gm;
  }

  init() {
    this.gm.input.onTap((e) => {
      const cx = W / 2;

      // スタートボタン (cx-100, 340) 200×70
      if (e.x >= cx - 100 && e.x <= cx + 100 && e.y >= 340 && e.y <= 410) {
        this.gm.audio.playTap();
        this.gm.resetGame();
        this.gm.changeScene('play');
        return;
      }

      // 傾き許可ボタン (cx-110, 440) 220×50
      if (e.x >= cx - 110 && e.x <= cx + 110 && e.y >= 440 && e.y <= 490) {
        this.gm.audio.playTap();
        this.gm.requestTiltPermission().then((ok) => {
          this.tiltBtnAlpha = ok ? 0.4 : 1;
        });
      }
    });
  }

  update(_dt: number) {}

  render() {
    const r = this.gm.renderer;
    r.clear('#1a1a2e');

    // 背景装飾（星）
    const ctx = r.ctx;
    ctx.fillStyle = '#ffffff';
    [[40, 80], [310, 60], [20, 200], [340, 180], [60, 500], [300, 480]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // タイトルロゴ
    r.text('グラブルワリオ', W / 2, 130, 34, '#ffd700');
    r.text('- ミニゲームバトル -', W / 2, 175, 16, '#aaaacc');

    // キャラクタープレースホルダー（ルリア）
    ctx.beginPath();
    ctx.arc(W / 2, 265, 55, 0, Math.PI * 2);
    ctx.fillStyle = '#2255aa';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W / 2, 265, 55, 0, Math.PI * 2);
    ctx.strokeStyle = '#44aaff';
    ctx.lineWidth = 3;
    ctx.stroke();
    r.text('ルリア', W / 2, 265, 20, '#ffffff');

    // スタートボタン
    r.roundRect(W / 2 - 100, 340, 200, 70, 14, '#ffd700');
    r.text('スタート', W / 2, 375, 26, '#1a1a2e');

    // 傾き許可ボタン
    ctx.globalAlpha = this.gm.tiltEnabled ? 0.4 : this.tiltBtnAlpha;
    r.roundRect(W / 2 - 110, 440, 220, 50, 10, '#334466');
    r.text(this.gm.tiltEnabled ? '傾き入力: 有効' : '高度な操作を有効にする', W / 2, 465, 13, '#aaddff');
    ctx.globalAlpha = 1;

    // 操作説明
    r.text('タップ・スワイプで操作', W / 2, 530, 14, '#666688');
    r.text(`ライフ3つでエンドレス挑戦！`, W / 2, 555, 14, '#666688');

    // バージョン
    r.text('v0.1.0', W - 10, H - 15, 11, '#444466', 'right');
  }

  destroy() {
    this.gm.input.clearAll();
  }
}
