/** Canvas描画の共通ユーティリティ。 */
import { ButtonSpec, Circle, LOGICAL_HEIGHT, LOGICAL_WIDTH, Rect } from './types';

export class Renderer {
  public constructor(private readonly ctx: CanvasRenderingContext2D) {}

  /** 画面全体を背景グラデーションで塗る。 */
  public clear(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    gradient.addColorStop(0, '#301b38');
    gradient.addColorStop(0.45, '#59325f');
    gradient.addColorStop(1, '#211722');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  /** ドット風の矩形パターンを背景に重ねる。 */
  public drawPixelBackdrop(): void {
    this.ctx.save();
    this.ctx.globalAlpha = 0.13;
    for (let y = 0; y < LOGICAL_HEIGHT; y += 16) {
      for (let x = (y / 16) % 2 === 0 ? 0 : 8; x < LOGICAL_WIDTH; x += 16) {
        this.ctx.fillStyle = '#f7d78a';
        this.ctx.fillRect(x, y, 4, 4);
      }
    }
    this.ctx.restore();
  }

  /** 中央寄せテキストを描画する。 */
  public text(text: string, x: number, y: number, size: number, color = '#fff7d6', weight = '700'): void {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = `${weight} ${size}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  /** 左寄せテキストを描画する。 */
  public leftText(text: string, x: number, y: number, size: number, color = '#fff7d6', weight = '700'): void {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = `${weight} ${size}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  /** 角丸矩形を描画する。 */
  public roundedRect(rect: Rect, fill: string, stroke = '#fff7d6', lineWidth = 3): void {
    const radius = 14;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /** ボタンを描画する。 */
  public button(button: ButtonSpec): void {
    const fill = button.variant === 'secondary' ? '#6b4b7a' : button.variant === 'danger' ? '#8d3c4f' : '#d08339';
    this.roundedRect(button, fill, '#fff0b0', 3);
    this.text(button.label, button.x + button.width / 2, button.y + button.height / 2, 20);
  }

  /** タルトマンの仮ドット風キャラを描画する。 */
  public tartman(x: number, y: number, radius: number, label = 'タルト'): void {
    this.ctx.save();
    this.ctx.fillStyle = '#9d5b2c';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#f9d17b';
    this.ctx.lineWidth = Math.max(4, radius * 0.18);
    this.ctx.stroke();
    this.ctx.fillStyle = '#f5e0a5';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 0.68, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#3b2315';
    this.ctx.fillRect(x - radius * 0.35, y - radius * 0.16, radius * 0.16, radius * 0.16);
    this.ctx.fillRect(x + radius * 0.2, y - radius * 0.16, radius * 0.16, radius * 0.16);
    this.ctx.fillRect(x - radius * 0.12, y + radius * 0.22, radius * 0.26, radius * 0.08);
    this.ctx.font = `700 ${Math.max(10, radius * 0.32)}px system-ui, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x, y + radius * 1.4);
    this.ctx.restore();
  }

  /** 円を描画する。 */
  public circle(circle: Circle, fill: string, stroke = '#fff7d6', lineWidth = 3): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /** 進捗ゲージを描画する。 */
  public gauge(x: number, y: number, width: number, height: number, ratio: number, color = '#7fe28a'): void {
    this.roundedRect({ x, y, width, height }, '#2a1c31', '#fff0b0', 2);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.roundRect(x + 3, y + 3, Math.max(0, width - 6) * ratio, Math.max(0, height - 6), 8);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.restore();
  }
}
