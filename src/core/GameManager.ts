/** シーン遷移とメインループを管理する。 */
import { AudioManager } from './AudioManager';
import { InputManager } from './InputManager';
import { MinigameRegistry } from './MinigameRegistry';
import { Renderer } from './Renderer';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, ResultStats } from './types';
import { ArcadeScene } from '../scenes/ArcadeScene';
import { PracticeScene } from '../scenes/PracticeScene';
import { ResultScene } from '../scenes/ResultScene';
import { TitleScene } from '../scenes/TitleScene';

export interface Scene {
  update(deltaTime: number): void;
  render(): void;
  destroy?(): void;
}

export class GameManager {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly renderer: Renderer;
  private readonly input: InputManager;
  private readonly audio = new AudioManager();
  private scene!: Scene;
  private lastTime = performance.now();

  public constructor(private readonly canvas: HTMLCanvasElement, private readonly registry: MinigameRegistry) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('CanvasRenderingContext2D is unavailable.');
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);
    this.input = new InputManager(canvas);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.showTitle();
  }

  /** メインループを開始する。 */
  public start(): void {
    requestAnimationFrame((time) => this.loop(time));
  }

  /** タイトル画面へ遷移する。 */
  public showTitle(): void {
    this.setScene(new TitleScene(this));
  }

  /** アーケードモードへ遷移する。 */
  public showArcade(): void {
    this.setScene(new ArcadeScene(this, 'arcade'));
  }

  /** 練習モード一覧へ遷移する。 */
  public showPractice(): void {
    this.setScene(new PracticeScene(this));
  }

  /** 練習用の単体プレイを開始する。 */
  public showPracticeGame(gameId: string): void {
    this.setScene(new ArcadeScene(this, 'practice', gameId));
  }

  /** リザルト画面へ遷移する。 */
  public showResult(stats: ResultStats): void {
    this.setScene(new ResultScene(this, stats));
  }

  /** 共有レンダラーを返す。 */
  public getRenderer(): Renderer {
    return this.renderer;
  }

  /** 入力管理を返す。 */
  public getInput(): InputManager {
    return this.input;
  }

  /** 音声管理を返す。 */
  public getAudio(): AudioManager {
    return this.audio;
  }

  /** ミニゲーム登録管理を返す。 */
  public getRegistry(): MinigameRegistry {
    return this.registry;
  }

  /** Canvas描画コンテキストを返す。 */
  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  private setScene(scene: Scene): void {
    this.scene?.destroy?.();
    this.input.flush();
    this.scene = scene;
  }

  private loop(time: number): void {
    const deltaTime = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;
    this.input.update(deltaTime);
    this.scene.update(deltaTime);
    this.scene.render();
    requestAnimationFrame((next) => this.loop(next));
  }

  private resize(): void {
    const scale = Math.min(window.innerWidth / LOGICAL_WIDTH, window.innerHeight / LOGICAL_HEIGHT);
    this.canvas.width = LOGICAL_WIDTH;
    this.canvas.height = LOGICAL_HEIGHT;
    this.canvas.style.width = `${LOGICAL_WIDTH * scale}px`;
    this.canvas.style.height = `${LOGICAL_HEIGHT * scale}px`;
    this.input?.updateRect();
  }
}
