/** 10個の初期ミニゲームを登録する。 */
import { BaseMinigame, Minigame } from '../core/MinigameBase';
import { MinigameRegistry } from '../core/MinigameRegistry';
import { Circle, distance, LOGICAL_WIDTH, InputType, pointInCircle, SwipeDirection } from '../core/types';

abstract class TimedMinigame extends BaseMinigame {
  protected elapsed = 0;

  public override init(context: Parameters<BaseMinigame['init']>[0]): void {
    this.elapsed = 0;
    super.init(context);
  }

  protected tick(deltaTime: number): void {
    this.elapsed += deltaTime;
    if (this.elapsed >= this.context.timeLimit) this.failure();
  }

  protected remainingRatio(): number {
    return Math.max(0, 1 - this.elapsed / this.context.timeLimit);
  }

  protected drawHeader(hint: string): void {
    this.context.renderer.gauge(24, 570, 312, 18, this.remainingRatio(), '#7fe28a');
    this.context.renderer.text(hint, LOGICAL_WIDTH / 2, 528, 18, '#fff7d6');
  }
}

class RollTartman extends TimedMinigame {
  public id = 'roll_tartman';
  public title = 'ころがせ！';
  public instruction = 'ころがせ！';
  public requiredInputs: InputType[] = ['tilt'];
  private ball = { x: 74, y: 145, vx: 0, vy: 0, radius: 20 };
  private hole: Circle = { x: 286, y: 460, radius: 24 };

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const tilt = this.context.input.getTilt();
    const power = 540 + this.context.difficulty * 220;
    this.ball.vx += tilt.x * power * deltaTime;
    this.ball.vy += tilt.y * power * deltaTime;
    this.ball.vx *= 0.985;
    this.ball.vy *= 0.985;
    this.ball.x += this.ball.vx * deltaTime;
    this.ball.y += this.ball.vy * deltaTime;
    this.ball.x = Math.max(this.ball.radius, Math.min(LOGICAL_WIDTH - this.ball.radius, this.ball.x));
    this.ball.y = Math.max(95, Math.min(535, this.ball.y));
    if (distance(this.ball, this.hole) < this.hole.radius) this.success();
  }

  public render(): void {
    this.context.renderer.clear();
    this.context.renderer.drawPixelBackdrop();
    this.context.renderer.circle(this.hole, '#111111', '#5f4635', 5);
    this.context.renderer.text('穴', this.hole.x, this.hole.y, 14, '#777');
    this.context.renderer.tartman(this.ball.x, this.ball.y, this.ball.radius, '');
    this.drawHeader('スマホを傾けて穴へ！ PCは矢印キー');
  }
}

class TapTartman extends TimedMinigame {
  public id = 'tap_tartman';
  public title = 'タルトをつつけ！';
  public instruction = 'タルトをつつけ！';
  public requiredInputs: InputType[] = ['tap'];
  private target: Circle = { x: 180, y: 300, radius: 28 };
  private hits = 0;
  private needed = 3;

  protected override onInit(): void {
    this.needed = 3 + Math.floor(this.context.difficulty * 2);
  }

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const tap = this.context.input.consumeTap();
    if (tap && pointInCircle(tap, this.target)) {
      this.hits += 1;
      this.context.audio.tap();
      this.target.x = 52 + Math.random() * 256;
      this.target.y = 130 + Math.random() * 350;
      if (this.hits >= this.needed) this.success();
    }
  }

  public render(): void {
    this.context.renderer.clear();
    this.context.renderer.tartman(this.target.x, this.target.y, this.target.radius, '');
    this.drawHeader(`${this.hits}/${this.needed} タップ`);
  }
}

class AvoidOugi extends TimedMinigame {
  public id = 'avoid_ougi';
  public title = '奥義をよけろ！';
  public instruction = 'よけろ！';
  public requiredInputs: InputType[] = ['swipe'];
  private lane = 1;
  private attacks = [0.8, 1.8, 3.0, 4.3, 5.7];
  private attackY = -80;

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const swipe = this.context.input.consumeSwipe();
    if (swipe === 'left') this.lane = Math.max(0, this.lane - 1);
    if (swipe === 'right') this.lane = Math.min(2, this.lane + 1);
    const current = this.attacks.find((time) => this.elapsed >= time && this.elapsed <= time + 0.55);
    this.attackY = current ? (this.elapsed - current) * 840 : -80;
    if (current && this.attackY > 370 && this.attackY < 460 && this.lane === 1) this.failure();
    if (this.elapsed > 6.4) this.success();
  }

  public render(): void {
    this.context.renderer.clear();
    [80, 180, 280].forEach((x, index) => this.context.renderer.roundedRect({ x: x - 36, y: 120, width: 72, height: 390 }, index === 1 ? '#3d2945' : '#2d2033', '#60466a', 2));
    this.context.renderer.tartman(80 + this.lane * 100, 430, 24, '');
    if (this.attackY > -70) this.context.renderer.circle({ x: 180, y: 120 + this.attackY, radius: 28 }, '#e44b60', '#ffd06a', 4);
    this.drawHeader('左右スワイプで中央の奥義を回避');
  }
}

