/** 共通型と画面定数を定義する。 */
export const LOGICAL_WIDTH = 360;
export const LOGICAL_HEIGHT = 640;
export const ARCADE_SECONDS = 180;
export const MINIGAME_SECONDS = 8;

export type SceneName = 'title' | 'arcade' | 'practice' | 'result';
export type InputType = 'tap' | 'swipe' | 'long_press' | 'tilt';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
export type PlayMode = 'arcade' | 'practice';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface ButtonSpec extends Rect {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ArcadeStats {
  score: number;
  combo: number;
  maxCombo: number;
  successCount: number;
  failureCount: number;
}

export interface ResultStats extends ArcadeStats {
  mode: PlayMode;
}

/** 指定値を範囲内に丸める。 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 点と円の当たり判定を行う。 */
export function pointInCircle(point: Point, circle: Circle): boolean {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/** 点と矩形の当たり判定を行う。 */
export function pointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

/** 2点間距離を返す。 */
export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
