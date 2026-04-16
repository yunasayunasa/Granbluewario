/** ミニゲーム: ためろ！（長押しタイミング） */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { GAUGE_COLOR, ZONE_COLOR, FILL_TIME } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

class HoldChargeGame implements Minigame {
  readonly id = 'hold_charge';
  readonly instruction = 'ためろ！';
  readonly requiredInputs: InputType[] = ['long_press'];

  private mc!: MinigameContext;
  private isHolding = false;
  private holdStart = 0;
  private fillLevel = 0;
  private zoneStart = 0;
  private zoneEnd = 0;
  private done = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.isHolding = false;
    this.fillLevel = 0;
    this.done = false;
    // 難易度が高いほどゾーンが狭い
    const zoneWidth = 0.22 - context.difficulty * 0.12;
    this.zoneStart = 0.65;
    this.zoneEnd = this.zoneStart + Math.max(zoneWidth, 0.10);

    context.input.onPointerDown((_x, _y) => {
      if (this.done) return;
      this.isHolding = true;
      this.holdStart = performance.now();
    });

    context.input.onPointerUp((_x, _y) => {
      if (!this.isHolding || this.done) return;
      this.isHolding = false;
      const level = Math.min((performance.now() - this.holdStart) / (FILL_TIME * 1000), 1.0);
      this.fillLevel = level;
      if (level >= this.zoneStart && level <= this.zoneEnd) {
        this.done = true;
        context.onSuccess();
      } else {
        this.done = true;
        context.onFailure();
      }
    });
  }

  update(_dt: number) {
    if (this.isHolding && !this.done) {
      const elapsed = (performance.now() - this.holdStart) / (FILL_TIME * 1000);
      this.fillLevel = Math.min(elapsed, 1.0);
      if (this.fillLevel >= 1.0) {
        this.isHolding = false;
        this.done = true;
        this.mc.onFailure();
      }
    }
  }

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#0a0a2a';
    ctx.fillRect(0, 0, W, H);

    // ゲージ（縦棒）
    const gx = W / 2 - 30;
    const gy = 130;
    const gw = 60;
    const gh = H - 200;

    // 背景
    ctx.fillStyle = '#222244';
    ctx.fillRect(gx, gy, gw, gh);

    // 成功ゾーン（緑）
    const zS = gy + gh * (1 - this.zoneEnd);
    const zH = gh * (this.zoneEnd - this.zoneStart);
    ctx.fillStyle = ZONE_COLOR;
    ctx.fillRect(gx, zS, gw, zH);
    ctx.strokeStyle = '#88ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, zS, gw, zH);

    // 充填
    const fillH = gh * this.fillLevel;
    ctx.fillStyle = GAUGE_COLOR;
    ctx.fillRect(gx, gy + gh - fillH, gw, fillH);

    // 枠
    ctx.strokeStyle = '#aaaacc';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, gw, gh);

    // テキスト
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 18px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isHolding ? '押している…' : '画面を押してため、', W / 2, 90);
    ctx.font = `14px 'Noto Sans JP', sans-serif`;
    ctx.fillText('緑の範囲で放せ！', W / 2, 113);

    // ゾーンラベル
    ctx.fillStyle = '#88ff88';
    ctx.font = `bold 13px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('← ここで放す', gx + gw + 8, zS + zH / 2);
  }

  destroy() {}
}

export const holdCharge = new HoldChargeGame();
