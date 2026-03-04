# opt/performance-lcp-fix ブランチ変更履歴

> ベース: `4ca3b86` (Org/public) → 最新 (HEAD + 未コミット変更)

---

## 1. ファイル変更サマリー

### 追加 (A)

| ファイル | 説明 |
|----------|------|
| `HeroSection.tsx` | LCP 用の Server Component。ウエルカムメッセージを静的レンダリング |
| `HeroVisibilityController.tsx` | 管理者時のみ Hero を非表示にする Client ラッパー |
| `HomeLeftPanelWithObserver.tsx` | 左パネル + スクロール観測（Nav アクティブ状態） |
| `SplitLayoutServer.tsx` | 左右 2 カラムの Server レイアウト |
| `structure.md` | プロジェクト構成ドキュメント |

### 削除 (D)

| ファイル | 説明 |
|----------|------|
| `HomeClient.tsx` | 旧ホームオーケストレーター。SplitLayoutServer + 各パネルに分割 |
| `HomeRightContent.tsx` | HomeRightPanel に統合 |
| `HomeRightPanelWithModal.tsx` | HomeRightPanel に統合 |

### 変更 (M)

| ファイル | 主な変更内容 |
|----------|--------------|
| `page.tsx` | 静的ルート化、SplitLayoutServer、Hero、HomeRightPanel |
| `layout.tsx` | adjustFontFallback、preconnect、generateMetadata |
| `(public)/layout.tsx` | ProviderWrapper の調整 |
| `auth-context.tsx` | Firebase 遅延初期化（requestIdleCallback） |
| `profile-service.ts` | unstable_cache、revalidateTag |
| `project-service.ts` | unstable_cache、revalidateTag、型まわり |
| `package.json` | browserslist を "last 2 years" に変更 |

---

## 2. カテゴリ別変更内容

### 2.1 パフォーマンス（LCP 最適化）

| 変更 | 内容 |
|------|------|
| **静的ルート化** | `page.tsx` から `cookies()` / `verifyAdminSession()` を削除し、完全静的レンダリング |
| **Hero の Server レンダリング** | HeroSection を Server Component として HTML に直接出力 |
| **Firebase 遅延初期化** | `requestIdleCallback` で LCP 後に Firebase を初期化 |
| **ISR** | `export const revalidate = 60` を page.tsx に追加 |
| **unstable_cache** | getProfileSettings / getPublishedProjects を 60 秒キャッシュ |
| **adjustFontFallback** | フォントに `adjustFontFallback: true` を追加 |
| **preconnect** | Firebase / apis.google.com への preconnect を追加 |
| **browserslist** | `"last 5 years"` → `"last 2 years"` |
| **ContactModal** | React.lazy で遅延読み込み |
| **project-converter** | 管理者時のみ dynamic import |
| **optimizePackageImports** | react-icons, firebase を最適化 |

### 2.2 コンポーネント構造の整理

| 変更 | 内容 |
|------|------|
| **HomeClient の廃止** | 役割を SplitLayoutServer、各パネル、Hero に分割 |
| **HomeRight の統合** | HomeRightContent + HomeRightPanelWithModal → HomeRightPanel に統合 |
| **SplitLayoutServer** | 左右 2 カラムレイアウトを Server Component で実装 |
| **ProjectListSection** | dynamic import（ssr: true）のまま維持（ssr: false は LCP 悪化のため不採用） |

### 2.3 データ取得・キャッシュ

| 変更 | 内容 |
|------|------|
| **getProfileSettings** | unstable_cache（タグ: profile-settings、60 秒） |
| **getPublishedProjects** | unstable_cache（タグ: published-projects、60 秒） |
| **revalidateTag** | saveProfileSettings / refreshProjectCache / hardDeleteProject でキャッシュ無効化（Next.js 16 に合わせて第二引数 "max"） |

### 2.4 型・Lint 修正

| 変更 | 内容 |
|------|------|
| **any → unknown** | EditableText、useProjectEditor、object-utils、types |
| **prefer-const** | auth-context の loadCleanup |
| **setState in effect** | ProjectEditModal で queueMicrotask でラップ |
| **未使用変数** | project-service、project-converter で void draft |
| **未使用 import** | project-service (client) の getDb を削除 |

---

## 3. ディレクトリ構成の変化

### 変更前（ベース）

```
home/
├── page.tsx          # cookies 読取、HomeClient を dynamic
└── _components/
    ├── HomeClient.tsx    # 全体オーケストレーター
    ├── HomeLeftPanel.tsx
    └── NavLinks.tsx
```

### 変更後（最新）

```
home/
├── page.tsx          # 静的、SplitLayoutServer、Suspense で HomeRightPanel をラップ
└── _components/
    ├── HeroSection.tsx           # Server
    ├── HeroVisibilityController.tsx  # Client（管理者時に Hero 非表示）
    ├── HomeLeftPanel.tsx
    ├── HomeLeftPanelWithObserver.tsx
    ├── HomeRightPanel.tsx        # 統合済み（旧 Content + WithModal）
    └── NavLinks.tsx
```

---

## 4.  Lighthouse スコア（参考）

| 指標 | 改善前 | 改善後（目安） |
|------|--------|----------------|
| Performance | 〜91 | 95–96 |
| LCP | 3.4–3.6s | 2.8–2.9s |
| TBT | 50ms | 40ms |
| CLS | 0 | 0 |

---

## 5. 注意点

- **inlineCss** は LCP 悪化のため導入していない
- **ProjectListSection の ssr: false** も LCP 悪化のため `ssr: true` のまま
- **revalidateTag** は Next.js 16 の仕様に合わせ、第二引数 `"max"` を指定
