# EuroDental Mobile — UI Design System

**Purpose:** This document is the authoritative UI specification for the `angular-mobile` Ionic/Angular app. When generating pages or components, follow these tokens, class names, and patterns exactly so new UI matches the existing product.

**AI agents:** See [INSTRUCTION.md](./INSTRUCTION.md) for Angular/Ionic rules and checklists.

**Code structure:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for folders, services, and task-detail layout.

**Stack:** Angular (standalone), Ionic 8, SCSS, Font Awesome 6 (`fa-solid`), Google Fonts.

**Source of truth files:**
- Tokens: `src/theme/variables.scss`
- Global utilities: `src/global.scss`
- Surfaces mixin: `src/theme/elevation.scss`, `src/theme/host-surfaces.scss`
- Shell width: `src/theme/shell.scss` (max-width `560px`, padding `20px`)

---

## 1. Design language

**Name:** Atmospheric Material + Soft UI

**Principles:**
- Light, airy surfaces on `#f9f9ff` background
- White elevated cards with soft shadow and `2rem` corner radius
- Primary brand blue `#0058bd` for actions, links, and selected states
- Rounded-full pills for chips, badges, and primary buttons
- Glass-style bottom sheets: frosted white modal panel, blur backdrop, drag handle
- Typography: body = **Be Vietnam Pro**; headings = **Plus Jakarta Sans**
- French UI copy; dates formatted `fr-FR`
- Touch targets ≥ 40–48px; active states use `scale(0.96–0.98)`
- Page content max-width **560px**, centered

---

## 2. CSS variables (always prefer these)

**Single source:** `src/theme/variables.scss` — all primitives and semantic tokens. Components use `var(--ed-*)` only (no hardcoded hex in feature SCSS).

**Dark theme:** `src/theme/theme-dark.scss` overrides tokens on `html[data-ed-theme='dark']`. Toggle via menu **Thème sombre** / **Thème clair** (`ThemeService`, persisted `ed_mobile_theme` in `localStorage`).

**Glass overlays (menu + modals):** use `--ed-glass-*` + `--ed-glass-blur` (translucent + blur). **Light theme:** white frost. **Dark theme:** dark frost (`theme-dark.scss`); cards/rows inside overlays use `ed-glass-card-material` in `theme-glass-overlay.scss` (not solid white).

Define in `:root` / use `var(--ed-*)`:

| Token | Value | Usage |
|--------|--------|--------|
| `--ed-primary` | `#0058bd` | Primary actions, links, selected tabs |
| `--ed-on-primary` | `#ffffff` | Text on primary |
| `--ed-primary-container` | `#2771df` | — |
| `--ed-primary-fixed` | `#d8e2ff` | Selected tab bg, chip tonal, selected service row |
| `--ed-surface` | `#f9f9ff` | App / ion-content background |
| `--ed-surface-container-lowest` | `#ffffff` | Cards, inputs on white |
| `--ed-surface-container` | `#ecedf7` | Segment track, tab bar bg |
| `--ed-surface-container-low` | `#f2f3fd` | Tonal areas, team footer (legacy), description block |
| `--ed-surface-container-highest` | `#e1e2eb` | Borders, dividers |
| `--ed-on-surface` | `#191b22` | Primary text |
| `--ed-on-surface-variant` | `#424753` | Secondary text |
| `--ed-outline` | `#727785` | Icons, placeholders |
| `--ed-outline-variant` | `#c2c6d5` | Input borders |
| `--ed-error` | `#ba1a1a` | Errors |
| `--ed-error-container` | `#ffdad6` | Error banners |
| `--ed-secondary` | `#006e2c` | Success / paid / warranty valid |
| `--ed-tertiary` | `#765700` | Pending service / proposition accent |
| `--ed-tertiary-fixed` | `#ffdea0` | Proposition chip background |
| `--ed-on-error` | `#93000a` | Text on error banners |
| `--ed-primary-shade` | `#004494` | Pressed primary buttons |
| `--ed-action-success` / `--ed-action-danger` / `--ed-action-warning` | see variables | Progression / FAB actions |
| `--ed-gradient-cta` | indigo → cyan | Primary gradient buttons |
| `--ed-chip-error-*` / `--ed-chip-info-*` | see variables | Status pills |
| `--ed-chip-stock-high-*` / `--ed-chip-stock-mid-*` / `--ed-chip-stock-low-*` | see variables | Stock quantity badges (stock list) |
| `--ed-primary-alpha-*` | rgba overlays | Focus rings, tinted backgrounds |
| `--ed-glass-surface-*` | rgba white | Modal chrome, frosted controls |

