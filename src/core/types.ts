/** 共通型定義 */

export type InputType = 'tap' | 'swipe' | 'long_press' | 'tilt';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface TapEvent {
  x: number;
  y: number;
}

export interface SwipeEvent {
  direction: SwipeDirection;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export type SceneType = 'title' | 'play' | 'gameover';
