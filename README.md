# グラブルワリオ

グランブルーファンタジーの世界観をフレーバーとして使った、**メイドインワリオ風ミニゲーム連続プレイゲーム**のファンゲームです。

## 起動手順

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

### ビルド（静的ホスティング向け）

```bash
npm run build
# dist/ に静的ファイルが出力されます
```

---

## ゲームの遊び方

- **ライフ 3** でエンドレス挑戦
- 短い（2.5〜5 秒）ミニゲームが次々に出題される
- クリアでスコア +1、失敗/時間切れでライフ -1
- ライフ 0 でゲームオーバー
- スコアが上がるほどミニゲームの制限時間が短縮される

### 操作

| 操作 | 説明 |
|------|------|
| タップ | 画面を素早くタッチ / マウスクリック |
| スワイプ | 指を30px以上動かして離す |
| 長押し | 500ms以上押し続ける |
| 傾き | タイトル画面で「高度な操作を有効にする」を押して許可（iOS） |

---

## ミニゲーム一覧

| # | ID | 指示文 | 操作 |
|---|-----|--------|------|
| 1 | `tap_luria` | ルリアをタップ！ | tap |
| 2 | `avoid_attack` | こうげきを よけろ！ | swipe |
| 3 | `catch_item` | アイテムをキャッチ！ | tap |
| 4 | `feed_vyrn` | ビィに エサをやれ！ | tap |
| 5 | `choose_element` | ひゃくれつけん！ | tap（連打） |
| 6 | `swipe_direction` | スワイプせよ！ | swipe |
| 7 | `hold_charge` | ためろ！ | 長押し |
| 8 | `tilt_balance` | バランスを取れ！ | 傾き |
| 9 | `find_target` | ○○を さがせ！ | tap |
| 10 | `order_sequence` | じゅんばんに タップ！ | tap |

---

## ミニゲームの追加方法

### 1. フォルダを作成

```
src/minigames/11_your_game/
├── assets.ts   # 色・サイズなどの定数
└── index.ts    # ゲームロジック
```

### 2. `Minigame` インターフェースを実装

```typescript
// src/minigames/11_your_game/index.ts
import type { Minigame, MinigameContext } from '../../core/MinigameBase';
import type { InputType } from '../../core/types';
import { Renderer } from '../../core/Renderer';

const W = Renderer.W; // 360
const H = Renderer.H; // 640

class YourGame implements Minigame {
  readonly id = 'your_game';
  readonly instruction = '○○せよ！';
  readonly requiredInputs: InputType[] = ['tap'];

  private mc!: MinigameContext;

  init(context: MinigameContext) {
    this.mc = context;
    // 状態を完全リセット・入力リスナー登録
    context.input.onTap((e) => {
      // クリア条件
      context.onSuccess();
      // 失敗条件
      context.onFailure();
    });
  }

  update(_dt: number) { /* 毎フレーム処理 */ }

  render() {
    const { ctx } = this.mc;
    // Canvas 全体を描画（背景クリアも含む）
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);
  }

  destroy() { /* クリーンアップ */ }
}

export const yourGame = new YourGame();
```

### 3. レジストリに登録

`src/minigames/index.ts` に追加：

```typescript
import { yourGame } from './11_your_game/index';

export function registerAllMinigames(registry: MinigameRegistry) {
  // ... 既存 ...
  registry.register(yourGame);
}
```

---

## 画像の差し替え方法

現在はすべてのキャラクター・アイテムが幾何図形（円・矩形）で表現されています。

実際の画像に差し替えるには：

1. `public/assets/images/characters/luria.png` のように画像を配置
2. 各ミニゲームの `render()` 内で `ctx.drawImage(img, x, y, w, h)` を使用
3. ロード失敗時のフォールバックとして現在の幾何図形描画を残す

```typescript
const img = new Image();
img.src = '/assets/images/characters/luria.png';
img.onload = () => { this.luriImg = img; };

// render() 内
if (this.luriaImg) {
  ctx.drawImage(this.luriaImg, x - r, y - r, r * 2, r * 2);
} else {
  // フォールバック：幾何図形
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#44aaff';
  ctx.fill();
}
```

---

## 技術スタック

- **TypeScript** (strict mode)
- **Vite** (ビルド・開発サーバー)
- **HTML Canvas API** (描画)
- **Web Audio API** (効果音・BGM をプログラム生成)
- 外部ゲームエンジン・UIフレームワーク不使用

## ライセンス・注意事項

- グランブルーファンタジーの公式画像・音楽・ロゴは**一切使用していません**
- キャラクター名はフレーバーとして使用しているファンゲームです
- 商用利用不可
