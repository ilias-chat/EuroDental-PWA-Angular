# EuroDental Mobile — Architecture

> **AI agents:** Read [INSTRUCTION.md](./INSTRUCTION.md) first — Angular/Ionic rules, anti-patterns, and checklists.

## Folder structure

```
src/app/
  core/                    # App-wide infrastructure
    auth/                  # AuthService, guards, HTTP interceptor
    models/                # TypeScript interfaces (task, user, catalog)
    services/              # HTTP API clients (split by domain)
  shared/                  # Reusable UI + pure utilities
    components/
      app-header/          # Shell header (back, notif, avatar)
      app-side-menu/       # Drawer opened from header avatar
    utils/
  core/services/
    app-side-menu.service.ts  # open/close signal for drawer
    theme.service.ts          # light/dark mode (localStorage + data-ed-theme)
  features/                # Feature screens (pages)
    auth/login/
    welcome/
    leave-requests/
      list/
      utils/              # labels, status badges, date helpers
    stock/
      list/
      utils/              # stockLevel, price format, pagination copy
    deplacement/
      modals/
      styles/
      utils/
      deplacement.facade.ts
      deplacement.page.ts
    tasks/
      list/
      shared/create-task-modal/  # Reusable create-task bottom sheet (tasks list + déplacement detail)
      detail/
        tabs/              # One component per task-detail tab
        modals/            # All task-detail ion-modals
        rules/             # Pure business rules (testable)
        styles/            # Global overlay SCSS for detail modals
        task-detail.facade.ts
        task-detail.page.ts
    tickets/
      list/                # Filters, pagination, create FAB + modal
      detail/              # Thread, reply/resolve modals, manager status
      styles/              # Shared + ticket-modals.global.scss
      utils/               # Status labels, badge classes
  layout/tabs/             # Tab shell
src/theme/                 # Design tokens
```

## Path aliases (`tsconfig.json`)

| Alias | Maps to |
|--------|---------|
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@features/*` | `src/app/features/*` |
| `@environments/*` | `src/environments/*` |

## Services (HTTP)

| Service | Responsibility |
|---------|----------------|
| `TaskApiService` | Tasks CRUD, events, description, create task, task types, client search |
| `TaskActionsService` | Progression POST (`start-route`, `finish`, …) |
| `TaskBillingService` | Payments, admin delivery, users list |
| `CatalogService` | Service catalog + task services + proposals |
| `ProductApiService` | Product catalog list (`GET /catalog/products`) for stock tab |
| `DeploymentApiService` | Deployments calendar, detail, expenses, events |
| `TicketApiService` | Tickets list, detail, create, replies, resolve, status (`GET/POST/PATCH /tickets`) |
| `TasksService` | Thin facade delegating to the above (legacy) |

## Task detail

- **`TaskDetailPage`** — shell: header, segments, tab host, FABs, modals host. Provides `TaskDetailFacade`.
- **`TaskDetailFacade`** — single `task` signal; `events` / `warranty` are computed from `task`. All API calls and modal state.
- **`rules/`** — progression buttons, team/timeline filters, action response merge (no Angular deps).
- **Tab components** — inject `TaskDetailFacade` as `f`.
- **Modal styles** — `detail/styles/task-detail-modals.global.scss` imported from `global.scss` (Ionic overlays).

## Styling

- **Tokens (single source for colors):** `src/theme/variables.scss` — feature SCSS uses `var(--ed-*)` only
- **App-wide:** `src/global.scss`
- **Task detail shell:** `task-detail.page.scss` (page `:host`, segment, `ion-content`)
- **Task detail content:** `task-detail.shared.scss` (tabs + modals — no `height: 100%` on `:host`)
- **Task detail ion-modals:** `detail/styles/task-detail-modals.global.scss` → imported from `global.scss`
- **Design spec:** `DESIGN.md`

## Routing

| Path | Page |
|------|------|
| `/login` | Login |
| `/tabs/tasks` | Tasks list (`mobile_tasks`, `mobile_tasks_read`, or `tasks_admin`; tab hidden + `tasksGuard`) |
| `/tabs/stock` | Stock (requires `mobile_stock` or `mobile_stock_read`; tab hidden + `stockGuard` + API 403 without permission) |
| `/tabs/deplacement` | Déplacements (`?date=YYYY-MM-DD`, `?view=month`; past incomplete deployments FAB → `GET /deployments/past/count` + lazy `GET /deployments/past`) |
| `/tabs/propose` | Propose task (`mobile_tasks_propose`) |
| `/tabs/tickets` | Tickets list (`tickets_create` or `tickets_manage`; tab hidden + `ticketsGuard`) |
| `/tasks/:id` | Task detail (full screen, `?tab=` query) |
| `/tickets/:id` | Ticket detail (thread, reply, resolve, manager status) |
| `/leave-requests` | Mes congés (side menu **Congés**) |
