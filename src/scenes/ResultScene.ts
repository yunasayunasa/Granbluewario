/** スコア結果画面。 */
import { GameManager, Scene } from '../core/GameManager';
import { ButtonSpec, LOGICAL_WIDTH, pointInRect, ResultStats } from '../core/types';

export class ResultScene implements Scene {
  private readonly buttons: ButtonSpec[];

  public constructor(private readonly manager: GameManager, private readonly stats: ResultStats) {
    this.buttons = [
      { x: 62, y: 430, width: 236, height: 58, label: stats.mode === 'arcade' ? 'もう一度' : '練習一覧へ', action: () => (stats.mode === 'arcade' ? this.manager.showArcade() : this.manager.showPractice()) },
      { x: 62, y: 510, width: 236, height: 54, label: 'タイトルへ', variant: 'secondary', action: () => this.manager.showTitle() },
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
    renderer.text('リザルト', LOGICAL_WIDTH / 2, 82, 36, '#ffd36d');
    renderer.tartman(180, 155, 36, '');
    renderer.text(`${this.stats.score} 点`, LOGICAL_WIDTH / 2, 235, 40, '#fff0b0');
    renderer.text(`最大コンボ ${this.stats.maxCombo}`, LOGICAL_WIDTH / 2, 300, 22);
    renderer.text(`成功 ${this.stats.successCount} / 失敗 ${this.stats.failureCount}`, LOGICAL_WIDTH / 2, 338, 22);
    this.buttons.forEach((button) => renderer.button(button));
  }
}
