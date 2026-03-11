# My Portfolio

> A Next.js 16 portfolio project focusing on clean architecture and robust CMS workflows.

---

## Tech Stack

| Area | Technology |
|------|------------|
| **Framework** | Next.js 16 (App Router) / React 19 |
| **Styling** | Tailwind CSS v4 (PostCSS) |
| **Backend** | Firebase (Firestore, Auth, Storage) |
| **Validation** | Zod v4 |
| **Testing** | Jest 30 / Testing Library |
| **TypeScript** | 5.9.x |

---

## Architecture: Separation of Concerns

The project prioritizes **readability for others** and **separation of concerns**. The structure reflects clear boundaries between client and server, and between presentation and business logic.

```
src/
├── app/                    # App Router (Route Groups: (public), (home))
│   ├── api/                # API Routes (auth, contact)
│   └── (public)/           # Public pages
├── components/
│   ├── layout/             # Layout (Header, Footer, SplitLayout)
│   ├── public/             # Public UI
│   ├── admin/              # Admin UI
│   └── shared/             # Shared UI (Modal, Button, ConfirmDialog, etc.)
├── services/
│   ├── client/             # Client-only (Firebase Client SDK)
│   ├── server/             # Server-only (Firebase Admin SDK, Server Actions)
│   └── utils/              # Pure functions & data transforms (fully tested)
├── lib/
│   ├── firebase/           # Firebase initialization (client / admin separation)
│   ├── validation/         # Zod schemas
│   └── constants.ts        # Collection names & constants
├── types/                  # Types (Zod-inferred, Result<T>)
├── context/                # React Context (Auth, etc.)
└── hooks/                  # Custom hooks (useProjectEditor, etc.)
```

### Firebase SDK Separation

`lib/firebase` enforces strict separation of Client and Admin SDKs:

- **`client.ts`** — Client SDK only. Throws if used on the server. Uses `NEXT_PUBLIC_*` env vars for browser-side auth and Firestore access.
- **`admin.ts`** — Admin SDK only. Marked with `"server-only"`. Uses service account credentials for privileged operations.

This prevents accidental use of the Admin SDK in the browser and keeps client code lightweight. All admin operations (project CRUD, session verification, etc.) go through `services/server/`, which imports only `lib/firebase/admin.ts`.

### Services Layer

The `services/` directory organizes Server Actions and business logic:

- **`client/`** — Auth, profile, and project queries that run in the browser via the Client SDK.
- **`server/`** — Server Actions for mutations, admin-only reads, and cache invalidation. Uses Admin SDK and can perform privileged operations.
- **`utils/`** — Pure, side-effect-free helpers for data conversion, formatting, and normalization. Shared across client and server and fully covered by tests.

---

## Draft/Publish CMS Workflow

The editing flow is implemented as a practical Draft/Publish workflow rather than basic CRUD. State is stored in a **single Firestore document** per project.

### Data Model

- **Project root** — `slug`, `title`, `category`, `techStack`, `sections`, `published`, `is_deleted`, `showDetail`, `updatedAt`, etc.
- **`draft` subfield** — Holds in-progress edits. On Publish, draft data is merged into the root and the `draft` field is cleared via `FieldValue.delete()`.
- **Soft delete** — `is_deleted: true` for logical deletion.

### Workflow States

| State | Description |
|-------|-------------|
| Published | Live; no draft |
| DraftModified | Published with unsaved draft |
| NewDraft | New, unsaved project |
| Unpublished | Not published |
| Deleted | Soft-deleted |

### Type Consistency with Zod

Zod schemas in `lib/validation/schemas.ts` are the single source of truth. Inferred types flow from validation through forms, Server Actions, and Firestore writes. Frontend and backend share the same validation rules, reducing drift and runtime errors.

---

## Stack Selection: Optimization & Maintainability

Technology choices are driven by optimization and long-term maintainability rather than novelty:

- **Next.js 16 (App Router)** — Streaming, parallel routes, and fine-grained caching for performance. App Router provides clear boundaries for server and client rendering.
- **Tailwind CSS v4** — PostCSS-based setup with `@theme` for design tokens. Consistent utility-first styling without extra runtime or runtime-specific abstractions.
- **Bundle optimization** — `optimizePackageImports` for `react-icons` and `firebase` to cut bundle size.
- **Production hardening** — Session-first auth for LCP, CSP and HSTS headers, and production removal of `console` calls.

---

## Testing

Tests are treated as a normal part of development. The `src/services/utils/` layer is the quality baseline and is kept at **100% coverage** (Statements, Branches, Functions, Lines).

| Module | Responsibility |
|--------|----------------|
| `object-utils.ts` | `cleanFields` — Strip undefined; preserve null/falsy |
| `project-formatter.ts` | `createSlugFromTitle`, `extractYouTubeId` — URL/ID normalization |
| `project-converter.ts` | `mapToFullData`, `mergeProjectAndDraft`, `getAdminCardData`, `getEditorStatus` — Firestore data conversion and merge |

Edge cases (empty inputs, mixed Timestamp/Date/number/string, array normalization for `category`) are covered. Tests focus on pure functions in `utils/`; `collectCoverageFrom` is scoped accordingly.

```bash
npm run test -- --coverage
```

---

## Firebase Implementation Details

### Server-Side Caching

- `unstable_cache` caches `getPublishedProjects` for 60 seconds.
- `revalidatePath` and `revalidateTag` trigger on-demand invalidation after publishes and edits.

### Authentication

- Session cookies and `verifyAdminSession` ensure admin operations are restricted to authenticated users.
- Firestore `adminUid` is validated server-side before any write.

---

## Development

### Setup

```bash
npm install
cp .env.example .env.local
# Add Firebase config and email settings to .env.local
```

### Commands

```bash
npm run dev
npm run build
npm run test
npm run test -- --coverage
```

### Docker (Local Development)

The project is Dockerized so others can run it locally without manual setup.

**Prerequisites**: Install [Docker](https://docs.docker.com/get-docker/).

**Steps**:

1. Clone the repository and move to the project root
2. Copy `.env.example` to `.env.local` and fill in Firebase and email settings
3. Start the app:

```bash
docker compose up
```

Open http://localhost:3000 in your browser. Source changes are reflected immediately via hot reload.

- Run in background: `docker compose up -d`
- Stop: `docker compose down`

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Client SDK |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK |
| `EMAIL_*`, `CONTACT_EMAIL` | Contact form (Nodemailer) |
| `NEXT_PUBLIC_SITE_URL` | Base URL for sitemap / metadata |

---

## Future Extensibility

The architecture is designed for containerization and easy deployment. Docker-ready architecture is supported for future scaling and deployment automation.

---

## License

Private