**Spacing:**

| Token | Value |
|--------|--------|
| `--ed-container-padding` | `20px` |
| `--ed-stack-sm` | `8px` |
| `--ed-stack-md` | `16px` |
| `--ed-stack-lg` | `24px` |
| `--ed-gutter` | `16px` |
| `--ed-safe-bottom` | `32px` |

**Radius:**

| Token | Value |
|--------|--------|
| `--ed-radius-sm` | `0.5rem` (8px) |
| `--ed-radius-md` | `1rem` (16px) |
| `--ed-radius-lg` | `1.5rem` (24px) |
| `--ed-radius-xl` | `2rem` (32px) |
| `--ed-radius-card` | `2rem` (32px) — **default card radius** |
| `--ed-radius-full` | `9999px` |

**Elevation:**

```css
--ed-soft-ui-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
```

**Shell:**

| Token | Value |
|--------|--------|
| `--ed-shell-height` | `72px` (header row) |
| `--ed-header-control-size` | `48px` |
| `--app-header-height` | `calc(72px + safe-area-top)` |
| `--ed-tab-bar-block-height` | computed (~60px + safe bottom) |

---

## 3. Typography

### Font families
- **Body / UI:** `'Be Vietnam Pro', system-ui, sans-serif` → `--ion-font-family`
- **Headings:** `'Plus Jakarta Sans', sans-serif`

### Scale (use utility classes)

| Class | Font | Size / line-height | Weight | Color |
|--------|------|---------------------|--------|--------|
| `.ed-headline` | Plus Jakarta | 28px / 36px | 700 | `--ed-on-surface` |
| `.ed-headline-md` | Plus Jakarta | 20px / 28px | 600 | `--ed-on-surface` |
| `.ed-body-lg` | Be Vietnam | 16px / 24px | 400 | default |
| `.ed-body-md` | Be Vietnam | 14px / 20px | 400 | `--ed-on-surface-variant` |
| `.ed-label` | Be Vietnam | 12px | 600 | `--ed-on-surface-variant` |
| | | letter-spacing `0.05em`, **uppercase** | | |
| `.ed-type-label` | Be Vietnam | 12px | 600 | `--ed-primary` |
| | | letter-spacing `0.04em`, uppercase | | |

### Section titles
- Use `.section-label.ed-label` for block titles (e.g. "Services fournis", "Équipe d'intervention")
- Modal titles: `.services-picker-title` — Plus Jakarta 18px/700

### Form labels
- Uppercase 12px, weight 600, letter-spacing `0.04em` — classes: `.ed-label`, `.payment-modal-label`, `.propose-service-label`

---

## 4. Page layout

```html
<app-app-header /> <!-- optional back, notif, avatar -->
<div class="detail-segment-bar">...</div> <!-- task detail only -->
<ion-content class="detail-content ed-content-padded">
  <div class="ed-page ed-page-stack tab-panel">
  </div>
</ion-content>
```

**`.ed-page`**
- padding: `20px` horizontal, top `16px`, bottom `tab-bar-height + 16px`
- max-width: `560px`, margin auto

**`.ed-page-stack`**
- flex column, gap `24px`

**`.ed-content-padded`**
- ion-content with `--padding-start/end: 0` (page handles horizontal padding)

