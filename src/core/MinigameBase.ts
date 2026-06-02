/** ミニゲームが実装する共通インターフェース。 */
import { AudioManager } from './AudioManager';
import { InputManager } from './InputManager';
import { Renderer } from './Renderer';
import { InputType } from './types';

export interface MinigameContext {
  ctx: CanvasRenderingContext2D;
  input: InputManager;
  audio: AudioManager;
  renderer: Renderer;
  difficulty: number;
  timeLimit: number;
  onSuccess: () => void;
  onFailure: () => void;
}

export interface Minigame {
  id: string;
  title: string;
  instruction: string;
  requiredInputs: InputType[];
  init(context: MinigameContext): void;
  update(deltaTime: number): void;
  render(): void;
  destroy(): void;
}

export type MinigameFactory = () => Minigame;

export abstract class BaseMinigame implements Minigame {
  protected context!: MinigameContext;
  protected finished = false;

  public abstract id: string;
  public abstract title: string;
  public abstract instruction: string;
  public abstract requiredInputs: InputType[];

  /** ミニゲームを初期化する。 */
  public init(context: MinigameContext): void {
    this.context = context;
    this.finished = false;
    this.onInit();
  }

  /** 毎フレーム更新する。 */
  public abstract update(deltaTime: number): void;

  /** 毎フレーム描画する。 */
  public abstract render(): void;

  /** 破棄時に必要な処理を行う。 */
  public destroy(): void {
    this.finished = true;
  }

  protected onInit(): void {}

  protected success(): void {
    if (this.finished) return;
    this.finished = true;
    this.context.onSuccess();
  }

  protected failure(): void {
    if (this.finished) return;
    this.finished = true;
    this.context.onFailure();
  }
}
