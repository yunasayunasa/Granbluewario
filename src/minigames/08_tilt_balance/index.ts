/** ミニゲーム: バランスを取れ！（端末傾き） */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { BALL_COLOR, PLATFORM_COLOR, FALL_LIMIT } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;
const BALL_R = 18;
const PLAT_W = 200;
const PLAT_H = 10;
const PLAT_Y = H / 2 + 40;

class TiltBalanceGame implements Minigame {
  readonly id = 'tilt_balance';
  readonly instruction = 'バランスを取れ！';
  readonly requiredInputs: InputType[] = ['tilt'];

  private mc!: MinigameContext;
  private bx = 0;
  private vx = 0;
  private tilt = 0;
  private done = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.bx = W / 2;
    this.vx = 0;
    this.tilt = 0;
    this.done = false;

    context.input.onTilt((gamma, _beta) => {
      this.tilt = Math.max(-45, Math.min(45, gamma));
    });
  }

  update(dt: number) {
    if (this.done) return;

    const gravity = 500 * Math.sin(this.tilt * Math.PI / 180);
    this.vx += gravity * dt;
    this.vx *= 0.88;
    this.bx += this.vx * dt;
    this.bx = Math.max(BALL_R, Math.min(W - BALL_R, this.bx));

    if (Math.abs(this.bx - W / 2) > FALL_LIMIT) {
      this.done = true;
      this.mc.onFailure();
    }
  }

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(0, 0, W, H);

    // プラットフォーム
    ctx.fillStyle = PLATFORM_COLOR;
    ctx.fillRect(W / 2 - PLAT_W / 2, PLAT_Y, PLAT_W, PLAT_H);

    // 落下限界線
    ctx.strokeStyle = 'rgba(255,80,80,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(W / 2 - FALL_LIMIT, PLAT_Y - BALL_R - 5);
    ctx.lineTo(W / 2 - FALL_LIMIT, PLAT_Y + PLAT_H + 5);
    ctx.moveTo(W / 2 + FALL_LIMIT, PLAT_Y - BALL_R - 5);
    ctx.lineTo(W / 2 + FALL_LIMIT, PLAT_Y + PLAT_H + 5);
    ctx.stroke();
    ctx.setLineDash([]);

    // ボール（グラン）
    ctx.beginPath();
    ctx.arc(this.bx, PLAT_Y - BALL_R, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();
    ctx.strokeStyle = '#88ccff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 11px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('グラン', this.bx, PLAT_Y - BALL_R);

    // 傾き表示
    ctx.fillStyle = '#aaaacc';
    ctx.font = `13px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`傾き: ${this.tilt.toFixed(1)}°`, W / 2, H - 55);

    // 中央ガイド
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, PLAT_Y - 30);
    ctx.lineTo(W / 2, PLAT_Y + PLAT_H + 10);
    ctx.stroke();
  }

  destroy() {}
}

export const tiltBalance = new TiltBalanceGame();
