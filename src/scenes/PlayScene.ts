/** ゲーム本編（ミニゲーム連続プレイ） */

import type { Scene } from '../core/GameManager';
import type { GameManager } from '../core/GameManager';
import type { Minigame } from '../core/MinigameBase';
import { Renderer } from '../core/Renderer';
import { TransitionScene } from './TransitionScene';
import { LifeDisplay } from '../ui/LifeDisplay';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { InstructionBanner } from '../ui/InstructionBanner';

const W = Renderer.W;
const H = Renderer.H;
type State = 'transition' | 'playing' | 'success' | 'failure';

export class PlayScene implements Scene {
  private gm: GameManager;
  private state: State = 'transition';
  private mg: Minigame | null = null;
  private timeLeft = 0;
  private resultTimer = 0;
  private transition: TransitionScene | null = null;

  private lifeDisplay: LifeDisplay;
  private scoreDisplay: ScoreDisplay;
  private banner: InstructionBanner;

  constructor(gm: GameManager) {
    this.gm = gm;
    this.lifeDisplay = new LifeDisplay(gm.renderer);
    this.scoreDisplay = new ScoreDisplay(gm.renderer);
    this.banner = new InstructionBanner(gm.renderer);
  }

  init() {
    this.gm.audio.startBGM(1.0);
    this.nextMinigame();
  }

  private nextMinigame() {
    const mg = this.gm.registry.getNext(!this.gm.tiltEnabled);
    this.mg = mg;
    this.state = 'transition';
    this.transition = new TransitionScene(this.gm, mg.instruction, () => this.begin(), 1.0);
    this.transition.init();
  }

  private begin() {
    if (!this.mg) return;
    this.state = 'playing';
    this.transition = null;
    this.timeLeft = this.gm.getTimeLimit();
    this.gm.input.clearAll();
    this.mg.init({
      canvas: this.gm.renderer.canvas,
      ctx: this.gm.renderer.ctx,
      input: this.gm.input,
      audio: this.gm.audio,
      difficulty: this.gm.getDifficulty(),
      timeLimit: this.timeLeft,
      onSuccess: () => this.success(),
      onFailure: () => this.failure(),
    });
  }

  private success() {
    if (this.state !== 'playing') return;
    this.state = 'success';
    this.resultTimer = 0.6;
    this.gm.score++;
    this.gm.audio.playSuccess();
    this.gm.input.clearAll();
    this.gm.audio.startBGM(1.0 + this.gm.getDifficulty() * 0.5);
  }

  private failure() {
    if (this.state !== 'playing') return;
    this.state = 'failure';
    this.resultTimer = 0.6;
    this.gm.lives--;
    this.gm.audio.playFailure();
    this.gm.input.clearAll();
  }

  update(dt: number) {
    if (this.state === 'transition') {
      this.transition?.update(dt);
      return;
    }
    if (this.state === 'playing') {
      this.timeLeft -= dt;
      this.mg?.update(dt);
      if (this.timeLeft <= 0) this.failure();
      return;
    }
    // success / failure
    this.resultTimer -= dt;
    if (this.resultTimer <= 0) {
      this.mg?.destroy();
      this.mg = null;
      if (this.gm.lives <= 0) {
        this.gm.audio.stopBGM();
        this.gm.audio.playGameOver();
        this.gm.changeScene('gameover');
      } else {
        this.nextMinigame();
      }
    }
  }

  render() {
    if (this.state === 'transition') {
      this.transition?.render();
      this.renderHUD();
      return;
    }

    // playing / success / failure: ミニゲームを描画（freeze 表示のため）
    if (this.mg) {
      this.mg.render();
    } else {
      this.gm.renderer.clear('#1a1a2e');
    }

    if (this.state === 'success') this.renderResult(true);
    if (this.state === 'failure') this.renderResult(false);

    this.renderHUD();
  }

  private renderHUD() {
    this.lifeDisplay.render(this.gm.lives);
    this.scoreDisplay.render(this.gm.score);
    if (this.state === 'playing' && this.mg) {
      this.banner.render(this.mg.instruction);
      this.renderTimerBar();
    }
  }

  private renderTimerBar() {
    const r = this.gm.renderer;
    const limit = this.gm.getTimeLimit();
    const prog = Math.max(this.timeLeft / limit, 0);
    const barY = H - 18;
    r.roundRect(8, barY, W - 16, 10, 4, '#333355');
    const color = prog > 0.5 ? '#44cc44' : prog > 0.25 ? '#ffaa00' : '#ff4444';
    if (prog > 0) r.roundRect(8, barY, (W - 16) * prog, 10, 4, color);
  }

  private renderResult(ok: boolean) {
    const r = this.gm.renderer;
    r.ctx.fillStyle = ok ? 'rgba(0,180,0,0.55)' : 'rgba(180,0,0,0.55)';
    r.ctx.fillRect(0, 0, W, H);
    r.text(ok ? '成功！' : '失敗…', W / 2, H / 2, 54, '#ffffff');
  }

  destroy() {
    this.mg?.destroy();
    this.gm.input.clearAll();
    this.gm.audio.stopBGM();
  }
}
