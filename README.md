# AI Content Discord Bot

note.comからAI・プロンプト関連のトレンド記事を自動収集し、Discordに投稿するBOTです。

## 特徴

- **note.comから収集**: StableDiffusion、画像生成AI、プロンプト、ChatGPT、Gemini、Claude関連のトレンド記事を自動取得
- **AI要約**: Gemini 2.5 Flashで魅力的な要約を生成
- **人気順ランキング**: スキ数（いいね）が多い順で投稿
- **重複チェック**: 既に投稿したコンテンツは除外
- **GitHub Actions**: 3時間ごとに自動実行

## セットアップ手順

### 1. Discord BOTを作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリック
3. BOT名を入力して作成
4. 左メニューから「Bot」を選択
5. 「Add Bot」をクリック
6. 「Reset Token」でトークンを取得（後で使用）
7. 「Privileged Gateway Intents」で以下を有効化:
   - MESSAGE CONTENT INTENT
8. 左メニューから「OAuth2」→「URL Generator」を選択
9. 「SCOPES」で`bot`を選択
10. 「BOT PERMISSIONS」で以下を選択:
    - Send Messages
    - Embed Links
    - Attach Files
11. 生成されたURLをコピーしてブラウザで開き、サーバーに招待

### 2. チャンネルIDを取得

1. Discordで「ユーザー設定」→「詳細設定」→「開発者モード」を有効化
2. 投稿したいチャンネルを右クリック→「IDをコピー」

### 3. Gemini APIキーを取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Create API Key」でAPIキーを取得

### 4. リポジトリをフォーク＆設定

1. このリポジトリをフォーク
2. Settings → Secrets and variables → Actions → New repository secret
3. 以下のシークレットを追加:

| シークレット名 | 説明 |
|-------------|------|
| `DISCORD_BOT_TOKEN` | DiscordのBOTトークン |
| `DISCORD_CHANNEL_ID` | 投稿先のチャンネルID |
| `GEMINI_API_KEY` | Gemini APIキー |

### 5. GitHub Actionsを有効化

1. リポジトリの「Actions」タブを開く
2. 「I understand my workflows, go ahead and enable them」をクリック
3. ワークフローが3時間ごとに自動実行されます

## ローカル実行

```bash
# 依存関係をインストール
npm install

# .envファイルを作成
cp .env.example .env

# .envファイルを編集してAPIキーを設定
# エディタで .env を開いて各値を入力

# BOTを起動
npm start
```

## プロジェクト構造

```
.
├── .github/
│   └── workflows/
│       └── bot.yml          # GitHub Actions設定
├── src/
│   ├── services/
│   │   ├── note.js          # note.com API連携
│   │   └── gemini.js        # Gemini API連携（要約生成）
│   ├── utils/
│   │   └── contentManager.js # コンテンツ管理（重複チェック等）
│   └── index.js             # メインBOTコード
├── .env.example             # 環境変数テンプレート
├── .gitignore
├── package.json
└── README.md
```

## カスタマイズ

### 投稿頻度を変更

[.github/workflows/bot.yml](.github/workflows/bot.yml#L14) の`cron`を編集:

```yaml
schedule:
  - cron: '0 */3 * * *'  # 3時間ごとに実行（現在の設定）
  # - cron: '0 */2 * * *'  # 2時間ごとに実行
```

### 要約プロンプトをカスタマイズ

[src/services/gemini.js](src/services/gemini.js) のプロンプトを編集してください。

### 対象ハッシュタグを変更

[src/services/note.js](src/services/note.js) の`hashtags`配列を編集してください。
各ハッシュタグから2件ずつトレンド記事を取得します。

```javascript
// 現在の設定
const hashtags = ['StableDiffusion', '画像生成AI', 'プロンプト', 'ChatGPT', 'Gemini', 'Claude'];

// カスタマイズ例
// const hashtags = ['AI', '生成AI', 'プログラミング'];
```

## トラブルシューティング

### BOTが投稿しない

1. GitHub Actionsのログを確認（Actions タブ）
2. シークレットが正しく設定されているか確認
3. BOTがチャンネルに参加しているか確認
4. BOTの権限を確認

### API エラーが発生する

- Gemini APIキーが正しいか確認
- レート制限に引っかかっていないか確認
- note.com APIがアクセス可能か確認

## ライセンス

MIT
