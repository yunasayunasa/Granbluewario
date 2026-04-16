/** ミニゲーム: ひゃくれつけん！（連打） */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { BTN_COLOR, BTN_STROKE, BTN_RADIUS } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;
const BX = W / 2;
const BY = H / 2 + 20;

class ChooseElementGame implements Minigame {
  readonly id = 'choose_element';
  readonly instruction = 'ひゃくれつけん！';
  readonly requiredInputs: InputType[] = ['tap'];

  private mc!: MinigameContext;
  private taps = 0;
  private target = 0;
  private flash = 0;
  private done = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.taps = 0;
    this.flash = 0;
    this.done = false;
    this.target = 10 + Math.round(context.difficulty * 10);

    context.input.onTap((_e) => {
      if (this.done) return;
      this.taps++;
      this.flash = 0.12;
      context.audio.playTap();
      if (this.taps >= this.target) {
        this.done = true;
        context.onSuccess();
      }
    });
  }

  update(dt: number) {
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 4);
  }

  render() {
    const { ctx } = this.mc;

    // 背景フラッシュ
    const bg = this.flash > 0 ? '#3a1a1a' : '#1a0a0a';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 大きなボタン
    const r = BTN_RADIUS + (this.flash > 0 ? 5 : 0);
    ctx.beginPath();
    ctx.arc(BX, BY, r, 0, Math.PI * 2);
    ctx.fillStyle = this.flash > 0 ? '#ff4444' : BTN_COLOR;
    ctx.fill();
    ctx.strokeStyle = BTN_STROKE;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 28px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('連打！', BX, BY - 10);
    ctx.font = `bold 16px 'Noto Sans JP', sans-serif`;
    ctx.fillText('ひゃくれつけん', BX, BY + 22);

    // カウント
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold 28px 'Noto Sans JP', sans-serif`;
    ctx.fillText(`${this.taps} / ${this.target}`, W / 2, H - 55);

    // プログレスバー
    const prog = Math.min(this.taps / this.target, 1);
    ctx.fillStyle = '#333';
    ctx.fillRect(30, H - 38, W - 60, 14);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(30, H - 38, (W - 60) * prog, 14);
  }

  destroy() {}
}

export const chooseElement = new ChooseElementGame();