class CollectPotions extends TimedMinigame {
  public id = 'collect_potions';
  public title = 'ポーション拾い';
  public instruction = 'ひろえ！';
  public requiredInputs: InputType[] = ['tap'];
  private potions: Circle[] = [];
  private collected = 0;
  private needed = 4;

  protected override onInit(): void {
    this.needed = 4 + Math.floor(this.context.difficulty * 2);
    this.potions = Array.from({ length: this.needed + 2 }, (_, index) => ({ x: 40 + Math.random() * 280, y: 110 - index * 68, radius: 17 }));
  }

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const speed = 82 + this.context.difficulty * 80;
    this.potions.forEach((potion) => (potion.y += speed * deltaTime));
    const tap = this.context.input.consumeTap();
    if (tap) {
      const potion = this.potions.find((candidate) => pointInCircle(tap, candidate));
      if (potion) {
        potion.y = 800;
        this.collected += 1;
        if (this.collected >= this.needed) this.success();
      }
    }
  }

  public render(): void {
    this.context.renderer.clear();
    this.potions.forEach((potion) => this.context.renderer.circle(potion, '#6ed6ff', '#ffffff', 3));
    this.drawHeader(`ポーション ${this.collected}/${this.needed}`);
  }
}

class ChargeAttack extends TimedMinigame {
  public id = 'charge_attack';
  public title = 'ためろ！';
  public instruction = 'ためろ！';
  public requiredInputs: InputType[] = ['long_press'];
  private released = false;
  private started = false;
  private lastCharge = 0;

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    if (this.context.input.isPressing()) {
      this.started = true;
      this.lastCharge = this.context.input.getLongPressTime();
    } else if (this.started && !this.released) {
      this.released = true;
      const ratio = Math.min(1, this.lastCharge / 3.2);
      if (ratio > 0.55 && ratio < 0.78) this.success();
      else this.failure();
    }
  }

  public render(): void {
    this.context.renderer.clear();
    const ratio = Math.min(1, this.context.input.getLongPressTime() / 3.2);
    this.context.renderer.roundedRect({ x: 55, y: 250, width: 250, height: 50 }, '#1d1424', '#fff0b0', 3);
    this.context.renderer.roundedRect({ x: 55 + 250 * 0.55, y: 250, width: 250 * 0.23, height: 50 }, '#2c7d3d', '#b9ffba', 2);
    this.context.renderer.gauge(58, 253, 244, 44, ratio, '#ffcf5f');
    this.drawHeader('緑の範囲で指を離す');
  }
}

class SwipeOrder extends TimedMinigame {
  public id = 'swipe_order';
  public title = 'その方向！';
  public instruction = 'その方向！';
  public requiredInputs: InputType[] = ['swipe'];
  private dirs: SwipeDirection[] = ['up', 'down', 'left', 'right'];
  private target: SwipeDirection = 'up';
  private labels: Record<SwipeDirection, string> = { up: '↑', down: '↓', left: '←', right: '→' };

  protected override onInit(): void {
    this.target = this.dirs[Math.floor(Math.random() * this.dirs.length)];
  }

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const swipe = this.context.input.consumeSwipe();
    if (swipe) swipe === this.target ? this.success() : this.failure();
  }

  public render(): void {
    this.context.renderer.clear();
    this.context.renderer.text(this.labels[this.target], 180, 285, 120, '#fff0a8');
    this.drawHeader('表示された方向へスワイプ');
  }
}

