/** ミニゲーム基底インターフェース定義 */

import type { InputManager } from './InputManager';
import type { AudioManager } from './AudioManager';
import type { InputType } from './types';

/** ミニゲームに渡されるコンテキスト */
export interface MinigameContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input: InputManager;
  audio: AudioManager;
  /** 0.0（最易）〜 1.0（最難） */
  difficulty: number;
  /** 制限時間（秒） */
  timeLimit: number;
  onSuccess: () => void;
  onFailure: () => void;
}

/** ミニゲームが実装すべきインターフェース */
export interface Minigame {
  /** 一意 ID */
  id: string;
  /** 画面に表示する指示文 */
  instruction: string;
  /** このゲームが使う入力種別 */
  requiredInputs: InputType[];
  /** 初期化（毎回呼ばれる・状態をリセットすること） */
  init(context: MinigameContext): void;
  /** 毎フレーム呼ばれる（秒単位の deltaTime） */
  update(deltaTime: number): void;
  /** 描画（Canvas 全体を責任をもって描画すること） */
  render(): void;
  /** クリーンアップ */
  destroy(): void;
}
