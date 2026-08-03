# EuroDental Mobile — Instructions for AI Agents

**Scope:** This file applies only to the **`angular-mobile`** Ionic/Angular app. Read it before any change in this folder.

**Companion docs:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — folders, services, routing
- [DESIGN.md](./DESIGN.md) — UI tokens, classes, Ionic patterns

**Stack:** Angular (standalone), Ionic 8, SCSS, Font Awesome 6, Capacitor-ready mobile UI.

---

## 1. Before you code

1. Read **ARCHITECTURE.md** and the relevant section of **DESIGN.md**.
2. **Search** `src/app/features/` and `src/app/shared/` for an existing pattern — reuse it.
3. **Minimal diff** — only what the task needs; no unrelated refactors.
4. **Do not commit or push** unless the user asks.
5. **Do not commit** `.env` or secrets.
6. After non-trivial changes, run: `npm run build` from this folder.

---

## 2. Angular conventions

### 2.1 Standalone components only

- Every component is **`standalone: true`** with explicit `imports: [...]`.
- Import Ionic pieces from **`@ionic/angular/standalone`** (e.g. `IonContent`, `IonModal`), not the legacy NgModule bundle.
- Pages are routed via lazy `loadComponent` in `src/app/app.routes.ts`.

### 2.2 State

- Use **`signal`**, **`computed`**, and **`inject()`** — not constructor DI for new code.
- Page-level orchestration: optional **facade** service (`@Injectable()` + `providers: [Facade]` on the page).
- Child tabs/modals **inject the same facade** — never duplicate task/UI state locally.

### 2.3 Templates

- Use built-in control flow: **`@if`**, **`@for`**, **`@switch`** — not `*ngIf` / `*ngFor`.
- Keep page templates **thin**; move blocks into feature child components.

### 2.4 Path aliases (required)