class FeedTartman extends TimedMinigame {
  public id = 'feed_tartman';
  public title = 'たべさせろ！';
  public instruction = 'たべさせろ！';
  public requiredInputs: InputType[] = ['tap'];
  private fed = 0;
  private needed = 5;

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const tap = this.context.input.consumeTap();
    if (tap && tap.y > 360) {
      this.fed += 1;
      if (this.fed >= this.needed + Math.floor(this.context.difficulty * 2)) this.success();
    }
  }

  public render(): void {
    this.context.renderer.clear();
    this.context.renderer.tartman(180, 265, 54, 'タルトマン');
    this.context.renderer.circle({ x: 180, y: 430, radius: 36 }, '#c47b34', '#ffe39a', 5);
    this.context.renderer.text('TAP', 180, 430, 18, '#3b2315');
    this.drawHeader(`下のタルトを連打 ${this.fed}/${this.needed + Math.floor(this.context.difficulty * 2)}`);
  }
}

class BreakCrystal extends TimedMinigame {
  public id = 'break_crystal';
  public title = 'クリスタル割り';
  public instruction = 'われ！';
  public requiredInputs: InputType[] = ['tap'];
  private hp = 9;
  private maxHp = 9;

  protected override onInit(): void {
    this.maxHp = 9 + Math.floor(this.context.difficulty * 5);
    this.hp = this.maxHp;
  }

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const tap = this.context.input.consumeTap();
    if (tap && pointInCircle(tap, { x: 180, y: 300, radius: 85 })) {
      this.hp -= 1;
      if (this.hp <= 0) this.success();
    }
  }

  public render(): void {
    this.context.renderer.clear();
    this.context.renderer.circle({ x: 180, y: 300, radius: 82 }, '#68d8ff', '#ffffff', 6);
    this.context.renderer.text('星晶石', 180, 300, 24, '#1b4d6b');
    this.context.renderer.gauge(70, 420, 220, 24, this.hp / this.maxHp, '#ff6666');
    this.drawHeader('連打で壊す');
  }
}

class FindTartman extends TimedMinigame {
  public id = 'find_tartman';
  public title = 'タルトマン探し';
  public instruction = 'みつけろ！';
  public requiredInputs: InputType[] = ['tap'];
  private target = 0;
  private positions: Circle[] = [];

  protected override onInit(): void {
    this.target = Math.floor(Math.random() * 6);
    this.positions = Array.from({ length: 6 }, (_, index) => ({ x: 75 + (index % 3) * 90, y: 210 + Math.floor(index / 3) * 125, radius: 26 }));
  }

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const tap = this.context.input.consumeTap();
    if (tap) {
      const index = this.positions.findIndex((position) => pointInCircle(tap, position));
      if (index >= 0) index === this.target ? this.success() : this.failure();
    }
  }

  public render(): void {
    this.context.renderer.clear();
    this.positions.forEach((position, index) => {
      if (index === this.target) this.context.renderer.tartman(position.x, position.y, position.radius, '');
      else this.context.renderer.circle(position, '#8a6b9b', '#fff0b0', 4);
    });
    this.drawHeader('本物のタルトマンをタップ');
  }
}

class GuildWarDodge extends TimedMinigame {
  public id = 'guild_war_dodge';
  public title = '古戦場から逃げろ！';
  public instruction = '古戦場から逃げろ！';
  public requiredInputs: InputType[] = ['swipe'];
  private x = 180;
  private wallY = 120;

  public update(deltaTime: number): void {
    this.tick(deltaTime);
    const swipe = this.context.input.consumeSwipe();
    if (swipe === 'left') this.x -= 70;
    if (swipe === 'right') this.x += 70;
    this.x = Math.max(70, Math.min(290, this.x));
    this.wallY += (74 + this.context.difficulty * 90) * deltaTime;
    if (this.wallY > 420 && Math.abs(this.x - 180) < 55) this.failure();
    if (this.elapsed > 6.5) this.success();
  }

  public render(): void {
    this.context.renderer.clear();
    this.context.renderer.roundedRect({ x: 95, y: this.wallY, width: 170, height: 55 }, '#8d253b', '#ffd06a', 4);
    this.context.renderer.text('古戦場', 180, this.wallY + 28, 22);
    this.context.renderer.tartman(this.x, 455, 25, '');
    this.drawHeader('左右スワイプで逃げる');
  }
}

export function createRegistry(): MinigameRegistry {
  const registry = new MinigameRegistry();
  const games: Array<() => Minigame> = [
    () => new RollTartman(),
    () => new TapTartman(),
    () => new AvoidOugi(),
    () => new CollectPotions(),
    () => new ChargeAttack(),
    () => new SwipeOrder(),
    () => new FeedTartman(),
    () => new BreakCrystal(),
    () => new FindTartman(),
    () => new GuildWarDodge(),
  ];
  games.forEach((factory) => registry.register(factory));
  return registry;
}
