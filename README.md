# Dario Farzati — Personal Website

Personal website for Dario Farzati ported from Claude Design Canvas to an **Astro SSG (Static Site Generator)** project.

Built with **Astro 7**, **TypeScript**, and **Bun**.

---

## ✨ Features

- **Static Site Generation (SSG)**: Fast, static HTML pages generated at build time.
- **Astro Content Collections**: Markdown-powered articles in `src/content/posts/` with type-safe frontmatter schema (`astro/zod`).
- **Client Router & View Transitions**: Seamless page transitions preserving theme state across navigations.
- **Dynamic Procedural Ambient Background**: Seeded deterministic multi-layer gradient background tailored to dark and light modes.
- **Themes & Easter Egg**:
  - **Dark & Light Modes**: High contrast, refined typography (`Onest`, `JetBrains Mono`).
  - **Hyperdimensional CGA Mode**: Press and hold the theme toggle for 1 second to trigger the retro IBM CGA mode with scanlines CRT overlay, pixelated portrait, blinking prompt cursor, and custom `WebPlus_IBM_CGA` font.
  - **WebGL2 Event-Horizon Warp**: Custom WebGL2 shader transition with chromatic diffraction, gravitational ripples, and hyperspace streaks when entering/exiting CGA mode.
- **Zero FOUC**: Inline head script prevents theme flicker on initial page paint.

---

## 🧭 Pages & Routes

- `/` — Home (Hero, About, Company / Sinumo, Recent Posts, Things I build)
- `/write` — Writing list
- `/write/[slug]` — Individual article view
- `/contact` — Contact details & channels
- `/privacy` — Privacy policy

---

## 🧞 Development with Bun

All commands use `bun`:

| Command | Action |
| :--- | :--- |
| `bun install` | Install dependencies |
| `bun dev` | Start development server at `http://localhost:4321` |
| `bun run build` | Build static SSG site to `./dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run astro check` | Run TypeScript & Astro diagnostics |

---

## 📁 Project Structure

```text
/
├── public/
│   ├── assets/        # Portraits, Sinumo logo, post illustrations
│   └── fonts/         # WebPlus_IBM_CGA.woff, Onest, JetBrains Mono
│   ├── favicon.svg    # Vector avatar icon
│   └── favicon.ico    # Multi-size fallback icon
├── src/
│   ├── components/    # Background, Nav, Footer, ThemeToggle
│   ├── content/
│   │   └── posts/     # Markdown articles
│   ├── content.config.ts # Content collections schema
│   ├── data/          # Projects/builds data
│   ├── layouts/       # Layout.astro with styles & client router
│   ├── pages/         # Static routes (/, /write, /contact, /privacy)
│   └── scripts/       # WebGL2 horizon shader & theme state logic
└── package.json
```
