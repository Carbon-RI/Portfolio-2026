# Unused JavaScript Analysis — Home Page Initial Load

## Executive Summary

The home page loads ~157 KiB of JavaScript that is either **below-the-fold** (Works section) or **user-action dependent** (ContactModal, admin UI). Deferring these yields the largest reduction in initial bundle size.

---

## 1. Current Load Path (Non-Admin User)

```
Root Layout
├── Toaster (sonner) — always
├── Public Layout
│   ├── AuthProvider (Firebase deferred via requestIdleCallback ✓)
│   ├── Header → HeaderClient
│   └── Home Page
│       ├── Hero (Server) ✓
│       ├── HeroVisibilityController
│       ├── HomeLeftPanelWithObserver → HomeLeftPanel
│       │   └── NavLinks (minimal)
│       └── HomeRightPanel
│           └── Suspense → HomeRightPanelWithModal
│               ├── HomeRightPanel
│               │   ├── Profile: SocialIcons (inline SVG) ✓
│               │   ├── Profile: handleSave + toast (sonner) — used only when admin
│               │   ├── Works: ProjectListSection (dynamic, ssr: true) ⚠️
│               │   └── ContactModal — eager, shown only on email click ⚠️
│               └── ProjectEditModal (lazy) ✓ — admin only
```

---

## 2. Components Loaded Eagerly on Home

| Component | Est. Size | Used When | Deferrable? |
|-----------|-----------|-----------|-------------|
| **ProjectListSection** | ~40–60 KiB | Works section (below fold on mobile) | ✅ High impact |
| **ProjectCard** | (in ProjectListSection) | Each project in Works | Via ProjectListSection |
| **TechIconResolver** | ~5 KiB | Project tech badges | Via ProjectListSection |
| **tech-icons.ts** | ~25–35 KiB | 30+ react-icons (Fa*, Si*) | Via ProjectListSection |
| **EditProjectButton** | ~2 KiB | Admin only, in ProjectCard | Via ProjectListSection |
| **ContactModal** | ~3–5 KiB | Only when user clicks email | ✅ Easy win |
| **project-converter** | ~5 KiB | getAdminCardData (admin only) | ⚠️ Indirect |
| **sonner (toast)** | ~5–10 KiB | Admin save feedback, ContactModal success | ⚠️ Used by ContactModal |

---

## 3. Optimization Opportunities (Ranked by Impact)

### A. ProjectListSection — Defer until Works is in viewport

**Impact: ~50–80 KiB** (ProjectListSection + ProjectCard + TechIconResolver + tech-icons + EditProjectButton)

- **Current:** `dynamic(..., { ssr: true })` — included in initial bundle for hydration.
- **Issue:** Works section is below the fold on mobile (Hero → Profile → Works). Loading its JS at first paint is unnecessary.
- **Options:**
  1. **`ssr: false`** — Load when HomeRightPanel mounts. Works shows skeleton briefly. Simpler.
  2. **Intersection Observer** — Load only when Works section enters viewport. Best for LCP, more logic.

**Recommendation:** Start with (1). If Works is below fold, skeleton is acceptable.

---

### B. ContactModal — Lazy load on open

**Impact: ~5 KiB** (ContactModal + form logic)

- **Current:** Eager import in HomeRightPanel. Rendered only when `isEmailModalOpen` is true.
- **Fix:** `lazy(() => import("@/components/shared/ContactModal"))` and wrap in Suspense when rendering.
- **Risk:** Low. User clicks email → modal loads → no UX regression.

---

### C. Admin-only code in HomeRightPanel

**Impact: ~15–25 KiB** (EditableText, getAdminCardData, project-converter for admin paths)

- **Current:** HomeRightPanel imports EditableText (lazy ✓), project-converter, handleSave. For non-admin, Welcome block and EditableText are not rendered, but project-converter and some helpers are still in the tree.
- **Issue:** `getAdminCardData` and `project-converter` are pulled in because `displayProjects` can use them when `isAdmin`. For non-admin, `displayProjects = projects` and they are never called.
- **Fix:** Conditional import or split: `HomeRightPanelPublic` vs `HomeRightPanelAdmin`. Higher effort.

**Recommendation:** Defer until A and B are done. Gains are moderate relative to effort.

---

### D. Toaster (sonner)

**Impact: ~5–10 KiB**

- **Current:** In root layout, always loaded.
- **Usage:** ContactModal success, admin toast. For non-admin, first use is ContactModal success.
- **Fix:** Lazy Toaster or load only when first needed. Would require layout changes.
- **Recommendation:** Low priority; keep as-is for now.

---

## 4. Recommended Implementation Order

1. **ContactModal lazy** — Small change, clear win.
2. **ProjectListSection `ssr: false`** — Largest impact, simple config change.
3. **Optional: ProjectListSection + Intersection Observer** — Load only when Works enters viewport for additional savings.

---

## 5. Files to Modify

| File | Change |
|------|--------|
| `HomeRightPanel.tsx` | Lazy load ContactModal; wrap in Suspense when `isEmailModalOpen` |
| `HomeRightPanel.tsx` | ProjectListSection: `dynamic(..., { ssr: false })` |
| (Optional) | Add `WorksSectionLazy` wrapper with Intersection Observer around ProjectListSection |

---

## 6. Expected Outcome

- **Initial JS reduction:** ~55–90 KiB (roughly 35–55% of 157 KiB).
- **LCP:** Fewer competing network and parse requests during first paint.
- **TBT:** Less main-thread work during initial load.
