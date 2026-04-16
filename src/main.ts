/** エントリポイント */

import { GameManager } from './core/GameManager';
import type { SceneType } from './core/types';
import { TitleScene } from './scenes/TitleScene';
import { PlayScene } from './scenes/PlayScene';
import { GameOverScene } from './scenes/GameOverScene';
import { registerAllMinigames } from './minigames/index';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (!canvas) throw new Error('#game-canvas が見つかりません');

const gm = new GameManager(canvas);

gm.setSceneFactory((type: SceneType) => {
  switch (type) {
    case 'title': return new TitleScene(gm);
    case 'play': return new PlayScene(gm);
    case 'gameover': return new GameOverScene(gm);
  }
});

registerAllMinigames(gm.registry);

gm.start();
gm.changeScene('title');