| Alias | Maps to |
|-------|---------|
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@environments/*` | `src/environments/*` |

Never use long relative imports like `../../../../core/...`.

### 2.5 Models & HTTP

- Types/interfaces → `src/app/core/models/`.
- HTTP → split services in `src/app/core/services/` (see ARCHITECTURE.md).
- **`TasksService`** is a legacy delegate — add methods to **`TaskApiService`**, **`TaskActionsService`**, **`TaskBillingService`**, or **`CatalogService`** instead.
- API base URL: `src/environments/environment.ts` (hosted: `https://mobile.eurodental.ma/api`; local: `http://127.0.0.1:8001/api`).
- Auth: Bearer token via existing interceptor — do not bypass it.

### 2.6 Business logic

- Pure rules (no Angular) → `rules/*.ts` next to the feature (e.g. task detail progression).
- Do not put complex `if` chains in templates — call facade methods or rule functions.

---

## 3. Ionic conventions

### 3.1 Page shell

Typical layout:

```html
<app-app-header [showBack]="true" [backHref]="..." />
<ion-content class="ed-content-padded">
  <div class="ed-page ed-page-stack">
    <!-- content -->
  </div>
</ion-content>
```

- **`ion-content`** + **`.ed-content-padded`** for scrollable pages.
- Inner layout: **`.ed-page`** or **`.ed-page-stack`** (see DESIGN.md).
- Header offset: pages with `app-app-header` rely on global `.has-app-header ion-content` styles.

### 3.2 Segments (tabs on one page)

- Use **`ion-segment`** + **`ion-segment-button`** with string `value`s.
- Bind `[value]` to a signal; handle **`(ionChange)`** and sync URL query params when needed (see task detail facade).
- Segment styles: page-level SCSS (`:host ::ng-deep .detail-segment`), not inside tab components.

### 3.3 Modals

- **`ion-modal`** is rendered in an **overlay** outside the component tree.
- Put all modals for a screen in one **`modals/*.component`** when there are many.
- Modal-specific SCSS → **`*.global.scss`** under the feature, imported from **`src/global.scss`**:

  ```scss
  @import './app/features/.../my-modal.global.scss';
  ```

  Paths from `src/global.scss` must start with **`./`**.

- Use `class="my-modal"` on `ion-modal` and target `ion-modal.my-modal` in the global partial.
- Sheet-style modals: `initialBreakpoint`, `breakpoints`, `::part(backdrop)` blur — follow existing task-detail modals.

### 3.4 Lists & refresh

- Pull-to-refresh: **`ion-refresher`** inside `ion-content` (pattern in tasks list).
- Prefer native **`<button type="button">`** with design-system classes over **`ion-button`** when DESIGN.md defines custom buttons (e.g. progression actions).

### 3.5 Toasts & loading

- Toasts: **`ToastController`** from `@ionic/angular/standalone` (see facade).
- Inline loading: **`ion-spinner`**; full-page loading state on the page shell, not duplicated in every tab.

### 3.6 Icons

- Font Awesome 6: **`<i class="fa-solid fa-...">`** with `aria-hidden="true"` when decorative.

---

## 4. Folder structure

```
src/app/
  core/           # auth, guards, interceptor, models, HTTP services
  shared/         # reusable components + utils (feature-agnostic)
  features/       # one folder per product area
    auth/login/
    welcome/
    tasks/list/
    tasks/detail/   # facade, tabs/, modals/, rules/, styles/
  layout/tabs/      # ion-tab-bar shell
src/theme/          # variables, elevation, host-surfaces, shell
src/global.scss     # utilities + global modal imports
```

**New screen checklist:**

- [ ] `src/app/features/<name>/`
- [ ] `*.page.ts` + `*.page.html` + SCSS (page-only `:host` if needed)
- [ ] Route in `app.routes.ts`
- [ ] Path aliases for imports
- [ ] French copy; `fr-FR` dates via `@shared/utils` helpers

---

## 5. Task detail (reference implementation)

| File | Role |
|------|------|
| `task-detail.page.ts` | Shell only; **`providers: [TaskDetailFacade]`** |
| `task-detail.facade.ts` | Signals, API, modals, toasts |
| `tabs/*` | `readonly f = inject(TaskDetailFacade)` |
| `modals/task-detail-modals.component.*` | All `ion-modal` templates |
| `rules/*` | Pure TS: buttons, filters, action merge |
| `task-detail.page.scss` | Page `:host` flex + segment + `ion-content` |
| `task-detail.shared.scss` | Tab/modal **content** styles |
| `styles/task-detail-modals.global.scss` | Overlay modal styles |

**Rules:**

- Tabs: `info` | `timeline` | `warranty` | `services` | `payments` — keep `?tab=` in sync.
- After progression actions: **`syncTaskProgress()`** / **`applyProgressionActionResult`** — do **not** call full **`load()`** unless necessary.
- Do **not** add `providers: [TaskDetailFacade]` on tab components.

---

## 6. Styling rules

| Layer | File |
|-------|------|
| **Tokens (single source)** | `src/theme/variables.scss` — all colors, shadows, gradients (`--ed-*`). Change the theme here only. |
| Global utilities | `src/global.scss` |
| Page shell | `*.page.scss` — may use `:host { display: flex; height: 100%; }` |
| Feature UI | `*.shared.scss` or component SCSS |
| Ionic overlays | `*.global.scss` → imported in `global.scss` |

**Critical:**

- **Never** apply `:host { height: 100%; }` on **tab** components inside **`ion-content`** — content becomes invisible.
- Tab hosts: `display: block; width: 100%;` only.
- Use **`var(--ed-*)`** and classes from DESIGN.md (`.ed-card`, `.ed-headline-md`, …). **No `#hex` or `rgba()` in feature/component SCSS** — add tokens in `variables.scss` first.
- White **surfaces** → `var(--ed-surface-container-lowest)`; white **text on colored buttons** → `var(--ed-on-primary)`.
- Card radius default: **`--ed-radius-card`** (2rem).
- Max width **560px**, centered (shell tokens).
- Page surfaces: `@include host-surfaces.apply-page-surfaces` in **page** `:host ::ng-deep`, not on every child.

---

## 7. UI copy & formatting

- **French** for all user-visible strings (labels, buttons, toasts, empty states).
- Dates: **`fr-FR`** (use `@shared/utils/task-status`, timeline helpers).
- Images: `resolveAvatarUrl` / `resolveStorageUrl` from `@shared/utils/asset-url`.

---

## 8. Routing

| Path | Component |
|------|-----------|
| `/login` | Login |
| `/tabs/tasks` | Tasks list (`?date=YYYY-MM-DD`) |
| `/tabs/welcome` | Welcome |
| `/tabs/deplacement` | Déplacements list (`?date=`, `?view=month`) |
| `/deplacement/:id` | Déplacement detail (`?tab=details|timeline|expenses|tasks`) |
| `/tasks/:id` | Task detail (`?tab=`) |

When opening task detail from the list, preserve **back href** with list date (`tasksListBackHref` pattern).

---

## 9. Anti-patterns

| Do not | Why |
|--------|-----|
| Monolithic page with huge template + SCSS | Use facade + tabs/modals |
| Second facade instance on children | Empty or stale tabs |
| `height: 100%` on tab `:host` in `ion-content` | Zero-height content |
| Modal styles only in encapsulated SCSS | Overlays won’t match design |
| `ion-button` where DESIGN defines native buttons | Inconsistent UI |
| New god-service | Use split Task* / Catalog services |
| `*ngIf` / NgModules | Outdated for this app |
| English UI strings | Product language is French |
| Extra markdown files per task | Update ARCHITECTURE / DESIGN instead |

---

## 10. Documentation updates

When adding a **lasting** pattern (new feature folder, global SCSS file, service split):

1. Update [ARCHITECTURE.md](./ARCHITECTURE.md) briefly.
2. Update [DESIGN.md](./DESIGN.md) only if the UI contract changes.

---

*When unsure, copy the nearest existing feature in `src/app/features/` before inventing a new structure.*
