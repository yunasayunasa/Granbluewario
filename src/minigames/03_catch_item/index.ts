/** ミニゲーム: アイテムをキャッチ！ */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { ITEM_COLORS, ITEM_RADIUS, FALL_SPEED_BASE } from './assets';
import { ITEMS } from '../../data/flavor';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;

interface Item {
  x: number;
  y: number;
  vy: number;
  label: string;
  color: string;
  caught: boolean;
}

class CatchItemGame implements Minigame {
  readonly id = 'catch_item';
  readonly instruction = 'アイテムをキャッチ！';
  readonly requiredInputs: InputType[] = ['tap'];

  private mc!: MinigameContext;
  private items: Item[] = [];
  private caught = 0;
  private target = 0;
  private spawnTimer = 0;
  private spawnInterval = 0;
  private done = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.caught = 0;
    this.done = false;
    this.items = [];
    this.spawnTimer = 0;
    this.target = 3 + Math.floor(context.difficulty * 3);
    this.spawnInterval = 0.7 - context.difficulty * 0.25;

    context.input.onTap((e) => {
      if (this.done) return;
      for (const item of this.items) {
        if (!item.caught && Math.hypot(e.x - item.x, e.y - item.y) <= ITEM_RADIUS + 8) {
          item.caught = true;
          this.caught++;
          context.audio.playTap();
          if (this.caught >= this.target) {
            this.done = true;
            context.onSuccess();
          }
          break;
        }
      }
    });
  }

  update(dt: number) {
    if (this.done) return;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      const idx = Math.floor(Math.random() * ITEMS.length);
      this.items.push({
        x: ITEM_RADIUS + Math.random() * (W - ITEM_RADIUS * 2),
        y: -ITEM_RADIUS,
        vy: FALL_SPEED_BASE + this.mc.difficulty * 80,
        label: ITEMS[idx],
        color: ITEM_COLORS[Math.floor(Math.random() * ITEM_COLORS.length)],
        caught: false,
      });
    }

    for (const item of this.items) {
      if (!item.caught) item.y += item.vy * dt;
    }
    // 落下したアイテムを削除
    this.items = this.items.filter((i) => i.caught || i.y < H + ITEM_RADIUS);
  }

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    for (const item of this.items) {
      if (item.caught) continue;
      ctx.beginPath();
      ctx.arc(item.x, item.y, ITEM_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.font = `bold 10px 'Noto Sans JP', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label.slice(0, 4), item.x, item.y);
    }

    // カウント表示
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 20px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.caught} / ${this.target}`, W / 2, H - 45);
  }

  destroy() {}
}

export const catchItem = new CatchItemGame();
