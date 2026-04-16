/** Canvas 描画ユーティリティ・スケーリング管理 */

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  /** 論理解像度 幅 */
  static readonly W = 360;
  /** 論理解像度 高さ */
  static readonly H = 640;

  private currentScale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D コンテキストを取得できませんでした');
    this.ctx = ctx;
    canvas.width = Renderer.W;
    canvas.height = Renderer.H;
    this.fitToScreen();
    window.addEventListener('resize', () => this.fitToScreen());
  }

  /** 画面サイズに合わせて Canvas を内接スケール */
  fitToScreen(): number {
    const scale = Math.min(window.innerWidth / Renderer.W, window.innerHeight / Renderer.H);
    this.currentScale = scale;
    this.canvas.style.width = `${Renderer.W * scale}px`;
    this.canvas.style.height = `${Renderer.H * scale}px`;
    return scale;
  }

  /** 現在の CSS スケール値を返す */
  getScale() {
    return this.currentScale;
  }

  /** 背景をクリア */
  clear(color = '#1a1a2e') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, Renderer.W, Renderer.H);
  }

  /** 角丸矩形を描画 */
  roundRect(x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.stroke(); }
  }

  /** テキストを描画（textBaseline = 'middle'） */
  text(
    str: string,
    x: number,
    y: number,
    size: number,
    color: string,
    align: CanvasTextAlign = 'center'
  ) {
    const c = this.ctx;
    c.fillStyle = color;
    c.font = `bold ${size}px 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'BIZ UDGothic', sans-serif`;
    c.textAlign = align;
    c.textBaseline = 'middle';
    c.fillText(str, x, y);
  }

  /** ミュートボタンを描画（常時オーバーレイ） */
  renderMuteButton(muted: boolean) {
    this.roundRect(308, 6, 44, 44, 8, 'rgba(0,0,0,0.55)');
    this.text(muted ? '消音' : '音♪', 330, 28, 11, '#ffffff');
  }
}
