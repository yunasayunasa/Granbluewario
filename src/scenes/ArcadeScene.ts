/** アーケード本編と練習単体プレイを担当する。 */
import { GameManager, Scene } from '../core/GameManager';
import { Minigame, MinigameContext } from '../core/MinigameBase';
import { ARCADE_SECONDS, ArcadeStats, LOGICAL_WIDTH, MINIGAME_SECONDS, PlayMode, ResultStats } from '../core/types';

export class ArcadeScene implements Scene {
  private readonly stats: ArcadeStats = { score: 0, combo: 0, maxCombo: 0, successCount: 0, failureCount: 0 };
  private phase: 'intro' | 'play' | 'result' = 'intro';
  private phaseTime = 0;
  private totalTime = 0;
  private current: Minigame | null = null;
  private message = '';
  private readonly playSeconds: number;

  public constructor(private readonly manager: GameManager, private readonly mode: PlayMode, private readonly fixedGameId?: string) {
    this.playSeconds = mode === 'arcade' ? ARCADE_SECONDS : MINIGAME_SECONDS;
    this.manager.getAudio().startBgm(1);
    this.startNextGame();
  }

  public update(deltaTime: number): void {
    this.totalTime += deltaTime;
    this.phaseTime += deltaTime;
    this.manager.getAudio().setTempo(1 + this.difficulty() * 0.55);
    if (this.mode === 'arcade' && this.totalTime >= ARCADE_SECONDS) {
      this.finish();
      return;
    }
    if (this.phase === 'intro' && this.phaseTime >= 0.8) {
      this.phase = 'play';
      this.phaseTime = 0;
      this.initCurrent();
    } else if (this.phase === 'play') {
      this.current?.update(deltaTime);
    } else if (this.phase === 'result' && this.phaseTime >= 0.55) {
      if (this.mode === 'practice') this.finish();
      else this.startNextGame();
    }
  }

  public render(): void {
    const renderer = this.manager.getRenderer();
    if (this.phase === 'play') this.current?.render();
    else {
      renderer.clear();
      renderer.drawPixelBackdrop();
      renderer.tartman(180, 240, 46, '');
      renderer.text(this.message, LOGICAL_WIDTH / 2, 340, 42, this.message.includes('成功') ? '#a7ffab' : '#ffd36d');
    }
    this.drawHud();
  }

  public destroy(): void {
    this.current?.destroy();
    this.manager.getAudio().stopBgm();
  }

  private startNextGame(): void {
    this.current?.destroy();
    this.current = this.fixedGameId ? this.manager.getRegistry().createById(this.fixedGameId) : this.manager.getRegistry().createRandom();
    if (!this.current) {
      this.manager.showPractice();
      return;
    }
    this.phase = 'intro';
    this.phaseTime = 0;
    this.message = this.current.instruction;
    this.manager.getInput().flush();
    this.manager.getAudio().cutIn();
  }

  private initCurrent(): void {
    if (!this.current) return;
    const context: MinigameContext = {
      ctx: this.manager.getContext(),
      input: this.manager.getInput(),
      audio: this.manager.getAudio(),
      renderer: this.manager.getRenderer(),
      difficulty: this.difficulty(),
      timeLimit: Math.max(5.5, MINIGAME_SECONDS - this.difficulty() * 1.4),
      onSuccess: () => this.handleSuccess(),
      onFailure: () => this.handleFailure(),
    };
    this.current.init(context);
  }

  private handleSuccess(): void {
    this.stats.successCount += 1;
    this.stats.combo += 1;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
    this.stats.score += 100 + this.stats.combo * 10;
    this.phase = 'result';
    this.phaseTime = 0;
    this.message = '成功！';
    this.manager.getAudio().success();
  }

  private handleFailure(): void {
    this.stats.failureCount += 1;
    this.stats.combo = 0;
    this.phase = 'result';
    this.phaseTime = 0;
    this.message = '失敗…';
    this.manager.getAudio().failure();
  }

  private finish(): void {
    const result: ResultStats = { ...this.stats, mode: this.mode };
    this.manager.getAudio().result();
    this.manager.showResult(result);
  }

  private difficulty(): number {
    if (this.mode === 'practice') return 0.35;
    return Math.min(1, this.totalTime / ARCADE_SECONDS);
  }

  private drawHud(): void {
    const renderer = this.manager.getRenderer();
    const remaining = Math.max(0, this.playSeconds - (this.mode === 'arcade' ? this.totalTime : Math.min(this.totalTime, this.playSeconds)));
    renderer.leftText(`SCORE ${this.stats.score}`, 18, 24, 16, '#fff7d6');
    renderer.text(`COMBO ${this.stats.combo}`, 180, 24, 15, '#fff7d6');
    renderer.text(`${Math.ceil(remaining)}s`, 322, 24, 16, '#fff7d6');
  }
}
