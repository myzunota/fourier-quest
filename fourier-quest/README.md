# FOURIER QUEST 🌊

**波を操る知育パズルゲーム — フーリエ変換を体験で学ぶ**

> Phase 1 Build · Tutorial Stages

---

## 遊び方

**ブラウザで直接開いて遊べます（GitHub Pages対応）**

```
index.html  →  タイトル画面 / ステージ選択
game.html?stage=tutorial-1  →  チュートリアル1
game.html?stage=tutorial-2  →  チュートリアル2
```

### ローカルで開く場合

ES Modulesを使用しているため、ローカルファイルとして直接開くと動作しません。
簡単なHTTPサーバーを起動してください：

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

ブラウザで `http://localhost:8080` を開いてください。

### GitHub Pagesに公開する方法

1. このフォルダを GitHub リポジトリにプッシュ
2. Settings → Pages → Source: main branch / root
3. 公開URLにアクセス

---

## 操作方法

| 操作 | 機能 |
|------|------|
| スライダードラッグ | パラメータ調整 |
| `SUBMIT` | 答え合わせ（星評価） |
| `▶ PLAY` | 現在の波を音で聴く |
| `💡 HINT` | ヒント表示 |
| `Enter` キー | SUBMIT と同じ |
| `H` キー | ヒント表示/非表示 |

---

## ファイル構成

```
fourier-quest/
├── index.html          # タイトル画面
├── game.html           # ゲーム画面
├── css/
│   └── main.css        # 全スタイル（サイバー/ネオンテーマ）
└── js/
    ├── fourier.js      # フーリエ計算エンジン（外部依存なし）
    ├── renderer.js     # Canvas描画エンジン（ネオングロウ）
    ├── stages.js       # ステージデータ定義
    └── app.js          # メインゲームロジック
```

## ステージ進行状況

- [x] Tutorial T-1: 振幅を制御せよ（Amplitude Control）
- [x] Tutorial T-2: 周波数を合わせよ（Frequency Match）
- [ ] World 1: AMPLITUDE — 6ステージ（Phase 2予定）
- [ ] World 2: SYNTHESIS — 6ステージ（Phase 3予定）
- [ ] World 3: EPICYCLE — 6ステージ（Phase 4予定）
- [ ] World 4: FILTER — 6ステージ（Phase 5予定）

---

## 技術仕様

- **言語**: Vanilla JS (ES2022 Modules) + HTML5 + CSS3
- **描画**: Canvas 2D API（WebGLなし）
- **音声**: Web Audio API
- **保存**: LocalStorage
- **外部ライブラリ**: なし（すべて自前実装）
- **ブラウザ**: Chrome/Firefox/Safari/Edge (モダンブラウザ)

---

*FOURIER QUEST — Wave Engineering Educational Puzzle Game*  
*Phase 1 · 2025*
