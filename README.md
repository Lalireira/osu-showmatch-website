大枠

## 1. サイト概要
- トーナメント情報サイト
- 大会情報、チーム情報、マッププール情報の提供
- レスポンシブデザイン対応（モバイル・デスクトップ）

## 2. ページ構成
### 2.1 共通要素
- ヘッダー
  - サイトタイトル未定
  - サブタイトル未定
  - ナビゲーションメニュー（Home, Teams, Mappool）
- フッター
  - コピーライト表示
- 右下固定ロゴ
  - あのアンパンマンのやつ

### 2.2 各ページの詳細

#### A. ホームページ (/)
1. メインビジュアル
   - 大会メインビジュアル画像表示

2. Schedule & Details セクション
   - Mappool Announcement日時
   - Match Day日時
   - Manager情報
   - Mappool Selector & Commentator情報
   - SpreadSheetリンク
   - 配信ページリンク

3. Rules セクション
   - チーム編成
   - 試合形式
   - 試合運営
   - マッププール
   - 禁止事項
   - 試合日程

#### B. Teams ページ (/tournament-Teams)
1. チーム表示セクション
   - Team A（Team ◯◯）
   - Team B（Team ◯◯）
   - Organisation（運営チーム）

2. プレイヤーカード表示
   - プロフィール画像
   - プレイヤー名
   - 国旗
   - PP
   - グローバルランク
   - 国内ランク
   - プレイスタイル
   - コメント
   - osu!プロフィールへのリンク

#### C. Mappool ページ (/mappool-ui)
1. カテゴリー別マップ表示
   - NoMod (◯譜面)
   - Hidden (◯譜面)
   - HardRock (◯譜面)
   - DoubleTime (◯譜面)
   - FreeMod (◯譜面)
   - TieBreaker (1譜面)

2. 譜面カード表示
   - 譜面バナー画像
   - 曲名
   - アーティスト名
   - 難易度名
   - マッパー名
   - マップID
   - 譜面情報（長さ、BPM、SR、CS、AR、OD、HP）

## 3. 技術仕様

### 3.1 フロントエンド
- React（関数コンポーネント）
- Tailwind CSS
- Font Awesome（アイコン）
- カスタムアニメーション

### 3.2 バックエンド機能
- osu! API連携
  - プレイヤー情報取得
  - PP、ランク情報の更新

### 3.3 データ構造
// プレイヤーデータ構造
{
  id: string,
  name: string,
  avatar: string,
  country: string,
  playstyle: string,
  comment: string
}

// 譜面データ構造
{
  id: string,
  artist: string,
  title: string,
  difficulty: string,
  mapper: string,
  mapId: string,
  banner: string,
  length: string,
  sr: string,
  bpm: string,
  cs: string,
  ar: string,
  od: string,
  hp: string,
  category: string
}
3.4 アニメーション仕様
- スライドダウン（ヘッダー要素）
- フェードイン（コンテンツ要素）
- バウンス（右下ロゴ）
- ホバーエフェクト（ナビゲーション、カード要素）

## 4. デザイン仕様

### 4.1 カラースキーム
- 背景色: #1a1a1a
- セカンダリ背景: #2a2a2a
- アクセントカラー: #ff66aa
- テキスト色:
  - メイン: white
  - セカンダリ: gray-400
  - アクセント: #ff66aa

### 4.2 フォント
- メインフォント: Figtree
- 絵文字フォント: Apple Color Emoji, Android Emoji, Segoe UI Emoji, Noto Color Emoji

### 4.3 レスポンシブデザイン
- モバイル: 1カラムレイアウト
- タブレット/デスクトップ: 2-3カラムレイアウト
- 適応的なカードサイズ
- フレックスボックスベースのレイアウト

## 5. パフォーマンス考慮事項
- 画像の最適化（UCareを使用）
- コンポーネントの遅延ローディング
- APIデータのキャッシング
- アニメーションの最適化
