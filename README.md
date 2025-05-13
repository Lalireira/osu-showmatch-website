# osu! Showmatch Website

## サイト概要

このウェブサイトは、osu!のショーマッチイベントのチーム情報・マッププール情報を表示するためのプラットフォームです。
主に静的なデータをもとに、参加チーム・選手・マッププールの情報を閲覧できます。
管理者向けには、チームやマッププールの編集 UI も用意されています。

## 主な機能

- ホームページ：イベント概要・日程・スタッフ・ルールの表示
- Teams ページ：チームごとのメンバー情報・osu!プロフィールへのリンク表示
- Mappool ページ：カテゴリ別にマッププールを一覧表示
- 管理者ページ：チーム・マッププールの編集（認証あり）

## ページ構成

### ホームページ (`/`)

- イベント名・メインビジュアル
- 重要日程（Mappool 発表日・試合日など）
- スタッフ（Manager, Mappool Selector, Commentator 等）
- ルール概要（チーム編成・試合形式など）

### Teams ページ (`/teams`)

- チームごとにメンバーを表示
- 各メンバーの osu!プロフィールへのリンク
- プレイヤー情報は osu! API から取得し、キャッシュを利用

### Mappool ページ (`/mappool-ui`)

- カテゴリ（NM/HD/HR/DT/FM/TB）ごとにマップを表示
- 各マップの osu!ページへのリンク
- osu! API から譜面情報を取得し、キャッシュを利用

### 管理者ページ (`/admin`)

- ログイン認証後、チーム・マッププールの編集画面に遷移可能
- 編集内容は一時的に反映されるが、永続的な DB 保存や API 連携は未実装

## 技術スタック

- Next.js 15（App Router）
- React 19
- TypeScript
- Tailwind CSS
- Prisma（DB スキーマ定義のみ、実際の DB 保存は未実装）
- osu! API（プレイヤー・譜面情報取得用）
- SQLite（Prisma スキーマ上の定義のみ）

## データ構造

### チームデータ（`src/data/teams.ts`）

```ts
export const teams = [
  {
    team: "TeamA",
    members: [
      { userNo: "TeamA1", url: "https://osu.ppy.sh/users/..." },
      // ...
    ],
  },
  // ...
];
```

### マッププールデータ（`src/data/mappool.ts`）

```ts
export const mappoolConfig = [
  { mapNo: "NM1", url: "https://osu.ppy.sh/beatmapsets/.../osu/..." },
  // ...
];
```

## セットアップ方法

```bash
git clone [repository-url]
cd osu-showmatch-website
npm install
npm run dev
```

## 環境変数

- 現状、osu! API キー等の環境変数は利用していません（API 連携はクライアントサイドで直接行っています）。

## 注意事項

- DB（Prisma/SQLite）は現状利用していません。データは`src/data/`配下の静的ファイルで管理しています。
- 管理者ページの編集内容は永続化されません（リロードで元に戻ります）。
- MongoDB や Redis、Vercel デプロイ等の記述は現状の実装には含まれていません。

## プロジェクト構成

