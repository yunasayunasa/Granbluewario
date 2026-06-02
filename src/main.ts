/** アプリケーションのエントリーポイント。 */
import './style.css';
import { GameManager } from './core/GameManager';
import { createRegistry } from './minigames';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app is missing.');

const canvas = document.createElement('canvas');
canvas.setAttribute('aria-label', 'メイドインタルト ゲーム画面');
app.append(canvas);

const manager = new GameManager(canvas, createRegistry());
manager.start();
