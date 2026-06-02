# メイドインタルト

タルトマンをメインにした、スマホ縦持ち向けの「メイドインワリオ」ライクな二次創作ミニゲーム集です。公式画像・公式音声・公式BGM・公式ロゴは使用せず、Canvas上の仮ドット風描画とWeb Audio APIの生成音で構成しています。

## 起動方法

```bash
npm install
npm run dev
```

表示されたURLをスマホまたはPCブラウザで開いてください。スマホ縦持ちを主ターゲットにしています。

## ビルド方法

```bash
npm run build
```

ビルド成果物は `dist/` に出力されます。GitHub Pages、Cloudflare Pages、Netlifyなどの静的ホスティングでDiscord共有用URLを用意できます。


## GitHub Pagesで公開する方法

このプロジェクトはTypeScript/Vite製なので、GitHub Pagesの公開元をリポジトリの **root** にして保存するだけでは起動できません。`src/main.ts` はブラウザが直接実行するファイルではなく、先に `npm run build` で `dist/` に変換する必要があります。

推奨設定は以下です。

1. このリポジトリをGitHubにpushします。
2. GitHubの **Settings → Pages** を開きます。
3. **Build and deployment** の **Source** を **GitHub Actions** に変更します。
4. `main` または `master` にpushすると、`.github/workflows/pages.yml` が自動で `npm install` と `npm run build` を実行し、生成された `dist/` をPagesへ公開します。

すでにPagesのSourceを「Deploy from a branch / root」にしている場合は、**GitHub Actions** に変更してください。root公開のままだと、開発用のTypeScriptソースをそのまま配信してしまい、白画面や404の原因になります。

## 操作方法

- 基本操作: タップ
- 回避・方向入力: スワイプ
- ため操作: 長押しして、ちょうどよい範囲で指を離す
- 傾き操作: タイトル画面の「傾き操作を有効にする」を押してからスマホを傾ける
- PC確認用: 傾き操作は矢印キーでも代替できます

## ゲームモード

- **アーケード**: 3分間、ランダムに選ばれるミニゲームを連続プレイします。成功でスコアとコンボが増えます。
- **練習**: 任意のミニゲームを1つ選んで単体で遊べます。

## 実装済みミニゲーム

1. `roll_tartman` - ころがせ！
2. `tap_tartman` - タルトをつつけ！
3. `avoid_ougi` - よけろ！
4. `collect_potions` - ひろえ！
5. `charge_attack` - ためろ！
6. `swipe_order` - その方向！
7. `feed_tartman` - たべさせろ！
8. `break_crystal` - われ！
9. `find_tartman` - みつけろ！
10. `guild_war_dodge` - 古戦場から逃げろ！

## ミニゲーム追加方法

1. `src/minigames/index.ts` に `BaseMinigame` を継承したクラスを追加します。
2. `id`、`title`、`instruction`、`requiredInputs` を設定します。
3. `update()` と `render()` を実装します。
4. `createRegistry()` の `games` 配列にファクトリを追加します。

ミニゲームは `MinigameContext` 経由で入力、音声、描画、難易度、成功／失敗コールバックを利用します。

## 素材差し替え方法

現在は `Renderer.tartman()` などのCanvas描画で仮素材を表現しています。手製ドット絵に差し替える場合は、`public/assets/images/` に画像を置き、`src/core/Renderer.ts` または各ミニゲームの描画処理から読み込む形にしてください。

## 素材利用方針

このプロジェクトは身内向けのファンゲームです。グランブルーファンタジー公式の画像、音声、BGM、ロゴは使用しません。必要な素材は手製素材、仮素材、またはオリジナル素材を使ってください。
