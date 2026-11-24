# Portfolio app

React + TypeScript, built with [Vite](https://vite.dev) and tested with [Vitest](https://vitest.dev).

## Getting started

You need [Node.js](https://nodejs.org) 22.12 or newer (22 is what CI and Amplify use; see `.nvmrc`). Check with `node -v`.

Security headers and the AWS firewall setup are described in [`docs/security.md`](../docs/security.md).

```bash
cd portfolio
npm install      # first time, and after package.json changes
npm run dev      # starts the site at http://localhost:3000 and opens it
```

Edits to files in `src/` show up in the browser straight away.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` (or `npm start`) | Local dev server with hot reload |
| `npm test` | Runs the whole test suite once |
| `npm run test:watch` | Re-runs tests as you edit |
| `npm run test:coverage` | Tests plus a coverage report; fails below 90% |
| `npm run typecheck` | TypeScript check with no output |
| `npm run build` | Type-checks, then builds the site into `build/` |
| `npm run preview` | Serves the built `build/` folder to check a production build |

## Project layout

```
portfolio/
├── index.html          Page shell (Vite entry point)
├── public/             Static files served as-is (project, skill and contact images)
└── src/
    ├── main.tsx        App bootstrap (router, global styles)
    ├── App.tsx         Routes
    ├── pages/          Home (the story page) and StyleGuide (/style-guide)
    ├── components/
    │   ├── layout/     Navbar and Footer
    │   ├── sections/   Hero, Story, Projects, Skills, Contact
    │   └── geometry/   SVG visuals: PixelSteps, PixelField, OrbitRings
    ├── data/           Site content as JSON, plus index.ts which types it
    ├── types/          TypeScript types for the content
    ├── assets/         Images imported by components (logo, photo)
    ├── styles/         CSS
    ├── utils/          Small helpers
    └── test/           Test setup and helpers
```

Tests sit next to the code they cover (`*.test.ts(x)`).

## Editing content

All content lives in `src/data/*.json`, so updating the site needs no code changes:

- **Your story:** `about.json` holds the hero headline, intro, the things that drive you, and the timeline (add a step with `label`, `title`, `place` and `text`).
- **Project:** add an entry to `projects.json` with `name`, `src`, `link`, `desc` and `tech` (comma-separated, shown as tags; leave `link` as `""` until there is a public repo), and put its image in `public/projects/`. Add `"imageFit": "cover"` for screenshots that should fill the frame (logos are fitted inside it by default), `"status": "To be released"` (or any short text) to show a badge, and `"demo": "https://..."` to add a "See it live" button. The first six projects are featured; the rest appear under "Show all".
- **Skill:** add `{ "name", "src" }` to the matching `skills*.json` file, with its icon in `public/languages`, `public/libraries` or `public/software`.

Use `"N/A"` as an image path to show the on-brand placeholder until you have an image. The test suite checks every entry has its fields filled in, a valid link, a unique name, and an image file that exists, so `npm test` catches typos before they go live.

## 3D story (WebGL)

A fixed three.js canvas sits behind the page (`src/webgl/`). Several hundred rounded cubes, the logo's pixels, fly between formations as you scroll: the logo mark in the hero, one shape per story step, a rippling floor behind the projects, orbit rings for skills, and the logo again at the end.

- Each story step picks its shape with `"scene"` in `src/data/about.json` (`sphere`, `steps`, `network`, `monolith`, `field`, `orbit`, `logo`). Sections pick theirs with a `data-scene` attribute. Positions and captions live in `src/webgl/chapters.ts`.
- Curly violet strands (after the curly tubes on lusion.co) sweep in from a different edge for each heading marked `data-underline`, curl, run flat under it, then flow off and erase as you scroll (`src/webgl/strands.ts`). Icosahedrons and a starfield drift behind at different depths. When 3D is off, those headings get a plain CSS underline instead.
- Early-2000s console menus are the mood, not a copy: on the first visit of a session the cubes gather into one glowing block and burst into the logo (`bootCore`, skipped if the page opens part-way down), the background is a deep blue void with rising light motes, the projects sit over glassy towers of cubes, and nav items light up with a small spinning cube on hover.
- three.js is lazy-loaded after the first paint, in its own chunk, so the first load is unchanged.
- Phones, tablets and modest laptops get a lighter scene. Reduced motion, data saver, very low-end devices and browsers without WebGL get no 3D; the 2D pixel canvas and drawings show instead.
- Add `?webgl=full`, `?webgl=lite` or `?webgl=off` to the URL to check each version.

## Design system

Colours, fonts and spacing are CSS variables in `src/styles/tokens.css`. Run the dev server and open `/style-guide` to see them all in one place.

## Deployment

AWS Amplify builds from `amplify.yml` at the repo root: it installs, runs the tests, then builds. A failing test stops the deploy. GitHub Actions (`.github/workflows/ci.yml`) runs the type check, tests with coverage and build on every push and pull request.
