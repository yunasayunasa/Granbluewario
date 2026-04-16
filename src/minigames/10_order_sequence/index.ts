/** ミニゲーム: じゅんばんに タップ！（1→2→3） */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { NUM_RADIUS, NUM_COLORS, NUM_DONE_COLOR } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

interface NumSlot {
  x: number;
  y: number;
  num: number;
  tapped: boolean;
}

class OrderSequenceGame implements Minigame {
  readonly id = 'order_sequence';
  readonly instruction = 'じゅんばんに タップ！';
  readonly requiredInputs: InputType[] = ['tap'];

  private mc!: MinigameContext;
  private slots: NumSlot[] = [];
  private next = 1;
  private total = 3;
  private done = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.next = 1;
    this.done = false;
    this.total = 3 + (context.difficulty >= 0.75 ? 1 : 0);

    const positions = this.genPositions(this.total);
    this.slots = Array.from({ length: this.total }, (_, i) => ({
      x: positions[i].x,
      y: positions[i].y,
      num: i + 1,
      tapped: false,
    }));

    context.input.onTap((e) => {
      if (this.done) return;
      for (const s of this.slots) {
        if (s.tapped) continue;
        if (Math.hypot(e.x - s.x, e.y - s.y) <= NUM_RADIUS) {
          if (s.num === this.next) {
            s.tapped = true;
            this.next++;
            context.audio.playTap();
            if (this.next > this.total) {
              this.done = true;
              context.onSuccess();
            }
          } else {
            this.done = true;
            context.onFailure();
          }
          break;
        }
      }
    });
  }

  private genPositions(n: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const margin = NUM_RADIUS + 12;
    for (let i = 0; i < n; i++) {
      let placed = false;
      for (let a = 0; a < 100; a++) {
        const x = margin + Math.random() * (W - margin * 2);
        const y = 120 + Math.random() * (H - 220);
        const ok = positions.every((p) => Math.hypot(p.x - x, p.y - y) > NUM_RADIUS * 2.5);
        if (ok) { positions.push({ x, y }); placed = true; break; }
      }
      if (!placed) positions.push({ x: 80 + i * 100, y: H / 2 });
    }
    return positions;
  }

  update(_dt: number) {}

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, W, H);

    for (const s of this.slots) {
      const color = s.tapped ? NUM_DONE_COLOR : NUM_COLORS[(s.num - 1) % NUM_COLORS.length];

      ctx.beginPath();
      ctx.arc(s.x, s.y, NUM_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = s.tapped ? '#333' : '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = s.tapped ? '#666' : '#ffffff';
      ctx.font = `bold 30px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${s.num}`, s.x, s.y);
    }

    // 次にタップする番号を示す
    if (this.next <= this.total) {
      ctx.fillStyle = '#ffd700';
      ctx.font = `bold 16px 'Noto Sans JP', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`次: ${this.next}`, W / 2, H - 50);
    }
  }

  destroy() {}
}

export const orderSequence = new OrderSequenceGame();
