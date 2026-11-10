# Khuram Walayat | Personal portfolio

A responsive personal website for Dr Khuram Walayat. It presents computational mechanics research, scientific software and selected public tools. It uses plain HTML, CSS and JavaScript. The development server and build scripts use Node.js built-ins. There are no package dependencies or external font requests.

## Run locally

Install Node.js 20 or later. From this directory, run:

```powershell
npm run check
npm run dev
```

Open `http://127.0.0.1:3000`. Refresh the browser after editing a file. Press Ctrl+C to stop the server. If port 3000 is occupied, run:

```powershell
npm run dev -- --port 3001
```

No `npm install` is needed because the project has no dependencies.

If Node.js is available but `npm` is not on your PATH, use the scripts directly:

```powershell
node scripts/check.mjs
node scripts/dev.mjs
```

The equivalent build and production preview commands are `node scripts/build.mjs` and `node scripts/dev.mjs --dist`.

## Production build

```powershell
npm run build
npm start
```

The build validates the source and copies an explicit list of public files to `dist/`. The production preview also uses port 3000. Stop the development server before starting it, or pass `-- --port 3001`.

Only `index.html`, `styles.css`, `app.js` and the two SVG assets are public. Source scripts, this README and any future local notes are excluded. The build does not recursively delete directories. It stops if it finds unknown files in `dist/` so they can be reviewed.

## Vercel and GitHub

This folder is ready for a GitHub repository and a Vercel import. No repository was initialised and nothing was published during the local build. The account owner should complete authentication and deployment through the approved workflow.

Use these Vercel settings:

- Framework preset: Other.
- Build command: `npm run build`.
- Output directory: `dist`.
- Root directory: the root of this portfolio project.

`vercel.json` supplies the build settings and response headers. This website needs no API keys, environment variables, database or account connections. A GitHub import should include this project only. Do not upload the surrounding Applications folder or any CV files.

## Content and attribution

The public text is grounded in the candidate's existing Research CV and the reviewed public project evidence. No original CV was changed. The website does not include a CV download, full home address, telephone number, birth date, salary, referee details or private benchmark files.

- The CFD-DEM Closure Calculator credits Khuram Walayat for its physics specification and validation tests. Its interface credits AI assistance from Claude.
- Flow Race is an original project by Khuram Walayat built with AI assistance. It is identified as an arcade model, not a validated CFD solver.
- The linked AI evaluation study credits its questions, reference answers and grading to Khuram Walayat. Claude assisted with drafting and arithmetic checks. It is identified as a small public study.
- Research summaries distinguish published work from planned flight-data comparisons. They do not imply ownership of partner software or current university appointments.
- This portfolio's layout, SVG artwork and implementation were prepared with AI assistance. The SVG streamlines are illustrative artwork, not numerical results.

All public links are explicit in `index.html`. The website has no contact form, trackers, cookies, analytics, third-party scripts or font services.

## Structure

```text
index.html          Content, navigation and accessible native project details
styles.css          Responsive layout, typography, focus and reduced-motion styles
app.js              Optional mobile navigation and footer year
assets/             Original illustrative SVG and favicon
scripts/            Node-only development, build and validation commands
vercel.json         Static deployment configuration
dist/               Generated output; ignored by Git
```

The page and its research details work without JavaScript. The mobile menu progressively enhances the visible navigation. Narrative paragraphs stay justified on desktop and mobile. Automatic hyphenation is disabled on mobile. Headings and metadata remain left aligned.

## Verification

`npm run check` builds the site and checks internal anchors, referenced files, required metadata, private information exclusion, safe external-link attributes and JavaScript syntax. It then serves the built output on a temporary loopback port. It checks content types, file bytes, homepage access, HEAD requests and rejection of private paths and unsupported methods.

These checks do not substitute for a browser review. Before publication, review the page at desktop and narrow mobile widths. Use the keyboard to test the menu and project details. Check the public links and look for overflow at 320 pixels. No application credentials are needed to view this site.
