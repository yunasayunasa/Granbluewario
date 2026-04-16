/** ミニゲーム: ルリアをタップ！ */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { LURIA_COLOR, LURIA_STROKE, LURIA_RADIUS } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

class TapLuriaGame implements Minigame {
  readonly id = 'tap_luria';
  readonly instruction = 'ルリアをタップ！';
  readonly requiredInputs: InputType[] = ['tap'];

  private mc!: MinigameContext;
  private lx = 0;
  private ly = 0;
  private pulse = 0;

  init(context: MinigameContext) {
    this.mc = context;
    this.pulse = 0;
    // ルリアをランダム位置に配置（HUD・タイマーバーを避ける）
    this.lx = 70 + Math.random() * (W - 140);
    this.ly = 130 + Math.random() * (H - 240);

    context.input.onTap((e) => {
      if (Math.hypot(e.x - this.lx, e.y - this.ly) <= LURIA_RADIUS) {
        context.audio.playTap();
        context.onSuccess();
      }
    });
  }

  update(dt: number) {
    this.pulse += dt * 3;
  }

  render() {
    const { ctx } = this.mc;

    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(0, 0, W, H);

    // 波紋アニメーション
    const ring = LURIA_RADIUS + Math.sin(this.pulse) * 6;
    ctx.beginPath();
    ctx.arc(this.lx, this.ly, ring, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(68,170,255,${0.3 + Math.sin(this.pulse) * 0.2})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // ルリア本体（青い円）
    ctx.beginPath();
    ctx.arc(this.lx, this.ly, LURIA_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = LURIA_COLOR;
    ctx.fill();
    ctx.strokeStyle = LURIA_STROKE;
    ctx.lineWidth = 3;
    ctx.stroke();

    // ラベル
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 20px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ルリア', this.lx, this.ly);
  }

  destroy() {}
}

export const tapLuria = new TapLuriaGame();
