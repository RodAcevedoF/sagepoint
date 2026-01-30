# Plan: Shared Layout, Theme Extraction & App Cleanup

## 1. Extract theme to `src/common/theme.ts`
- Move the `createTheme(...)` block from `app/providers.tsx` into its own file
- Import it back in `providers.tsx`

## 2. Create generic `LinkButton` component — `src/common/components/LinkButton.tsx`
- Server-compatible: wraps Next.js `<Link>` styled as MUI `<Button>`
- Accepts `variant` (`contained` | `outlined` | `text`), `href`, `size`, `sx`, `children`
- Single component used across Navbar, Footer, and Hero CTA buttons

## 3. Create `src/common/layout/Navbar.tsx` (server component)
- No `'use client'` — static, no hooks
- Uses `LinkButton` for Sign In (text) and Get Started (contained)
- Fixed AppBar with frosted-glass style, SagePoint brand on the left

## 4. Create `src/common/layout/Footer.tsx` (server component)
- No `'use client'` — static
- Three-column layout: brand+tagline, quick links (via `LinkButton`), about text
- Copyright bar at bottom

## 5. Create `src/common/layout/index.ts`
- Re-exports `Navbar` and `Footer`

## 6. Update `src/app/layout.tsx`
- Import and render `<Navbar />` and `<Footer />` wrapping `{children}`
- This makes Navbar/Footer appear on ALL pages automatically

## 7. Simplify `src/features/landing/components/LandingPage.tsx`
- Remove inline Navbar, Footer, and `<Toolbar />` spacer (now in layout)
- Remove `AppBar`, `Link`, `Toolbar` MUI imports
- Keep Hero + Features sections only
- Hero CTA buttons use `LinkButton` instead of `onClick(() => router.push(...))`
- Remove `useRouter` (no longer needed — `useEffect` redirect for auth stays, navigation via `LinkButton`)

## 8. Clean up `/app` files
- `app/providers.tsx` — remove inline theme, import from `common/theme`
- `app/globals.css` — keep as-is (minimal reset)
- `app/page.tsx` — keep (thin wrapper for LandingPage)
- All other pages already thin wrappers — no changes needed

## Files summary
| File | Action |
|------|--------|
| `common/theme.ts` | **New** — extracted theme |
| `common/components/LinkButton.tsx` | **New** — generic nav button |
| `common/layout/Navbar.tsx` | **New** — server component |
| `common/layout/Footer.tsx` | **New** — server component |
| `common/layout/index.ts` | **New** — barrel export |
| `app/providers.tsx` | **Edit** — import theme |
| `app/layout.tsx` | **Edit** — add Navbar + Footer |
| `features/landing/components/LandingPage.tsx` | **Edit** — remove inline nav/footer |

## Verification
- `pnpm dev` from `apps/web`
- Visit `/` — Navbar + Hero + Features + Footer visible
- Visit `/login`, `/register` — Navbar + Footer still visible, page content in between
- Navbar buttons navigate correctly
- No `'use client'` in Navbar, Footer, or LinkButton
