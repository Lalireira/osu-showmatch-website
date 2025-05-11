# 開発環境構築手順書

## 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Git
- VSCode（推奨）

## 1. リポジトリのクローン
```bash
git clone [repository-url]
cd osu-showmatch-website
```

## 2. 依存関係のインストール
```bash
# npmを使用する場合
npm install

# yarnを使用する場合
yarn install
```

## 3. 環境変数の設定
1. プロジェクトのルートディレクトリに`.env.local`ファイルを作成
2. 以下の環境変数を設定：
```
# osu! API認証情報
NEXT_PUBLIC_OSU_CLIENT_ID=your_client_id_here
OSU_CLIENT_SECRET=your_client_secret_here

# 管理者認証情報
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

### osu! API認証情報の取得方法
1. [osu!開発者ポータル](https://osu.ppy.sh/home/account/edit#oauth)にアクセス
2. 新しいアプリケーションを作成
3. 以下の設定を行う：
   - アプリケーション名: osu! Showmatch
   - コールバックURL: http://localhost:3000/api/auth/callback/osu
   - スコープ: public
4. 発行されたClient IDとClient Secretを環境変数に設定

## 4. データベースのセットアップ
```bash
# Prismaのセットアップ
npx prisma generate
npx prisma db push
```

## 5. 開発サーバーの起動
```bash
# npmを使用する場合
npm run dev

# yarnを使用する場合
yarn dev
```

## 6. 動作確認
1. ブラウザで http://localhost:3000 にアクセス
2. 以下の機能が正常に動作することを確認：
   - トップページの表示
   - チーム一覧の表示
   - マッププールの表示
   - 管理者ログイン

## 7. 開発環境の設定（VSCode）

### 推奨拡張機能
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- TypeScript and JavaScript Language Features

### 設定ファイル
`.vscode/settings.json`に以下の設定を追加：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 8. トラブルシューティング

### 依存関係のエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
# または
yarn install
```

### 環境変数の問題
1. `.env.local`ファイルが正しい場所にあるか確認
2. 環境変数が正しく設定されているか確認
3. 開発サーバーを再起動

### データベースの問題
```bash
# データベースをリセット
npx prisma db push --force-reset
```

### APIエラー
1. osu! APIの認証情報が正しいか確認
2. レート制限に達していないか確認
3. ネットワーク接続を確認

## 9. 開発時の注意点

### キャッシュの管理
- 開発時は`next.config.js`の`onDemandEntries`設定によりキャッシュが無効化されています
- 本番環境では適切なキャッシュ戦略が適用されます

### セキュリティ
- 環境変数は`.gitignore`に追加され、リポジトリにコミットされません
- 本番環境では適切なセキュリティヘッダーが設定されます

### パフォーマンス
- 画像はNext.jsのImageコンポーネントを使用して最適化されています
- APIレスポンスは適切なキャッシュ戦略が適用されています 