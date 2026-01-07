# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Next.js App Router routes and layouts (e.g., `app/page.tsx`, `app/login/page.tsx`).
- `components/` contains page sections and shared UI; `components/ui/` is the shadcn-style component library.
- `hooks/` contains reusable React hooks.
- `lib/` is for shared utilities like `lib/utils.ts` (class name merging).
- `public/` stores static assets (icons, avatars, images).
- Global styles live in `app/globals.css` and `styles/globals.css`.

## Build, Test, and Development Commands
- `pnpm dev`: start the local dev server.
- `pnpm build`: create a production build.
- `pnpm start`: run the production build locally.
- `pnpm lint`: run ESLint across the repository.

## Coding Style & Naming Conventions
- TypeScript/TSX with React; 2-space indentation and no semicolons.
- Prefer existing patterns for import aliases (e.g., `@/components`, `@/lib`).
- Use Tailwind CSS for styling; merge class names with `cn()` from `lib/utils.ts`.
- Keep components in `PascalCase` and hooks in `useX` form (e.g., `use-toast.ts`).

## Testing Guidelines
- No automated tests are configured yet; there is no test runner or coverage gate.
- If adding tests, place them near the feature or under a new `__tests__/` folder and add a script in `package.json`.

## Commit & Pull Request Guidelines
- This workspace does not include Git history, so no commit convention is established.
- Use clear, imperative commit messages; consider Conventional Commits if you are creating history.
- PRs should describe the change, link related issues, and include screenshots for UI changes.

## Configuration & Tooling Notes
- Next.js settings are in `next.config.mjs`.
- shadcn configuration and aliases live in `components.json`.
- Tailwind and PostCSS config are in `app/globals.css` and `postcss.config.mjs`.

本项目请始终用中文跟用户交流