---

## 5. Cards & surfaces

### Elevated card (default)
Apply class **`ed-card`** + host surface mixin on page (`host-surfaces`).

```scss
// elevation.scss mixin ed-elevated-surface
background: #ffffff;
border-radius: 2rem; // --ed-radius-card
border: 1px solid #e1e2eb;
box-shadow: var(--ed-soft-ui-shadow);
```

**Padding:** `20px` default on `.ed-card`; override per context (e.g. `16px` payment cards, `0` list cards).

### Tonal card
**`.ed-card-tonal`** — background `--ed-surface-container-low`, no border/shadow.

### Task list card
**`.task-card`** > **`.task-card-inner`**
- inner padding: `16px 18px`, gap `12px`
- title: `.task-card-title` — Plus Jakarta 18px/700, max 2 lines
- type: `.ed-type-label.task-card-type`
- active: `transform: scale(0.985)`

### List inside card (no outer padding)
**`.service-list-card`**, **`.team-card`** with `padding: 0; overflow: hidden`
- rows: `.service-list-row` — padding `16px 20px`, border-bottom `1px solid #e1e2eb`

---

## 6. Buttons

### Primary (gradient) — Ionic
**`ion-button.ed-btn-primary`**
- height: `52px`
- border-radius: full
- background: `linear-gradient(135deg, #4338ca 0%, #0891b2 100%)`
- shadow: `0 8px 28px rgba(67, 56, 202, 0.28)`
- font: 15px/600, white, no uppercase
- Use for: login submit, main task actions (terminer, démarrer visite)

### Secondary — Ionic
**`ion-button.ed-btn-secondary`**
- height: `48px`, full radius
- white/light bg, border `1.5px solid --ed-outline-variant`

### Solid primary (no gradient) — native
**`button.payment-tab-btn`** (in-card payment actions)
- width 100%, flex center, gap `14px`
- padding `12px 20px`, radius full
- background: `#0058bd` (solid), white text 15px/600
- shadow: `0 4px 14px rgba(0, 88, 189, 0.2)`
- active: `scale(0.98)`, bg `#004494`

### Modal save — native
**`button.services-picker-save`** / **`button.payment-modal-save`**
- width 100%, min-height `52px`, padding `14px 24px`
- radius full, Plus Jakarta 16px/700, white
- **Picker save:** gradient `#4338ca → #0891b2`, shadow `0 10px 28px rgba(67,56,202,0.28)`
- **Payment save:** solid `#0058bd`, shadow `0 4px 14px rgba(0,88,189,0.22)`
- disabled: opacity `0.65`

### Header controls
- **`.back-btn`**, **`.notif-btn`**: 48×48, circular, white bg, border `#e1e2eb`, soft shadow, primary icon color
- **`.avatar-btn`**: 48×48 circle, 2px white border on image

### Link style
**`.link-btn`**, **`.timeline-more-link`**: no border, `--ed-primary`, 600 weight

---

## 7. Chips & filter pills

### Generic chip
**`.ed-chip`** — white bg, primary text, border `#e1e2eb`, full radius, 12px uppercase label

### Primary tonal chip
**`.ed-chip-primary`** — bg `--ed-primary-fixed`, no shadow

### Task count (tasks list header)
**`.task-count-chip`** — gradient `#d8e2ff → #eef2ff`, border `rgba(0,88,189,0.2)`, primary text

### Stock quantity (stock list)
**`.stock-badge`** with modifiers **`--high`** (>10), **`--medium`** (>5), **`--low`** (else). Tokens: `--ed-chip-stock-high-*`, `--ed-chip-stock-mid-*`, `--ed-chip-stock-low-*`. Logic: `stockLevel()` in `features/stock/utils/stock-display.ts` (matches Laravel mobile Blade).

### Team filter (timeline)
**`.team-filter-tout`** — pill, active: **`.team-filter-tout--active`**
**`.team-filter-avatar`** — circular 52px avatar button, active ring

