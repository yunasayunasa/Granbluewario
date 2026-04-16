/** タップ / スワイプ / 長押し / 傾き の入力抽象化 */

import type { TapEvent, SwipeEvent, SwipeDirection } from './types';

type TapCb = (e: TapEvent) => void;
type SwipeCb = (e: SwipeEvent) => void;
type LongPressCb = () => void;
type TiltCb = (gamma: number, beta: number) => void;
type PointerCb = (x: number, y: number) => void;

const TAP_MAX_MS = 300;
const TAP_MAX_PX = 15;
const SWIPE_MIN_PX = 30;
const LONG_PRESS_MS = 500;
const MUTE_X = 308;
const MUTE_Y = 6;
const MUTE_W = 44;
const MUTE_H = 44;

export class InputManager {
  private canvas: HTMLCanvasElement;
  private scale = 1;

  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private longPressTimer: number | null = null;
  private isLongPressing = false;

  private tapCbs: TapCb[] = [];
  private swipeCbs: SwipeCb[] = [];
  private longPressStartCbs: LongPressCb[] = [];
  private longPressEndCbs: LongPressCb[] = [];
  private tiltCbs: TiltCb[] = [];
  private pointerDownCbs: PointerCb[] = [];
  private pointerUpCbs: PointerCb[] = [];

  private tiltEnabled = false;
  private orientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;
  private muteCallback: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.attach();
  }

  /** CSS transform スケールを更新 */
  setScale(s: number) {
    this.scale = s;
  }

  /** ミュートボタンタップ時のコールバックを登録（最優先で処理） */
  onMuteArea(cb: () => void) {
    this.muteCallback = cb;
  }

  private canvasPos(cx: number, cy: number) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (cx - r.left) / this.scale, y: (cy - r.top) / this.scale };
  }

  private attach() {
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    this.startPointer(t.clientX, t.clientY);
  };

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    this.endPointer(t.clientX, t.clientY);
  };

  private onMouseDown = (e: MouseEvent) => {
    this.startPointer(e.clientX, e.clientY);
  };

  private onMouseUp = (e: MouseEvent) => {
    this.endPointer(e.clientX, e.clientY);
  };

  private startPointer(cx: number, cy: number) {
    const { x, y } = this.canvasPos(cx, cy);
    this.startX = x;
    this.startY = y;
    this.startTime = performance.now();
    this.isLongPressing = false;

    this.pointerDownCbs.forEach((cb) => cb(x, y));

    this.longPressTimer = window.setTimeout(() => {
      this.isLongPressing = true;
      this.longPressStartCbs.forEach((cb) => cb());
    }, LONG_PRESS_MS);
  }

  private endPointer(cx: number, cy: number) {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const { x, y } = this.canvasPos(cx, cy);
    this.pointerUpCbs.forEach((cb) => cb(x, y));

    if (this.isLongPressing) {
      this.isLongPressing = false;
      this.longPressEndCbs.forEach((cb) => cb());
      return;
    }

    const dx = x - this.startX;
    const dy = y - this.startY;
    const dist = Math.hypot(dx, dy);
    const dur = performance.now() - this.startTime;

    // ミュートボタン領域チェック（最優先）
    if (x >= MUTE_X && x <= MUTE_X + MUTE_W && y >= MUTE_Y && y <= MUTE_Y + MUTE_H) {
      this.muteCallback?.();
      return;
    }

    if (dist < TAP_MAX_PX && dur < TAP_MAX_MS) {
      this.tapCbs.forEach((cb) => cb({ x, y }));
    } else if (dist >= SWIPE_MIN_PX) {
      const direction = this.calcDir(dx, dy);
      this.swipeCbs.forEach((cb) =>
        cb({ direction, startX: this.startX, startY: this.startY, endX: x, endY: y })
      );
    }
  }

  private calcDir(dx: number, dy: number): SwipeDirection {
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  /** @returns 登録解除関数 */
  onTap(cb: TapCb) {
    this.tapCbs.push(cb);
    return () => { this.tapCbs = this.tapCbs.filter((c) => c !== cb); };
  }

  /** @returns 登録解除関数 */
  onSwipe(cb: SwipeCb) {
    this.swipeCbs.push(cb);
    return () => { this.swipeCbs = this.swipeCbs.filter((c) => c !== cb); };
  }

  /** @returns 登録解除関数 */
  onLongPressStart(cb: LongPressCb) {
    this.longPressStartCbs.push(cb);
    return () => { this.longPressStartCbs = this.longPressStartCbs.filter((c) => c !== cb); };
  }

  /** @returns 登録解除関数 */
  onLongPressEnd(cb: LongPressCb) {
    this.longPressEndCbs.push(cb);
    return () => { this.longPressEndCbs = this.longPressEndCbs.filter((c) => c !== cb); };
  }

  /** @returns 登録解除関数 */
  onPointerDown(cb: PointerCb) {
    this.pointerDownCbs.push(cb);
    return () => { this.pointerDownCbs = this.pointerDownCbs.filter((c) => c !== cb); };
  }

  /** @returns 登録解除関数 */
  onPointerUp(cb: PointerCb) {
    this.pointerUpCbs.push(cb);
    return () => { this.pointerUpCbs = this.pointerUpCbs.filter((c) => c !== cb); };
  }

  /** @returns 登録解除関数 */
  onTilt(cb: TiltCb) {
    this.tiltCbs.push(cb);
    return () => { this.tiltCbs = this.tiltCbs.filter((c) => c !== cb); };
  }

  /** DeviceOrientation を有効化 */
  enableTilt() {
    if (this.tiltEnabled) return;
    this.tiltEnabled = true;
    this.orientationHandler = (e: DeviceOrientationEvent) => {
      this.tiltCbs.forEach((cb) => cb(e.gamma ?? 0, e.beta ?? 0));
    };
    window.addEventListener('deviceorientation', this.orientationHandler);
  }

  /** 全コールバックをクリア（ミュートボタンとポインタ系は除く） */
  clearAll() {
    this.tapCbs = [];
    this.swipeCbs = [];
    this.longPressStartCbs = [];
    this.longPressEndCbs = [];
    this.tiltCbs = [];
    this.pointerDownCbs = [];
    this.pointerUpCbs = [];
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  destroy() {
    this.clearAll();
    if (this.orientationHandler) {
      window.removeEventListener('deviceorientation', this.orientationHandler);
    }
  }
}
