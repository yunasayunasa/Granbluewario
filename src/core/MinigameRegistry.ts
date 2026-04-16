/** ミニゲームの登録・ランダム選出 */

import type { Minigame } from './MinigameBase';

export class MinigameRegistry {
  private list: Minigame[] = [];
  private lastId: string | null = null;

  /** ミニゲームを登録 */
  register(mg: Minigame) {
    this.list.push(mg);
  }

  /**
   * 直前と異なるミニゲームをランダム選出
   * @param excludeTilt - true の場合 tilt 入力を使うゲームを除外
   */
  getNext(excludeTilt = false): Minigame {
    let pool = excludeTilt ? this.list.filter((m) => !m.requiredInputs.includes('tilt')) : [...this.list];
    if (pool.length === 0) pool = [...this.list];

    const candidates = pool.filter((m) => m.id !== this.lastId);
    const chosen = (candidates.length > 0 ? candidates : pool)[Math.floor(Math.random() * (candidates.length > 0 ? candidates : pool).length)];
    this.lastId = chosen.id;
    return chosen;
  }

  /** 登録済み全ミニゲームを返す */
  getAll(): Minigame[] {
    return [...this.list];
  }
}