---

## 8. Status badges (`app-task-status-badge`)

Component: inline styles from `TASK_STATUS_STYLES` in `task-status.ts`.

### Variant `pill` (list contexts)
- padding `8px 14px`, radius `9999px`
- font 11px/600, uppercase, letter-spacing `0.05em`
- optional `.pulse-dot` for active states
- optional urgent: `fa-exclamation-triangle`

### Variant `card` (task detail summary)
- padding `8px 16px`, radius `--ed-radius-md` (16px)
- border `1.5px solid`, font 14px/600, **no uppercase**

### Status colors (bg / text / border)

| Status | bg | text | border |
|--------|-----|------|--------|
| `en cours` | `#fef9c3` | `#a16207` | `#eab308` |
| `en route` | `#ffedd5` | `#c2410c` | `#f97316` |
| `en pause` | `#dcfce7` | `#15803d` | `#22c55e` |
| `terminée` | `#dbeafe` | `#1d4ed8` | `#3b82f6` |
| `en attente` | `#fee2e2` | `#b91c1c` | `#ef4444` |
| `annulée` | `#f3e8ff` | `#7e22ce` | `#a855f7` |

---

## 9. Info / payment / warranty pills

Base: **`.info-pill`** — inline-flex, gap 8px, padding `8px 14px`, radius full, 13px/600

| Class | Background | Text / border |
|--------|------------|----------------|
| `.info-pill.success` | `rgba(0,110,44,0.12)` | `--ed-secondary` |
| `.info-pill.warn` | `rgba(186,26,26,0.1)` | `--ed-error` |
| `.info-pill.unpaid-chip` | `#fef2f2` | `#b91c1c`, border `#fecaca` |
| `.info-pill.paid-chip` | success + border `rgba(0,110,44,0.25)` | |
| `.info-pill.admin` | `rgba(0,88,189,0.1)` | primary |
| `.info-pill.admin-amount-chip` | `#eff6ff` | `#1d4ed8`, border `#bfdbfe` |

**Payment tab badge** (top-right of card): `.payment-tab-badge` — absolute `top/right: 16px`

**Info badge (modals):** `.payment-modal-info-badge`
- pill shape, padding `12px 14px`, 12px/500
- color primary, bg `rgba(0,88,189,0.1)`, border `rgba(0,88,189,0.22)`

---

## 10. Warranty status (product cards)

Logic in `warranty-ui.ts`; colors from `warrantyStatusClass`:

| Condition | Label | Icon | bg | text |
|-----------|--------|------|-----|------|
| days_left ≤ 0 | EXPIRÉE | `fa-circle-xmark` | `#fee2e2` | `#b91c1c` |
| days_left ≤ 30 | EXPIRATION PROCHE | `fa-triangle-exclamation` | `#ffedd5` | `#c2410c` |
| else | VALIDE | `fa-circle-check` | `#dcfce7` | `#15803d` |

**`.warranty-card`**: padding 18px 20px, progress bar 4px track, status icon circle 40px with dynamic colors

---

## 11. Forms & inputs

### Soft well (login)
**`.ed-soft-well`** wrapping `ion-input`
- bg `--ed-surface-container-low`, radius `--ed-radius-md`, inset shadow
- focus: border primary + ring `rgba(0,88,189,0.12)`

### Glass search/input (modals)
**`.services-picker-search-input`**, **`.payment-modal-control`**
- border `1px solid #c2c6d5`, radius `1rem`
- padding `12px 14px` (+ left `40px` if search icon)
- bg `rgba(255,255,255,0.38–0.72)`, optional `backdrop-filter: blur(12px)`
- focus: border/outline primary

### Field layout (payment modals)
```html
<div class="payment-modal-form"> <!-- gap 20px -->
  <div class="payment-modal-field"> <!-- gap 10px -->
    <label class="payment-modal-label ed-label">...</label>
    <input class="payment-modal-control" />
  </div>
</div>
```

