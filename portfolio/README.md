# Portfolio app

React + TypeScript, built with [Vite](https://vite.dev) and tested with [Vitest](https://vitest.dev).

## Getting started

You need [Node.js](https://nodejs.org) 20 or newer (22 is what CI and Amplify use; see `.nvmrc`).

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
- **Project:** add an entry to `projects.json` with `name`, `src`, `link`, `desc` and `tech` (comma-separated, shown as tags; leave `link` as `""` until there is a public repo), and put its image in `public/projects/`. Add `"imageFit": "cover"` for screenshots that should fill the frame (logos are fitted inside it by default), and `"status": "To be released"` (or any short text) to show a badge. The first six projects are featured; the rest appear under "Show all".
- **Skill:** add `{ "name", "src" }` to the matching `skills*.json` file, with its icon in `public/languages`, `public/libraries` or `public/software`.

Use `"N/A"` as an image path to show the on-brand placeholder until you have an image. The test suite checks every entry has its fields filled in, a valid link, a unique name, and an image file that exists, so `npm test` catches typos before they go live.

## Design system

Colours, fonts and spacing are CSS variables in `src/styles/tokens.css`. Run the dev server and open `/style-guide` to see them all in one place.

## Deployment

AWS Amplify builds from `amplify.yml` at the repo root: it installs, runs the tests, then builds. A failing test stops the deploy. GitHub Actions (`.github/workflows/ci.yml`) runs the type check, tests with coverage and build on every push and pull request.
