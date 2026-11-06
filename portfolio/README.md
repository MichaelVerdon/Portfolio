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
    ├── pages/          One component per page (Home, Projects, Skills, Contact)
    ├── components/     Reusable pieces (Navbar, ProjectCard, SkillCard, ContactCard)
    ├── data/           Site content as JSON, plus index.ts which types it
    ├── types/          TypeScript types for the content
    ├── assets/         Images imported by components (logo, photo)
    ├── styles/         CSS
    ├── utils/          Small helpers
    └── test/           Test setup and helpers
```

Tests sit next to the code they cover (`*.test.ts(x)`).

## Editing content

All content lives in `src/data/*.json`, so adding a project or skill needs no code changes:

- **Project:** add an entry to `projects.json` with `name`, `src`, `link`, `desc` and `tech`, and put its image in `public/projects/`.
- **Skill:** add `{ "name", "src" }` to the matching `skills*.json` file, with its icon in `public/languages`, `public/libraries` or `public/software`.

Use `"N/A"` as an image path to show a placeholder. The test suite checks every entry has its fields filled in, a valid link, a unique name, and an image file that exists, so `npm test` catches typos before they go live.

## Deployment

AWS Amplify builds from `amplify.yml` at the repo root: it installs, runs the tests, then builds. A failing test stops the deploy. GitHub Actions (`.github/workflows/ci.yml`) runs the type check, tests with coverage and build on every push and pull request.