---

## 12. Modals (Ionic `ion-modal`)

**Pattern:** Bottom sheet with glass panel. Always use **`services-picker-modal`** class family unless noted.

### Shared shell structure
```html
<ion-modal class="services-picker-modal [modifier]">
  <ng-template>
    <div class="services-picker-shell">
      <div class="services-picker-handle" aria-hidden="true"></div>
      <header class="services-picker-header">
        <h2 class="services-picker-title">Title</h2>
        <button type="button" class="services-picker-close">...</button>
      </header>
      <div class="services-picker-scroll">...</div>
      <div class="services-picker-footer">
        <button class="services-picker-save">...</button>
      </div>
    </div>
  </ng-template>
</ion-modal>
```

### Backdrop & panel (default picker)
- backdrop: `rgba(25,27,34,0.22)` + `blur(18px)`
- panel: height **85vh**, top radius `--ed-radius-xl`, bottom flush
- panel bg: `rgba(255,255,255,0.48)` + `blur(32px) saturate(1.6)`
- top border: `1px solid rgba(255,255,255,0.55)`

### Handle
**`.services-picker-handle`**: 48×5px, centered, primary blue 55% opacity, full radius

### Close button
**`.services-picker-close`**: 40×40 circle, frosted white, primary icon, soft shadow

### Footer
**`.services-picker-footer`**: absolute bottom (full picker) or static (short modals); frosted bar `rgba(255,255,255,0.55)` + blur, top border

### Modal variants

| Class | Height | Notes |
|--------|--------|--------|
| `.services-picker-modal` | 85vh | Service multi-select |
| `.propose-service-modal` | max 55vh | Single field + save |
| `.description-edit-modal` | 85vh | Toolbar + textarea |
| `.proposition-details-modal` | max 65vh | No footer |
| `.client-payment-modal`, `.admin-delivery-modal`, `.delivery-received-modal` | max 64vh | Payment forms; static footer |
| `.past-tasks-modal` | 95vh | Reuses task cards in scroll |

### Service picker row
**`.service-picker-card`** / **`--selected`**
- checkbox 22px, selected: primary fill
- selected row: border `rgba(0,88,189,0.35)`, bg `--ed-primary-fixed`

---

## 13. Segmented control (task detail tabs)

Container: **`.detail-segment`** (horizontal scroll, gap 8px)

**`ion-segment-button`** (custom overrides):
- unchecked: bg `--ed-surface-container`, text `--ed-on-surface-variant`
- checked: bg **`#0058bd`**, text **white**
- min-height **42px**, padding horizontal **18px**, radius **full**, 14px/600
- no indicator shadow (hidden)

**URL:** tab stored as query `?tab=info|timeline|warranty|services|payments`

---

## 14. Default ion-segment (legacy/global)
- track: `--ed-surface-container`, padding 4px, full radius
- indicator: white pill with soft shadow
- label: 11px/600, checked color primary

---

## 15. Bottom tab bar

Tabs: **Accueil** (`/tabs/welcome`), **Tâches** (`/tabs/tasks`), **Stock** (`/tabs/stock`, `cube-outline`).

**`ion-tab-bar.app-tab-bar`**
- bg `--ed-surface-container`, top border `#e1e2eb`
- top corner radius `--ed-radius-xl`, shadow `0 -4px 20px rgba(0,0,0,0.05)`
- label 12px/600

**Selected tab:**
- bg `--ed-primary-fixed`, border `#e1e2eb`, primary color, soft shadow
- icon 20px

---

## 16. App header

**`.app-header`** — transparent toolbar, inner max-width 560px
- back / notif: 48px circular elevated controls
- notification badge: 18px circle, `--ed-error` bg, white 12px bold text

---

## 17. Floating action buttons (FAB)

