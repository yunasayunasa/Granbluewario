/** 練習モードのミニゲーム選択画面。 */
import { GameManager, Scene } from '../core/GameManager';
import { ButtonSpec, LOGICAL_WIDTH, pointInRect } from '../core/types';

export class PracticeScene implements Scene {
  private readonly buttons: ButtonSpec[];

  public constructor(private readonly manager: GameManager) {
    const games = manager.getRegistry().list();
    this.buttons = games.map((game, index) => ({
      x: 28 + (index % 2) * 170,
      y: 112 + Math.floor(index / 2) * 72,
      width: 154,
      height: 56,
      label: game.instruction,
      variant: 'secondary' as const,
      action: () => this.manager.showPracticeGame(game.id),
    }));
    this.buttons.push({ x: 88, y: 552, width: 184, height: 50, label: 'タイトルへ', variant: 'danger', action: () => this.manager.showTitle() });
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
    renderer.text('練習モード', LOGICAL_WIDTH / 2, 58, 30, '#ffd36d');
    renderer.text('遊びたいミニゲームを選択', LOGICAL_WIDTH / 2, 86, 15, '#fff7d6');
    this.buttons.forEach((button) => renderer.button(button));
  }
}