```
osu-showmatch-website/
├── .next/                      # Next.jsのビルド出力ディレクトリ
├── .vscode/                    # VSCode設定
├── node_modules/               # 依存パッケージ
├── prisma/                     # Prisma設定
├── public/                     # 静的ファイル
├── src/                        # ソースコード
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── admin/             # 管理者ページ
│   │   │   ├── teams/        # チーム管理ページ
│   │   │   │   └── page.tsx  # チーム管理インターフェース
│   │   │   ├── maps/         # マップ管理ページ
│   │   │   │   └── page.tsx  # マップ管理インターフェース
│   │   │   └── page.tsx      # 管理者ダッシュボード
│   │   ├── api/              # APIルート
│   │   │   ├── admin/        # 管理者API
│   │   │   │   ├── teams-config/         # チーム設定API
│   │   │   │   │   └── route.ts          # チーム設定エンドポイント
│   │   │   │   ├── mappool-config/       # マッププール設定API
│   │   │   │   │   └── route.ts          # マッププール設定エンドポイント
│   │   │   │   ├── team-labels/          # チームラベルAPI
│   │   │   │   │   └── route.ts          # チームラベルエンドポイント
│   │   │   │   └── maps/                 # マップ管理API
│   │   │   │       └── route.ts          # マップ管理エンドポイント
│   │   │   ├── auth/         # 認証API
│   │   │   │   └── login/    # ログインAPI
│   │   │   │       └── route.ts # ログインエンドポイント
│   │   │   └── osu/          # osu! API連携
│   │   │       ├── user/     # ユーザー情報API
│   │   │       │   └── [userId]/ # 特定ユーザー情報
│   │   │       │       └── route.ts # ユーザー情報エンドポイント
│   │   │       ├── beatmap/  # ビートマップAPI
│   │   │       │   ├── [id]/ # 特定ビートマップ
│   │   │       │   │   └── route.ts # ビートマップ詳細エンドポイント
│   │   │       │   └── route.ts # ビートマップ一覧エンドポイント
│   │   │       ├── beatmapset/ # ビートマップセットAPI
│   │   │       │   └── [id]/ # 特定ビートマップセット
│   │   │       │       └── route.ts # ビートマップセット詳細エンドポイント
│   │   │       └── route.ts  # osu! API基本エンドポイント
│   │   ├── beatmaps/         # ビートマップ関連ページ
│   │   │   └── [id]/        # 個別ビートマップページ
│   │   │       └── page.tsx # ビートマップ詳細ページ
│   │   ├── lib/             # アプリケーション固有のライブラリ
│   │   ├── mappool-ui/      # マッププールUI
│   │   │   └── page.tsx     # マッププール管理ページ
│   │   ├── teams/           # チーム関連ページ
│   │   │   └── page.tsx     # チーム一覧ページ
│   │   ├── favicon.ico      # ファビコン
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # トップページ
│   ├── components/          # 共通コンポーネント
│   │   ├── admin/          # 管理者用コンポーネント
│   │   │   └── LoginForm.tsx # ログインフォーム
│   │   ├── ui/             # UIコンポーネント
│   │   │   ├── avatar.tsx  # アバターコンポーネント
│   │   │   ├── card.tsx    # カードコンポーネント
│   │   │   └── skeleton.tsx # ローディングスケルトン
│   │   ├── ErrorBoundary.tsx # エラー境界コンポーネント
│   │   ├── Footer.tsx      # フッターコンポーネント
│   │   ├── Header.tsx      # ヘッダーコンポーネント
│   │   └── PlayerCard.tsx  # プレイヤーカードコンポーネント
│   ├── data/               # データ関連
│   │   ├── mappool.ts      # マッププールデータの型定義と管理
│   │   └── teams.ts        # チームデータの型定義と管理
│   ├── lib/                # 共通ライブラリ
│   │   ├── auth/          # 認証関連
│   │   │   ├── client.ts  # クライアントサイド認証
│   │   │   └── server.ts  # サーバーサイド認証
│   │   ├── apiErrorHandler.ts # APIエラー処理
│   │   ├── cacheConfig.ts  # キャッシュ設定
│   │   ├── config.ts       # アプリケーション設定
│   │   ├── csrf.ts         # CSRF保護
│   │   ├── db.sql          # データベーススキーマ
│   │   ├── db.ts           # データベース接続設定
│   │   ├── errorHandler.ts # エラー処理
│   │   ├── osuApi.ts       # osu! APIとの通信
│   │   ├── prisma.ts       # Prismaクライアント設定
│   │   ├── rateLimit.ts    # レート制限
│   │   ├── schema.ts       # データベーススキーマ
│   │   └── utils.ts        # 共通ユーティリティ関数
│   └── middleware.ts       # Next.jsミドルウェア
├── .gitignore              # Git除外設定
├── DEPLOY.md               # デプロイ手順
├── eslint.config.mjs       # ESLint設定
├── MAINTENANCE.md          # メンテナンス手順
├── next-env.d.ts          # Next.js型定義
├── next.config.js         # Next.js設定
├── next.config.ts         # Next.js設定（TypeScript）
├── package.json           # プロジェクト設定
├── package-lock.json      # 依存関係ロックファイル
├── postcss.config.mjs     # PostCSS設定
├── README.md              # プロジェクト説明
├── SETUP.md               # セットアップ手順
├── tailwind.config.js     # Tailwind CSS設定
├── tailwind.config.ts     # Tailwind CSS設定（TypeScript）
├── team_labels.csv        # チームラベルデータ
├── teams.csv              # チームデータ
├── mappool.csv            # マッププールデータ
└── tsconfig.json          # TypeScript設定
```

### 主要機能とファイルの使用用途

1. **管理者機能**

   - `app/admin/`: 管理者ダッシュボードと管理インターフェース
   - `components/admin/LoginForm.tsx`: 管理者ログインフォーム
   - `app/api/admin/`: 管理者用 API エンドポイント

2. **認証システム**

   - `app/api/auth/login/route.ts`: ログイン処理
   - `lib/auth/`: 認証ロジック
     - `client.ts`: クライアントサイド認証
     - `server.ts`: サーバーサイド認証

3. **osu! API 連携**

   - `app/api/osu/`: osu! API 連携エンドポイント
   - `lib/osuApi.ts`: osu! API 通信ロジック

4. **UI コンポーネント**

   - `components/ui/`:
     - `avatar.tsx`: ユーザーアバター
     - `card.tsx`: 汎用カード
     - `skeleton.tsx`: ローディング表示

5. **データ管理**

   - `data/`: データ型定義と管理
   - `lib/db.ts`: データベース接続
   - `lib/prisma.ts`: Prisma 設定

6. **セキュリティ**

   - `middleware.ts`: セキュリティヘッダー
   - `lib/csrf.ts`: CSRF 保護
   - `lib/rateLimit.ts`: レート制限

7. **エラー処理**

   - `components/ErrorBoundary.tsx`: エラー境界
   - `lib/errorHandler.ts`: エラーハンドリング
   - `lib/apiErrorHandler.ts`: API エラー処理

8. **パフォーマンス最適化**
   - `lib/cacheConfig.ts`: キャッシュ設定
   - `components/ui/skeleton.tsx`: ローディング最適化

---