| Class | Size | Style |
|--------|------|--------|
| `.calendar-fab` | 56×56 | radius 16px, gradient `#3b82f6 → #2cbee8`, shadow blue |
| `.past-tasks-fab` | 56×56 | radius 16px, gradient `#f97316 → #ef4444`, may show count |
| `.past-deployments-fab` | 56×56 | same as past-tasks FAB; déplacement list only |
| `.services-fab` | 56×56 | circle, propose: amber gradient, manage: blue gradient |
| Position | | `right: 20px`, above tab bar `bottom: tab-bar-height + 16px` |

---

## 18. Avatars (`app-user-avatar`)

| Size | Dimensions | Border |
|------|------------|--------|
| `md` (default) | 40×40 | 3px white + shadow |
| `sm` | 32×32 | same |
| `.highlight` | | 2px outline primary, offset 1px |

Stacked team: overlapping `-10px` margin-left, white 2px ring on overflow badge

---

## 19. Empty & restricted states

### Empty box
**`.ed-card.empty-box`**
- flex column, center align, padding `32px 20px`
- **`.empty-box__icon`**: 56×56 circle, light primary tint, icon 28px centered

### Restricted access (non-main technician)
**`.ed-card.ed-restricted-card`**
- centered, padding `32px 24px`, gap 14px
- **`.ed-restricted-card__icon`**: 56×56 circle, primary tint (same as empty icon treatment)
- **`.ed-restricted-card__text`**: max-width 300px, 14px body variant

### Center empty (tasks list)
**`.ed-card.center-state.empty`** + **`.empty-icon-wrap`** 64×64 rounded-lg primary-fixed bg

### Empty hint (tasks list)
**`.empty-hint`**: left-aligned info callout, primary border/bg tint (not the restricted card)

---

## 20. Timeline

**`.timeline-card`** with vertical line `4px` at left `16px`

**`.timeline-icon`**: 36×36 circle, white icon, dynamic bg from event meta:

| Event | Color |
|--------|--------|
| finish_task | `#3b82f6` |
| finish_visit | `#ef4444` |
| start_route | `#f97316` |
| end_route | `#727785` |
| start_visit / resume_visit | `#eab308` |
| pause_visit | `#22c55e` |
| cancel_task | `#a855f7` |

**`.timeline-event-title`**: Plus Jakarta 15px/700  
**`.timeline-author-pill`**: small avatar pill on tonal bg

---

## 21. Team section (task detail)

- Lead: **`.team-lead`** flex row, 40px avatar, **`.lead-name`** 16px/600
- Helpers: **`.team-helpers-list`** with **`.team-helper-row`** — divider between rows, 14px gap, 12px vertical padding
- Section label "Assistants" with top border separator

---

## 22. Payments tab layout

- Stacked card rows: title → hint → **`payment-tab-btn`** (full width)
- Admin card shows amount chip + delivery task ref + receiver line
- Main tech only sees content; helpers see **`ed-restricted-card`** only

---

## 23. Services tab

- Section header `.services-section-header` + `.section-label`
- Approved rows: green circle icon `fa-circle-check`
- Pending rows: amber `fa-lightbulb`, italic subtitle, info button top-right
- FABs when main technician + active task

---

## 24. Calendar (tasks list month view)

- Nav buttons 48×48, white elevated
- Day cells 56px height, radius 10px, border `#e1e2eb`
- Today: `2px solid primary`, light primary bg
- Status dots 6×6 circles (colors match task status palette)
- Legend: 10px dots + 11px/600 labels

---

## 25. Error banners

**`.error-banner`**
- bg `--ed-error-container`, text `#93000a`
- padding `12px 14px`, radius `--ed-radius-md`, flex row with icon

---

## 26. Login / welcome

**Login:** radial gradient hero on `--ed-surface`, centered card max 440px, logo in elevated **`logo-wrap`**

**Welcome:** gradient hero, user card with 72px avatar in **`avatar-ring`**

---

## 27. Icons

