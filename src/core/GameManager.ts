/** 全体進行管理（シーン切り替え・ライフ・スコア・難易度） */

import { Renderer } from './Renderer';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { MinigameRegistry } from './MinigameRegistry';
import type { SceneType } from './types';

/** シーンが実装すべきインターフェース */
export interface Scene {
  init(): void;
  update(deltaTime: number): void;
  render(): void;
  destroy(): void;
}

export class GameManager {
  readonly renderer: Renderer;
  readonly input: InputManager;
  readonly audio: AudioManager;
  readonly registry: MinigameRegistry;

  score = 0;
  lives = 3;
  /** tilt 入力が許可されているか */
  tiltEnabled = false;

  private currentScene: Scene | null = null;
  private sceneFactory: ((type: SceneType) => Scene) | null = null;
  private lastTime = 0;
  private rafId = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);
    this.audio = new AudioManager();
    this.registry = new MinigameRegistry();
  }

  /** シーン生成ファクトリを設定 */
  setSceneFactory(factory: (type: SceneType) => Scene) {
    this.sceneFactory = factory;
  }

  /** シーン遷移 */
  changeScene(type: SceneType) {
    this.currentScene?.destroy();
    if (!this.sceneFactory) throw new Error('SceneFactory が未設定です');
    this.currentScene = this.sceneFactory(type);
    this.currentScene.init();
  }

  /** ゲームループを開始 */
  start() {
    this.input.setScale(this.renderer.getScale());
    this.input.onMuteArea(() => {
      this.audio.setMuted(!this.audio.isMuted());
    });
    window.addEventListener('resize', () => {
      this.input.setScale(this.renderer.getScale());
    });
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  private loop(now: number) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.currentScene?.update(dt);
    this.currentScene?.render();
    this.renderer.renderMuteButton(this.audio.isMuted());
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  /** スコア・ライフをリセット */
  resetGame() {
    this.score = 0;
    this.lives = 3;
  }

  /**
   * 現在スコアに対応する難易度パラメータ（0.0〜1.0）
   * スコア 0-9: 0.0、10-19: 0.1、20-29: 0.25、30-39: 0.5、40-49: 0.75、50+: 1.0
   */
  getDifficulty(): number {
    if (this.score < 10) return 0.0;
    if (this.score < 20) return 0.1;
    if (this.score < 30) return 0.25;
    if (this.score < 40) return 0.5;
    if (this.score < 50) return 0.75;
    return 1.0;
  }

  /**
   * 現在スコアに対応する制限時間（秒）
   * スコア 0-9: 5.0s → 50+: 2.5s
   */
  getTimeLimit(): number {
    if (this.score < 10) return 5.0;
    if (this.score < 20) return 4.5;
    if (this.score < 30) return 4.0;
    if (this.score < 40) return 3.5;
    if (this.score < 50) return 3.0;
    return 2.5;
  }

  /** iOS 向け DeviceOrientation 許可リクエスト */
  async requestTiltPermission(): Promise<boolean> {
    type DOE = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<string>;
    };
    const DOECast = DeviceOrientationEvent as DOE;
    if (typeof DOECast.requestPermission === 'function') {
      try {
        const result = await DOECast.requestPermission();
        if (result === 'granted') {
          this.tiltEnabled = true;
          this.input.enableTilt();
          return true;
        }
      } catch {
        return false;
      }
      return false;
    }
    // Android / デスクトップは許可不要
    this.tiltEnabled = true;
    this.input.enableTilt();
    return true;
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    this.currentScene?.destroy();
    this.input.destroy();
    this.audio.destroy();
  }
}
