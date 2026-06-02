/** ミニゲーム登録とランダム選出を管理する。 */
import { Minigame, MinigameFactory } from './MinigameBase';

export interface MinigameEntry {
  id: string;
  title: string;
  instruction: string;
  factory: MinigameFactory;
}

export class MinigameRegistry {
  private readonly entries: MinigameEntry[] = [];
  private lastId: string | null = null;

  /** ミニゲームを登録する。 */
  public register(factory: MinigameFactory): void {
    const preview = factory();
    this.entries.push({ id: preview.id, title: preview.title, instruction: preview.instruction, factory });
  }

  /** 登録済み一覧を返す。 */
  public list(): MinigameEntry[] {
    return [...this.entries];
  }

  /** 指定IDのミニゲームを作成する。 */
  public createById(id: string): Minigame | null {
    const entry = this.entries.find((candidate) => candidate.id === id);
    return entry ? entry.factory() : null;
  }

  /** 直前と重複しないランダムなミニゲームを作成する。 */
  public createRandom(): Minigame {
    const candidates = this.entries.filter((entry) => entry.id !== this.lastId);
    const pool = candidates.length > 0 ? candidates : this.entries;
    const entry = pool[Math.floor(Math.random() * pool.length)];
    this.lastId = entry.id;
    return entry.factory();
  }
}
