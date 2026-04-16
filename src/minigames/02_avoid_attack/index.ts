/** ミニゲーム: こうげきを よけろ！ */

import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { PLAYER_COLOR, ATTACK_COLOR, PLAYER_RADIUS, ATTACK_W, ATTACK_H } from './assets';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W;
const H = Renderer.H;
const GAME_TOP = 95;
const GAME_BOT = H - 30;

interface Attack {
  x: number;
  y: number;
  vx: number;
  done: boolean;
}

class AvoidAttackGame implements Minigame {
  readonly id = 'avoid_attack';
  readonly instruction = 'こうげきを よけろ！';
  readonly requiredInputs: InputType[] = ['swipe'];

  private mc!: MinigameContext;
  private px = 0;
  private py = 0;
  private attacks: Attack[] = [];
  private totalAttacks = 0;
  private defeated = 0;
  private failed = false;

  init(context: MinigameContext) {
    this.mc = context;
    this.failed = false;
    this.defeated = 0;
    this.px = W / 2;
    this.py = (GAME_TOP + GAME_BOT) / 2;

    const count = 2 + Math.floor(context.difficulty * 2);
    this.totalAttacks = count;
    const speed = 180 + context.difficulty * 120;
    const gap = context.timeLimit / (count + 1);

    this.attacks = Array.from({ length: count }, (_) => {
      const fromLeft = Math.random() < 0.5;
      return {
        x: fromLeft ? -ATTACK_W : W + ATTACK_W,
        y: GAME_TOP + 40 + Math.random() * (GAME_BOT - GAME_TOP - 80),
        vx: fromLeft ? speed : -speed,
        // 発射タイミングをずらすため初期座標をオフセット
        done: false,
      };
    });
    // 攻撃を時間差でスポーン（x オフセットで代用）
    this.attacks.forEach((a, i) => {
      const delay = gap * (i + 1);
      a.x += a.vx > 0 ? -delay * speed : delay * speed;
    });

    context.input.onSwipe((e) => {
      const step = 130;
      if (e.direction === 'up') this.py = Math.max(GAME_TOP + PLAYER_RADIUS, this.py - step);
      if (e.direction === 'down') this.py = Math.min(GAME_BOT - PLAYER_RADIUS, this.py + step);
      if (e.direction === 'left') this.px = Math.max(PLAYER_RADIUS, this.px - step);
      if (e.direction === 'right') this.px = Math.min(W - PLAYER_RADIUS, this.px + step);
    });
  }

  update(dt: number) {
    if (this.failed) return;
    for (const a of this.attacks) {
      if (a.done) continue;
      a.x += a.vx * dt;

      // 画面外に出たら「避けた」とみなす
      if (a.vx > 0 && a.x > W + ATTACK_W) { a.done = true; this.defeated++; }
      if (a.vx < 0 && a.x < -ATTACK_W) { a.done = true; this.defeated++; }

      // 衝突判定
      const hit =
        Math.abs(a.x - this.px) < ATTACK_W / 2 + PLAYER_RADIUS &&
        Math.abs(a.y - this.py) < ATTACK_H / 2 + PLAYER_RADIUS;
      if (hit) {
        this.failed = true;
        this.mc.onFailure();
        return;
      }
    }

    if (this.defeated >= this.totalAttacks) {
      this.mc.onSuccess();
    }
  }

  render() {
    const { ctx } = this.mc;
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, W, H);

    // 攻撃
    for (const a of this.attacks) {
      if (a.done) continue;
      ctx.fillStyle = ATTACK_COLOR;
      ctx.fillRect(a.x - ATTACK_W / 2, a.y - ATTACK_H / 2, ATTACK_W, ATTACK_H);
      ctx.strokeStyle = '#ff8888';
      ctx.lineWidth = 2;
      ctx.strokeRect(a.x - ATTACK_W / 2, a.y - ATTACK_H / 2, ATTACK_W, ATTACK_H);
      // 矢印
      ctx.fillStyle = '#ffcccc';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(a.vx > 0 ? '→' : '←', a.x, a.y);
    }

    // プレイヤー（グラン）
    ctx.beginPath();
    ctx.arc(this.px, this.py, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fill();
    ctx.strokeStyle = '#88bbff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 13px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('グラン', this.px, this.py);

    // 避けた数
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this.defeated}/${this.totalAttacks}`, W - 12, GAME_TOP);
  }

  destroy() {}
}

export const avoidAttack = new AvoidAttackGame();
