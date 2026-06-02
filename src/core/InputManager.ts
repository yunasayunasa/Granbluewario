/** タッチ・マウス・キーボード・傾き入力を抽象化する。 */
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, Point, SwipeDirection } from './types';

interface TapEvent {
  point: Point;
  consumed: boolean;
}

interface SwipeEvent {
  direction: SwipeDirection;
  consumed: boolean;
}

export class InputManager {
  private canvasRect = new DOMRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  private readonly taps: TapEvent[] = [];
  private readonly swipes: SwipeEvent[] = [];
  private touchStart: Point | null = null;
  private touchStartTime = 0;
  private pointerDown = false;
  private longPressing = false;
  private longPressTime = 0;
  private readonly keys = new Set<string>();
  private tiltX = 0;
  private tiltY = 0;
  private tiltEnabled = false;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('resize', () => this.updateRect());
    this.updateRect();
    canvas.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    canvas.addEventListener('pointerup', (event) => this.onPointerUp(event));
    canvas.addEventListener('pointercancel', () => this.resetPointer());
    canvas.addEventListener('pointerleave', () => this.resetPointer());
    window.addEventListener('keydown', (event) => this.keys.add(event.key));
    window.addEventListener('keyup', (event) => this.keys.delete(event.key));
    window.addEventListener('deviceorientation', (event) => this.onOrientation(event));
  }

  /** Canvasの表示位置を再計算する。 */
  public updateRect(): void {
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  /** iOSなどで傾き操作の許可を要求する。 */
  public async requestTiltPermission(): Promise<boolean> {
    const orientation = globalThis.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> })
      | undefined;
    if (typeof orientation?.requestPermission === 'function') {
      const result = await orientation.requestPermission();
      this.tiltEnabled = result === 'granted';
      return this.tiltEnabled;
    }
    this.tiltEnabled = true;
    return true;
  }

  /** 傾き入力が利用可能か返す。 */
  public canUseTilt(): boolean {
    return this.tiltEnabled;
  }

  /** 最新の傾きベクトルを返す。 */
  public getTilt(): Point {
    const keyboardX = (this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('ArrowLeft') ? 1 : 0);
    const keyboardY = (this.keys.has('ArrowDown') ? 1 : 0) - (this.keys.has('ArrowUp') ? 1 : 0);
    return {
      x: keyboardX !== 0 ? keyboardX : this.tiltX,
      y: keyboardY !== 0 ? keyboardY : this.tiltY,
    };
  }

  /** 未消費のタップを1つ取得する。 */
  public consumeTap(): Point | null {
    const event = this.taps.find((tap) => !tap.consumed);
    if (!event) return null;
    event.consumed = true;
    return event.point;
  }

  /** 指定方向の未消費スワイプがあれば消費する。 */
  public consumeSwipe(direction?: SwipeDirection): SwipeDirection | null {
    const event = this.swipes.find((swipe) => !swipe.consumed && (!direction || swipe.direction === direction));
    if (!event) return null;
    event.consumed = true;
    return event.direction;
  }

  /** 長押し継続秒数を返す。 */
  public getLongPressTime(): number {
    return this.longPressing ? this.longPressTime : 0;
  }

  /** ポインタが押下中か返す。 */
  public isPressing(): boolean {
    return this.pointerDown;
  }

  /** フレーム更新で一時入力を整理する。 */
  public update(deltaTime: number): void {
    if (this.longPressing) this.longPressTime += deltaTime;
    while (this.taps.length > 12) this.taps.shift();
    while (this.swipes.length > 12) this.swipes.shift();
  }

  /** シーン切り替え時に入力を破棄する。 */
  public flush(): void {
    this.taps.length = 0;
    this.swipes.length = 0;
    this.resetPointer();
  }

  private onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    this.updateRect();
    this.pointerDown = true;
    this.longPressing = true;
    this.longPressTime = 0;
    this.touchStart = this.toLogicalPoint(event.clientX, event.clientY);
    this.touchStartTime = performance.now();
  }

  private onPointerUp(event: PointerEvent): void {
    event.preventDefault();
    if (!this.touchStart) return;
    const end = this.toLogicalPoint(event.clientX, event.clientY);
    const dx = end.x - this.touchStart.x;
    const dy = end.y - this.touchStart.y;
    const moved = Math.hypot(dx, dy);
    const duration = performance.now() - this.touchStartTime;
    if (moved < 24 && duration < 360) {
      this.taps.push({ point: end, consumed: false });
    } else if (moved >= 30) {
      const direction: SwipeDirection = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      this.swipes.push({ direction, consumed: false });
    }
    this.resetPointer();
  }

  private resetPointer(): void {
    this.pointerDown = false;
    this.longPressing = false;
    this.longPressTime = 0;
    this.touchStart = null;
  }

  private toLogicalPoint(clientX: number, clientY: number): Point {
    const x = ((clientX - this.canvasRect.x) / this.canvasRect.width) * LOGICAL_WIDTH;
    const y = ((clientY - this.canvasRect.y) / this.canvasRect.height) * LOGICAL_HEIGHT;
    return { x, y };
  }

  private onOrientation(event: DeviceOrientationEvent): void {
    if (!this.tiltEnabled) return;
    this.tiltX = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 25));
    this.tiltY = Math.max(-1, Math.min(1, (event.beta ?? 0) / 25));
  }
}
