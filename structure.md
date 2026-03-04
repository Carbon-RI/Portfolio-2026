# MyPortfolio-2026 — プロジェクト構成・設計ドキュメント

> 生成日: 2026-03-01  
> ソースコードの全ファイルをスキャンした事実ベースの設計図。

---

## 目次

1. [技術スタック](#1-技術スタック)
2. [ディレクトリ構成とファイル責務](#2-ディレクトリ構成とファイル責務)
3. [アーキテクチャ概要](#3-アーキテクチャ概要)
4. [主要データフローと依存関係](#4-主要データフローと依存関係)
5. [機能別ロジックの要約](#5-機能別ロジックの要約)
6. [Firestoreデータモデル](#6-firestoreデータモデル)
7. [環境変数一覧](#7-環境変数一覧)
8. [現状の不整合・改善ポイント](#8-現状の不整合改善ポイント)

---

## 1. 技術スタック

| 分類 | ライブラリ / バージョン |
|------|------------------------|
| フレームワーク | Next.js (App Router), React 19 |
| 言語 | TypeScript 5.9 (strict) |
| スタイリング | Tailwind CSS v4 (CSS-first `@theme` in `globals.css`) |
| DB / Auth | Firebase Client SDK v12 + Admin SDK v13, Firestore |
| ストレージ | Firebase Storage |
| メール | Nodemailer (SMTP / Gmail) |
| バリデーション | Zod v4 |
| アイコン | react-icons v5 |
| Markdown | react-markdown v10 |
| Toast | sonner v2 |
| テスト | Jest + Testing Library (設定済み、テストファイルは未作成) |

---

## 2. ディレクトリ構成とファイル責務

```
src/
├── app/
│   ├── layout.tsx                          # ルートレイアウト (フォント・メタデータ)
│   ├── globals.css                         # Tailwind v4 デザインシステム定義
│   ├── (public)/
│   │   ├── layout.tsx                      # [Server] cookie読取 → isAdmin判定 → ProviderWrapper
│   │   ├── (home)/
│   │   │   ├── page.tsx                    # [Server, ISR 60s] データ取得 → HomeClient へ渡す
│   │   │   └── _components/
│   │   │       ├── HomeClient.tsx          # [Client] 全体オーケストレーター (状態・モーダル・Observer)
│   │   │       ├── HomeLeftPanel.tsx       # [Client] 名前・ナビゲーション (固定パネル)
│   │   │       ├── HomeRightPanel.tsx      # [Client] 3セクション (welcome/profile/works)
│   │   │       └── NavLinks.tsx            # [Client] デスクトップサイドバーナビ
│   │   └── projects/[slug]/
│   │       ├── page.tsx                    # [Server, SSG] slug → getProjectData → 404判定
│   │       └── _components/
│   │           └── ProjectContentClient.tsx # [Client] プロジェクト詳細 (スライダー同期)
│   ├── admin-login/
│   │   ├── page.tsx                        # [Server] ログインページ
│   │   └── AdminLoginClient.tsx            # [Client] メール/Googleログインフォーム
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts              # POST: IDトークン検証 → セッションcookie発行
│       │   ├── logout/route.ts             # POST: リフレッシュトークン失効 → cookie削除
│       │   └── session/route.ts            # GET: セッション有効性チェック → isAdmin返却
│       └── contact/route.ts               # POST: Nodemailer でメール送信
│
├── components/
│   ├── admin/                              # [Client] 管理者専用UIコンポーネント
│   │   ├── ProjectEditModal.tsx            # プロジェクト編集モーダル (lazy loaded)
│   │   ├── BasicInfoEditor.tsx             # 基本情報エディタ (タイトル/スラッグ/カテゴリ等)
│   │   ├── ProjectDetailEditor.tsx         # セクション/メディアエディタ
│   │   └── EditableText.tsx               # ダブルクリックインライン編集コンポーネント
│   ├── layout/
│   │   ├── Header.tsx                      # [Server] ヘッダー
│   │   ├── HeaderClient.tsx                # [Client] ナビ + ログアウトボタン
│   │   ├── Footer.tsx                      # [Server] フッター
│   │   └── SplitLayout.tsx                 # 50/50 グリッドレイアウト (左固定/右スクロール)
│   ├── public/
│   │   ├── EditProjectButton.tsx           # [Client] 管理者用フローティング編集ボタン
│   │   ├── ProjectCard.tsx                 # [Client] プロジェクトカード (ステータスバッジ付き)
│   │   └── ProjectListSection.tsx          # [Client] 横スクロールカードリスト
│   └── shared/
│       ├── ConfirmDialog.tsx               # [Client] 確認ダイアログモーダル
│       ├── ContactModal.tsx                # [Client] お問い合わせフォームモーダル
│       ├── ErrorBoundary.tsx               # [Client] クラスベースエラーバウンダリ
│       ├── ImageSlider.tsx                 # [Client] 画像/YouTubeスライダー
│       ├── SocialIcons.tsx                 # [Client] LinkedIn/GitHub/Email SVGアイコン
│       └── TechIconResolver.tsx            # [Client] TechIconKeyからアイコンを解決・描画
│
├── context/
│   ├── auth-context.tsx                    # [Client] AuthProvider + useAuth フック
│   └── provider-wrapper.tsx               # isAdmin=true 時のみ AuthProvider をマウント
│
├── hooks/
│   └── admin/
│       └── useProjectEditor.ts             # [Client] プロジェクト編集の全UI状態管理 (useReducer)
│
├── lib/
│   ├── constants.ts                        # Firestoreコレクション名・ドキュメント名・auth設定
│   ├── firebase/
│   │   ├── admin.ts                        # [server-only] Firebase Admin SDK 初期化
│   │   └── client.ts                       # [client-only] Firebase Client SDK 遅延初期化
│   └── validation/
│       └── schemas.ts                      # Zod スキーマ (profile, project, media, section)
│
├── services/
│   ├── server/
│   │   ├── auth-service.ts                 # [server-only] セッション検証・作成・失効
│   │   ├── project-service.ts              # [use server] プロジェクトCRUD Server Actions
│   │   └── profile-service.ts             # [use server] プロフィール取得・保存 Server Actions
│   ├── client/
│   │   ├── auth-service.ts                 # [client] Firebase認証 (email/Google) + セッション確立
│   │   ├── project-service.ts              # [client] 画像アップロード・プロジェクト取得
│   │   └── profile-service.ts             # [client] プロフィールのリアルタイム購読
│   └── utils/
│       ├── project-converter.ts            # mapToFullData, mergeProjectAndDraft, getAdminCardData
│       ├── project-formatter.ts            # createSlugFromTitle, extractYouTubeId
│       ├── object-utils.ts                 # cleanFields() (undefinedフィールド除去)
│       └── tech-icons.ts                   # TechIconMap (35アイコン) + TechIconKey 型
│
├── types/
│   └── index.ts                            # 全共有型・定数・Result<T>パターン
│
└── proxy.ts                                # Next.js Middleware (不明ルート → / へリダイレクト)
```

---

## 3. アーキテクチャ概要

### 3-1. Server / Client 分離戦略

```
┌─────────────────────────────────────────────────────────────┐
│  Server Side (Node.js / Edge)                               │
│                                                             │
│  app/(public)/layout.tsx ──── cookie読取 ──→ isAdmin判定    │
│  app/(public)/(home)/page.tsx ─ ISR(60s) ─→ DB取得         │
│  app/api/auth/* ─────────────── Admin SDK ─→ セッション管理 │
│  services/server/* ──────────── "use server" + Admin SDK   │
│  lib/firebase/admin.ts ──────── server-only                 │
└─────────────────────────────────────────────────────────────┘
                          ↕ props / Server Actions
┌─────────────────────────────────────────────────────────────┐
│  Client Side (Browser)                                      │
│                                                             │
│  HomeClient.tsx ─────────────── 状態管理・モーダル制御      │
│  context/auth-context.tsx ───── onAuthStateChanged監視      │
│  hooks/admin/useProjectEditor ─ useReducer 編集状態         │
│  services/client/* ──────────── Firebase Client SDK        │
│  lib/firebase/client.ts ──────── window判定で保護           │
└─────────────────────────────────────────────────────────────┘
```

### 3-2. 管理者判定の二重構造

セッションcookie (`__session`) を軸に、サーバー・クライアント両側で独立して判定する。

```
[サーバー側]
  (public)/layout.tsx
    └── cookies().get("__session") → isAdmin: boolean
          └── ProviderWrapper: isAdmin=true → AuthProvider をマウント

[クライアント側]
  auth-context.tsx
    └── onAuthStateChanged → user が存在する場合
          └── GET /api/auth/session → { isAdmin: boolean }
                └── verifyAdminSession() → cookie検証 + UID照合
```

### 3-3. 管理者専用コンポーネントの遅延ロード

```typescript
// HomeClient.tsx
const ProjectEditModal = lazy(() =>
  import("@/components/admin/ProjectEditModal").then(...)
);
```

`ProjectEditModal`、`EditableText`、`ProjectDetailEditor` はすべて `lazy()` / `dynamic()` でロードされ、非管理者ユーザーのバンドルには含まれない。

### 3-4. Result\<T\> パターン

全サービス関数は以下の型を返す:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };
```

`success()`, `failure()`, `unwrap()` ヘルパーが `src/types/index.ts` に定義されている。

---

## 4. 主要データフローと依存関係

### 4-1. プロジェクト「作成・編集・保存・公開」の完全フロー

```
[管理者操作]
  HomeRightPanel (works セクション)
    └── "+ New Project" ボタン
          └── softDeleteProject で空ドキュメント作成 (slug="new-project-draft")
                └── HomeClient.setEditingProject()
                      └── <ProjectEditModal initialProject={...} isCreatingNew={true} />

[ProjectEditModal]
  ├── useMemo: isCreatingNew=true → baseData を空オブジェクトで初期化
  ├── useMemo: isCreatingNew=false → mergeProjectAndDraft(initialProject) でdraftをマージ
  └── useProjectEditor(baseData) → draftData, save, handleFieldChange, ...

[useProjectEditor (useReducer)]
  ├── dispatch(SET_FIELD) ─────────── 各フィールド更新
  ├── dispatch(TOGGLE_TECH) ────────── techStack トグル
  ├── dispatch(ADD/REMOVE_SECTION) ─── セクション管理
  ├── dispatch(ADD/REMOVE/UPDATE_MEDIA) メディア管理
  ├── handleImageUpload()
  │     └── uploadImageToStorage() [client/project-service]
  │           └── Firebase Storage → download URL → SET_FIELD("imageSrc")
  └── save(mode: "draft" | "publish")
        ├── projectSchema.safeParse(draftData) で Zod バリデーション
        ├── mode="draft" → saveProjectDraft(id, fields) [server/project-service]
        │     ├── verifyAdminSession() で認証確認
        │     ├── Firestore .set({ draft: cleanFields(contentFields) }, { merge: true })
        │     └── revalidatePath("/") + revalidatePath("/projects/[slug]")
        └── mode="publish" → publishProject(id, fields) [server/project-service]
              ├── verifyAdminSession() で認証確認
              ├── Firestore .set({ ...rootFields, draft: FieldValue.delete() }, { merge: true })
              └── revalidatePath("/") + revalidatePath("/projects/[slug]")
```

### 4-2. project-converter.ts の役割

```
mapToFullData(id, firestoreData)
  ├── Firestore Timestamp → number (toMillis()) への変換
  ├── category: string | string[] → string[] への正規化
  ├── draft フィールドが存在する場合は baseData.draft に格納
  └── 全フィールドのデフォルト値補完

mergeProjectAndDraft(project)
  ├── draft が存在しない場合 → project をそのまま返す
  └── draft が存在する場合 → { ...project, ...project.draft } でマージ
        ※ category, techStack, sections は draft 側を優先

getAdminCardData(project, isAdmin)
  ├── isAdmin=false → status="Published" で返す
  └── isAdmin=true → getProjectStatus() でステータス計算 + draft マージ

getEditorStatus(project, isCreatingNew, hasSavedDuringSession)
  ├── isCreatingNew && !hasSavedDuringSession → "NewDraft"
  └── それ以外 → getProjectStatus(project)
```

### 4-3. project-formatter.ts の役割

```
createSlugFromTitle(title)
  └── lowercase → trim → スペースを"-" → 英数字とハイフン以外を除去 → 連続ハイフンを単一化
        ※ BasicInfoEditor でタイトル入力時にリアルタイムでスラッグを自動生成 (isSynced=true 時)

extractYouTubeId(input)
  └── 11文字の純粋なIDはそのまま返す
      YouTube URL (youtube.com/watch?v=, youtu.be/, embed/) から動画IDを抽出
      ※ useProjectEditor の UPDATE_MEDIA アクション内で url フィールド更新時に自動適用
```

### 4-4. Import/Export 依存グラフ (主要パス)

```
types/index.ts
  ← lib/validation/schemas.ts (Zod infer)
  ← services/utils/tech-icons.ts (TechIconKey)
  ← (全サービス・フック・コンポーネントが参照)

lib/firebase/admin.ts [server-only]
  ← services/server/auth-service.ts
  ← services/server/project-service.ts
  ← services/server/profile-service.ts
  ← app/api/auth/login/route.ts
  ← app/api/contact/route.ts

services/server/auth-service.ts
  ← services/server/project-service.ts (verifyAdminSession)
  ← services/server/profile-service.ts (verifyAdminSession)
  ← app/api/auth/login/route.ts (createSessionCookie, getRegisteredAdminUid)
  ← app/api/auth/logout/route.ts (verifyAdminSession, revokeSession)
  ← app/api/auth/session/route.ts (verifyAdminSession)
  ← context/auth-context.tsx (GET /api/auth/session 経由で間接参照)

services/utils/project-converter.ts
  ← services/server/project-service.ts (mapToFullData)
  ← services/client/project-service.ts (mapToFullData)
  ← components/admin/ProjectEditModal.tsx (mergeProjectAndDraft, getEditorStatus)
  ← app/(public)/projects/[slug]/page.tsx (mergeProjectAndDraft)

hooks/admin/useProjectEditor.ts
  ← components/admin/ProjectEditModal.tsx
  ← app/(public)/projects/[slug]/_components/ProjectContentClient.tsx
```

---

## 5. 機能別ロジックの要約

### 5-1. 認証管理

```
[ログインフロー]
AdminLoginClient
  └── loginWithEmail() / loginWithGoogle() [client/auth-service]
        ├── Firebase Client SDK で認証 → idToken 取得
        └── handlePostLogin(user)
              └── POST /api/auth/login { idToken }
                    ├── getAdminAuth().verifyIdToken(idToken) → decodedToken
                    ├── decodedToken.email === EMAIL_USER 確認
                    ├── decodedToken.uid === Firestore admin_configs/global.adminUid 確認
                    ├── getAdminAuth().createSessionCookie(idToken, 5days)
                    └── Set-Cookie: __session (httpOnly, secure, sameSite=strict)

[セッション確認フロー]
auth-context.tsx (AuthProvider)
  └── onAuthStateChanged → user が存在する場合
        └── GET /api/auth/session
              └── verifyAdminSession()
                    ├── cookies().get("__session")
                    ├── getAdminAuth().verifySessionCookie(cookie, true) → decodedToken
                    └── decodedToken.uid === Firestore adminUid 照合

[ログアウトフロー]
HeaderClient
  └── logout() [client/auth-service]
        ├── signOut(auth) [Firebase Client]
        └── POST /api/auth/logout
              ├── verifyAdminSession() → uid 取得
              ├── getAdminAuth().revokeRefreshTokens(uid)
              └── cookies().delete("__session")
```

### 5-2. プロジェクト管理 (ProjectEditModal → useProjectEditor → project-service)

```
[モーダル初期化]
ProjectEditModal
  ├── isCreatingNew=true: baseData = 空オブジェクト (id のみ保持)
  └── isCreatingNew=false: baseData = mergeProjectAndDraft(initialProject)
        └── useProjectEditor(baseData) でフック初期化

[フック内部 (useProjectEditor)]
  ├── useReducer(projectReducer, initialProject, p => projectSchema.parse(p))
  │     ※ 初期化時に Zod でパース・デフォルト値補完
  ├── isSlugValid: slug !== "" && slug !== "new-project-draft"
  └── save(mode, onSuccess)
        ├── isUploading チェック (アップロード中はブロック)
        ├── projectSchema.safeParse(draftData) でバリデーション
        ├── slug 必須チェック
        └── Server Action 呼び出し (動的 import)

[saveProjectDraft (server/project-service)]
  ├── verifyAdminSession() → 失敗時は即 failure 返却
  ├── projectSchema.partial().safeParse(fields) でバリデーション
  ├── fields から draft: _ を除外した contentFields を構築
  └── Firestore .set({
        slug, title, published, is_deleted, showDetail,  ← ルートフィールド
        draft: cleanFields(contentFields),               ← ドラフトフィールド
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true })

[publishProject (server/project-service)]
  ├── verifyAdminSession() → 失敗時は即 failure 返却
  ├── projectSchema.partial().safeParse(fields) でバリデーション
  ├── slug 必須チェック
  └── Firestore .set({
        ...cleanFields(rootFields),   ← 全フィールドをルートに昇格
        published: true,
        is_deleted: false,
        showDetail: rootFields.showDetail ?? false,
        draft: FieldValue.delete(),   ← draft フィールドを削除
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true })
```

### 5-3. プロフィール管理 (EditableText → saveProfileSettings)

```
EditableText (ダブルクリック編集)
  └── onBlur → onSave(field, newValue)
        └── saveProfileSettings({ [field]: newValue }) [server/profile-service]
              ├── verifyAdminSession()
              ├── profileSettingsSchema.partial().safeParse(data)
              └── Firestore .set(data, { merge: true }) → revalidatePath("/")

[リアルタイム同期 (管理者のみ)]
HomeClient (isAdmin=true 時)
  └── subscribeProfileSettings() [client/profile-service]
        └── onSnapshot(settings/profile) → setProfileSettings(data)
              ※ EditableText での保存直後に Firestore から即時反映
```

### 5-4. プロジェクト詳細ページ (SSG + 管理者編集)

```
/projects/[slug]/page.tsx
  ├── generateStaticParams() → getPublishedProjects() → published=true の全スラッグ
  ├── getProjectData(slug) → ID直接検索 → なければ slug クエリ
  ├── isAdmin = searchParams.edit === "true"
  ├── isAdmin=true → mergeProjectAndDraft(result.data) でドラフトをマージして表示
  ├── isAdmin=false && (!published || !showDetail) → notFound()
  └── <ProjectContentClient project={processedProject} isAdmin={isAdmin} />

ProjectContentClient
  ├── useProjectEditor(project) でフック初期化
  ├── IntersectionObserver でアクティブセクション追跡 → ImageSlider と同期
  └── isAdmin=true 時: ProjectDetailEditor を表示 (セクション/メディア編集)
```

### 5-5. お問い合わせ

```
ContactModal
  └── POST /api/contact { name, email, message }
        ├── Firestore settings/profile から emailAddress 取得
        ├── targetEmail = profile.emailAddress || CONTACT_EMAIL || EMAIL_USER
        └── nodemailer.sendMail() でHTML形式メール送信
```

---

## 6. Firestoreデータモデル

### コレクション: `projects`

```typescript
{
  // ルートフィールド (公開済みデータ)
  slug: string,           // URL識別子 (例: "my-portfolio")
  title: string,
  category: string[],     // ["Web App", "SaaS"] など
  industry: string,
  summary: string,
  imageSrc: string,       // Firebase Storage URL
  githubUrl: string,
  demoUrl: string,
  techStack: TechIconKey[],
  published: boolean,
  is_deleted: boolean,    // ソフトデリート
  showDetail: boolean,    // 詳細ページの公開可否
  sections: [
    {
      heading: string,
      content: string,    // Markdown
      media: [{ type: "image" | "video" | "youtube", url: string }]
    }
  ],
  updatedAt: Timestamp,

  // ドラフトフィールド (未公開の編集内容、publishProject 時に FieldValue.delete() で削除)
  draft?: Partial<上記フィールド>
}
```

**ProjectStatus の導出ロジック:**

```typescript
getProjectStatus(project):
  is_deleted=true           → "Deleted"
  published=true, draft あり → "DraftModified"
  published=true, draft なし → "Published"
  published=false, draft あり → "NewDraft"
  published=false, draft なし → "Unpublished"
```

### コレクション: `settings` / ドキュメント: `profile`

```typescript
{
  siteTitle, siteDescription,
  name, tagline,
  aboutMeHeading, aboutMeText,
  linkedinUrl, githubUrl, emailAddress,
  welcomeMessageHeading, welcomeMessageText
}
```

### コレクション: `admin_configs` / ドキュメント: `global`

```typescript
{ adminUid: string }  // 管理者のFirebase UID (ログイン時のUID照合に使用)
```

---

## 7. 環境変数一覧

### サーバーサイド (`.env.local`)

| 変数名 | 用途 |
|--------|------|
| `FIREBASE_PROJECT_ID` | Admin SDK 初期化 |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK 初期化 |
| `FIREBASE_PRIVATE_KEY` | Admin SDK 初期化 (`\\n` → `\n` 変換あり) |
| `EMAIL_USER` | SMTP認証ユーザー + 管理者メール照合 |
| `EMAIL_PASS` | SMTP認証パスワード |
| `EMAIL_HOST` | SMTPホスト (デフォルト: `smtp.gmail.com`) |
| `EMAIL_PORT` | SMTPポート (デフォルト: `587`) |
| `CONTACT_EMAIL` | お問い合わせ受信先 (省略時は `EMAIL_USER`) |

### クライアントサイド (`NEXT_PUBLIC_` プレフィックス)

| 変数名 | 用途 |
|--------|------|
| `NEXT_PUBLIC_SITE_URL` | 本番URL。robots.txt / sitemap.xml / canonical に使用。.env.local で指定 |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Client SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Client SDK |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Client SDK |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Client SDK |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Client SDK |

---

## 8. 現状の不整合・改善ポイント

### 8-1. `saveProjectDraft` でのフィールド二重書き込み問題

**場所:** `src/services/server/project-service.ts` — `saveProjectDraft()`

**問題:**

```typescript
const { draft: _, ...contentFields } = fields;
const { published, is_deleted, showDetail, slug, title } = fields;

await db.set({
  slug, title, published, is_deleted, showDetail,
  draft: cleanFields(contentFields),  // ← slug, title 等がここにも混入
  updatedAt: FieldValue.serverTimestamp(),
}, { merge: true });
```

`contentFields` は `{ draft: _ }` を除いた全フィールドなので、`slug`, `title`, `published` 等が **ルートと `draft` 内の両方に書き込まれる**。

**修正案:**

```typescript
const { draft: _, slug, title, published, is_deleted, showDetail, ...draftOnlyFields } = fields;

await db.set({
  slug, title, published: published ?? false,
  is_deleted: is_deleted ?? false,
  showDetail: showDetail ?? false,
  draft: cleanFields(draftOnlyFields),
  updatedAt: FieldValue.serverTimestamp(),
}, { merge: true });
```

---

### 8-2. ~~`publishProject` でのフィールド不足リスク~~ (対応不要)

`imageSrc` なしでの公開を許容する仕様のため、対応不要。

---

### 8-3. 新規プロジェクト作成時の未保存ドキュメント蓄積

**場所:** `HomeClient.tsx` → `ProjectEditModal.tsx` — `handleClose()`

**問題:**

モーダルをキャンセルすると `softDeleteProject` が呼ばれ `is_deleted: true` になるが、**ドキュメントは Firestore に残り続ける**。操作のたびにゴミドキュメントが蓄積する。

**修正案:** `softDeleteProject` の代わりに物理削除 (`deleteDoc`) を使用する。

---

### 8-4. `proxy.ts` (Middleware) の認証ガード欠如

**場所:** `src/proxy.ts`

**問題:** セッションcookieを持つ管理者が `/admin-login` に再アクセスしても `/` にリダイレクトされない。

**修正案:**

```typescript
if (pathname === LOGIN_ROUTE) {
  const session = request.cookies.get(AUTH_CONFIG.SESSION_COOKIE);
  if (session) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}
```

---

### 8-5. `HomeClient` でのサーバーアクション直接インポート

**場所:** `src/app/(public)/(home)/_components/HomeClient.tsx`

**問題:**

```typescript
// Client Component から "use server" + "server-only" モジュールを動的インポート
const { getAllProjects } = await import("@/services/server/project-service");
```

設計上の意図が不明確になる。

**修正案:** `services/client/project-service.ts` に `getAllProjectsClient()` を追加し、クライアントからはそちらを使用する。

---

### 8-6. `useProjectEditor` の初期化時 Zod パース

**場所:** `src/hooks/admin/useProjectEditor.ts`

**問題:**

```typescript
(p) => projectSchema.parse(p) as FullProjectData  // 失敗時に例外スロー
```

**修正案:**

```typescript
(p) => {
  const result = projectSchema.safeParse(p);
  return result.success ? (result.data as FullProjectData) : p;
}
```

---

### 8-7. `EditableText` の保存失敗時のUX

**場所:** `src/components/admin/EditableText.tsx`

**問題:** 保存失敗時にコンソールエラーのみで、ユーザーへのフィードバックがない。

**修正案:** `sonner` の `toast.error()` を追加する。

---

### 8-8. `admin.ts` でのモジュールレベル初期化 ✅ 修正済み (2026-03-01)

**場所:** `src/lib/firebase/admin.ts`

モジュールレベルの即時実行 (`export const adminAuth = ...` 等3行) を削除し、関数形式 (`getAdminAuth()`, `getAdminDb()`, `getAdminStorage()`) に統一した。
呼び出し側 (`auth-service.ts`, `login/route.ts`) も合わせて関数形式に変更済み。

---

*このドキュメントはソースコードの全ファイルスキャンに基づいて生成されました。コードの変更に合わせて随時更新してください。*
