/** ミニゲーム: ビィに エサをやれ！ */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { VYRN_COLOR, VYRN_STROKE, VYRN_RADIUS } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;
const VX = W / 2;
const VY = H / 2 - 20;

class FeedVyrnGame implements Minigame {
  readonly id = 'feed_vyrn';
  readonly instruction = 'ビィに エサをやれ！';
  readonly requiredInputs: InputType[] = ['tap'];

  private mc!: MinigameContext;
  private taps = 0;
  private target = 0;
  private bounce = 0;
  private done = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.taps = 0;
    this.bounce = 0;
    this.done = false;
    this.target = 5 + Math.round(context.difficulty * 6);

    context.input.onTap((e) => {
      if (this.done) return;
      if (Math.hypot(e.x - VX, e.y - VY) <= VYRN_RADIUS + 10) {
        this.taps++;
        this.bounce = 0.25;
        context.audio.playTap();
        if (this.taps >= this.target) {
          this.done = true;
          context.onSuccess();
        }
      }
    });
  }

  update(dt: number) {
    if (this.bounce > 0) this.bounce = Math.max(0, this.bounce - dt * 3);
  }

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#2a1a00';
    ctx.fillRect(0, 0, W, H);

    const bOff = Math.sin(this.bounce * Math.PI) * 12;

    // ビィ（オレンジ円）
    ctx.beginPath();
    ctx.arc(VX, VY - bOff, VYRN_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = VYRN_COLOR;
    ctx.fill();
    ctx.strokeStyle = VYRN_STROKE;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 22px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ビィ', VX, VY - bOff);

    // 口
    ctx.beginPath();
    ctx.arc(VX, VY - bOff + 18, 14, 0, Math.PI);
    ctx.strokeStyle = '#cc7700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // プログレスバー
    const prog = this.taps / this.target;
    ctx.fillStyle = '#333';
    ctx.fillRect(40, H - 65, W - 80, 18);
    ctx.fillStyle = '#ffaa22';
    ctx.fillRect(40, H - 65, (W - 80) * prog, 18);
    ctx.strokeStyle = '#ffdd88';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, H - 65, W - 80, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 14px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.taps} / ${this.target}`, W / 2, H - 45);
  }

  destroy() {}
}

export const feedVyrn = new FeedVyrnGame();
