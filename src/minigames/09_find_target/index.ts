/** ミニゲーム: グラン / ジータを さがせ！ */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { CHAR_RADIUS } from './assets';
import { CHARACTERS, CHAR_COLOR } from '../../data/flavor';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

interface CharSlot {
  x: number;
  y: number;
  name: string;
  color: string;
  isTarget: boolean;
}

class FindTargetGame implements Minigame {
  readonly id = 'find_target';
  instruction = 'グランをさがせ！';
  readonly requiredInputs: InputType[] = ['tap'];

  private mc!: MinigameContext;
  private slots: CharSlot[] = [];
  private done = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.done = false;

    const count = 4 + Math.floor(context.difficulty * 3);
    const target = CHARACTERS[Math.floor(Math.random() * 8)]; // 主要キャラから選出
    this.instruction = `${target}を さがせ！`;

    // ランダム位置にキャラを配置（重ならないよう試行）
    const pool = [...CHARACTERS].filter((c) => c !== target).sort(() => Math.random() - 0.5);
    const chosen = [target, ...pool.slice(0, count - 1)];

    const positions = this.genPositions(count);
    this.slots = chosen.map((name, i) => ({
      x: positions[i].x,
      y: positions[i].y,
      name,
      color: CHAR_COLOR[name] ?? '#888888',
      isTarget: name === target,
    }));

    context.input.onTap((e) => {
      if (this.done) return;
      for (const s of this.slots) {
        if (Math.hypot(e.x - s.x, e.y - s.y) <= CHAR_RADIUS) {
          this.done = true;
          if (s.isTarget) {
            context.audio.playTap();
            context.onSuccess();
          } else {
            context.onFailure();
          }
          break;
        }
      }
    });
  }

  private genPositions(n: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const margin = CHAR_RADIUS + 10;
    const attempts = 200;
    for (let i = 0; i < n; i++) {
      let placed = false;
      for (let a = 0; a < attempts; a++) {
        const x = margin + Math.random() * (W - margin * 2);
        const y = 110 + Math.random() * (H - 200);
        const ok = positions.every((p) => Math.hypot(p.x - x, p.y - y) > CHAR_RADIUS * 2.4);
        if (ok) { positions.push({ x, y }); placed = true; break; }
      }
      if (!placed) positions.push({ x: margin + i * 60, y: 200 });
    }
    return positions;
  }

  update(_dt: number) {}

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(0, 0, W, H);

    for (const s of this.slots) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, CHAR_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff44';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 14px 'Noto Sans JP', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.name, s.x, s.y);
    }
  }

  destroy() {}
}

export const findTarget = new FindTargetGame();
