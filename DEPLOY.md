# デプロイ手順書

## 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Vercelアカウント（推奨）

## 環境変数の設定
1. `.env.local`ファイルを作成し、以下の環境変数を設定します：
```
NEXT_PUBLIC_OSU_CLIENT_ID=your_client_id_here
OSU_CLIENT_SECRET=your_client_secret_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

## ローカル開発環境のセットアップ
1. リポジトリをクローン
```bash
git clone [repository-url]
cd osu-showmatch-website
```

2. 依存関係のインストール
```bash
npm install
# または
yarn install
```

3. 開発サーバーの起動
```bash
npm run dev
# または
yarn dev
```

## 本番環境へのデプロイ（Vercel）
1. Vercelにプロジェクトをインポート
2. 環境変数を設定
3. デプロイを実行

## デプロイ後の確認事項
1. 環境変数が正しく設定されているか
2. APIが正常に動作しているか
3. セキュリティヘッダーが正しく設定されているか
4. パフォーマンスが期待通りか

## トラブルシューティング
### APIエラー
- 環境変数が正しく設定されているか確認
- osu! APIのクライアントIDとシークレットが有効か確認

### ビルドエラー
- Node.jsのバージョンが要件を満たしているか確認
- 依存関係が正しくインストールされているか確認

### パフォーマンス問題
- 画像の最適化が正しく行われているか確認
- キャッシュが正しく機能しているか確認 