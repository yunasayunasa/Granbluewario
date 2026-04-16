/** ミニゲーム: 指示された方向にスワイプ！ */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType, SwipeDirection } from '../../core/types';
import { ARROW_COLOR } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;
const DIRS: SwipeDirection[] = ['up', 'down', 'left', 'right'];
const DIR_ARROW: Record<SwipeDirection, string> = { up: '↑', down: '↓', left: '←', right: '→' };
const DIR_JP: Record<SwipeDirection, string> = { up: '上', down: '下', left: '左', right: '右' };

class SwipeDirectionGame implements Minigame {
  readonly id = 'swipe_direction';
  instruction = 'スワイプせよ！';
  readonly requiredInputs: InputType[] = ['swipe'];

  private mc!: MinigameContext;
  private required: SwipeDirection = 'up';
  private pulse = 0;

  init(context: MinigameContext) {
    this.mc = context;
    this.pulse = 0;
    this.required = DIRS[Math.floor(Math.random() * DIRS.length)];
    this.instruction = `${DIR_ARROW[this.required]} スワイプ！`;

    context.input.onSwipe((e) => {
      if (e.direction === this.required) {
        context.audio.playTap();
        context.onSuccess();
      } else {
        context.onFailure();
      }
    });
  }

  update(dt: number) {
    this.pulse += dt * 2.5;
  }

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const scale = 1 + Math.sin(this.pulse) * 0.08;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    ctx.fillStyle = ARROW_COLOR;
    ctx.font = `bold 120px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(DIR_ARROW[this.required], cx, cy - 20);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 22px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`「${DIR_JP[this.required]}」にスワイプ`, W / 2, cy + 90);
  }

  destroy() {}
}

export const swipeDirection = new SwipeDirectionGame();
