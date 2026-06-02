/** タイトル画面。 */
import { GameManager, Scene } from '../core/GameManager';
import { ButtonSpec, LOGICAL_WIDTH, pointInRect } from '../core/types';

export class TitleScene implements Scene {
  private readonly buttons: ButtonSpec[];
  private tiltMessage = '傾き操作: 未許可';

  public constructor(private readonly manager: GameManager) {
    this.buttons = [
      { x: 60, y: 285, width: 240, height: 58, label: 'アーケード', action: () => this.manager.showArcade() },
      { x: 60, y: 360, width: 240, height: 58, label: '練習', variant: 'secondary', action: () => this.manager.showPractice() },
      { x: 36, y: 438, width: 292, height: 52, label: '傾き操作を有効にする', variant: 'secondary', action: () => void this.enableTilt() },
      { x: 112, y: 512, width: 136, height: 48, label: 'ミュート', variant: 'secondary', action: () => this.manager.getAudio().toggleMute() },
    ];
  }

  public update(): void {
    const tap = this.manager.getInput().consumeTap();
    if (!tap) return;
    const button = this.buttons.find((candidate) => pointInRect(tap, candidate));
    if (button) {
      this.manager.getAudio().tap();
      button.action();
    }
  }

  public render(): void {
    const renderer = this.manager.getRenderer();
    renderer.clear();
    renderer.drawPixelBackdrop();
    renderer.tartman(LOGICAL_WIDTH / 2, 145, 48, 'タルトマン');
    renderer.text('メイドイン', LOGICAL_WIDTH / 2, 72, 28, '#fff0b0');
    renderer.text('タルト', LOGICAL_WIDTH / 2, 104, 42, '#ffd36d');
    renderer.text('8秒ミニゲームを3分間あそぶ！', LOGICAL_WIDTH / 2, 220, 16, '#fff7d6');
    this.buttons.forEach((button) => renderer.button(button));
    renderer.text(this.tiltMessage, LOGICAL_WIDTH / 2, 588, 13, '#d9c8e3', '600');
  }

  private async enableTilt(): Promise<void> {
    const ok = await this.manager.getInput().requestTiltPermission();
    this.tiltMessage = ok ? '傾き操作: 有効' : '傾き操作: 許可されませんでした';
  }
}