- Library: **Font Awesome 6 Free** (`fa-solid` prefix)
- Common: `fa-xmark`, `fa-magnifying-glass`, `fa-circle-check`, `fa-lightbulb`, `fa-hand-holding-dollar`, `fa-building-columns`, `fa-shield-halved`, `fa-user-shield`, `fa-circle-info`

---

## 28. Ionic component defaults

```scss
ion-content { --background: var(--ed-surface); }
ion-toolbar { --background: var(--ed-surface-container-lowest); }
ion-back-button { --color: var(--ed-primary); font-weight: 600; }
```

Use **`ion-button`** only with `ed-btn-primary` / `ed-btn-secondary` — prefer native `<button>` for modal saves and payment tab actions when solid style is required.

---

## 29. Page generation checklist (for AI)

When building a new screen:

1. Wrap content in **`.ed-page`** or **`.ed-page.ed-page-stack`** inside **`ion-content.ed-content-padded`**
2. Use **`ed-card`** for grouped content; list rows inside with `padding: 0` + row dividers
3. Headings: **`.ed-headline-md`** or **`.section-label.ed-label`**
4. Body: **`.ed-body-md`**
5. Primary CTA: **`ion-button.expand="block".ed-btn-primary`**
6. Secondary: **`ed-btn-secondary`**
7. Status: **`<app-task-status-badge variant="card|pill">`**
8. Pickers/actions sheet: copy **`services-picker-modal`** structure from task detail
9. Empty state: **`ed-card.empty-box`** + **`empty-box__icon`**
10. Permission denied: **`ed-card.ed-restricted-card`**
11. Do not invent new colors — map to status table or `--ed-*` tokens
12. Max width **560px**; respect **safe-area** on footer/tab bar/modals
13. Active/press: **`transform: scale(0.96–0.98)`** on buttons

---

## 30. Anti-patterns (do not use)

- Bootstrap/default Ionic blue (`#3880ff`) — use `#0058bd`
- Sharp 4–8px card corners on main content — use **`2rem`**
- Uppercase body paragraphs
- Gradient on in-card payment buttons (use solid `#0058bd`)
- Centered modal dialogs with dark scrim only (use glass bottom sheet pattern)
- Mixing Roboto or system default for headings — use **Plus Jakarta Sans**

---

## 31. Tickets

**List (`/tabs/tickets`):** status filter chips (Tous, En attente, En cours, Résolus), paginated cards, FAB + bottom sheet to create (subject, body, optional image).

**Detail (`/tickets/:id`):** back header, status badge, manager status `<select>`, message thread with avatars/attachments, reply + resolve actions.

**Classes:** `ticket-card`, `ticket-status-filter`, `ticket-status-filter--active`, `ticket-status-badge--open|in_progress|solved`, `ticket-primary-btn`, `ticket-outline-btn`, `ticket-create-fab`, `ticket-form-modal` (reuses `services-picker-modal` shell).

**Modals:** `ticket-modals.global.scss` imported from `global.scss` (reply + resolve confirm).

**Permissions:** `tickets_create` (own tickets + create), `tickets_manage` (all tickets + status).

---

## 32. Create task (shared modal)

**Component:** `app-create-task-modal` — glass bottom sheet (`services-picker-modal` + `description-edit-modal` + `create-task-modal`).

**Used on:** tasks list (`task-create-fab`, date prefilled from selected day) and déplacement detail tasks tab (FAB when responsible + `deployment_write`; `deployment_id` + deployment date prefilled).

**Fields:** task name, type, date, client search, optional description. Save: `button.services-picker-save`.

**Styles:** `features/tasks/shared/create-task-modal/styles/create-task-modal.global.scss` → `global.scss`.

**Permission (tasks list FAB):** `mobile_tasks_write`.

---

*Last synced with codebase: EuroDental `angular-mobile` (Ionic Angular). Update this file when changing `variables.scss` or `global.scss`.*
