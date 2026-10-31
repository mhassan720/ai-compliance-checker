# AI Compliance Checker

A free, browser-only self-assessment of AI systems against the **EU AI Act** (Regulation (EU) 2024/1689).

Answer a short screening that classifies the system's risk tier, then answer the questions that apply. You get:

- the EU AI Act risk tier (unacceptable, high, limited, minimal) with the reason
- an overall readiness score and a score per category
- a gap analysis with article references and a recommended action for each gap
- a three-phase remediation roadmap (30 / 90 / 180 days)
- a checklist of the documents you need to show for each applicable obligation
- export to PDF (print), JSON and CSV

Everything runs in the browser. Answers are stored only in `localStorage` and never uploaded.

## Question bank

| Part | Sections | Questions |
|---|---|---|
| Screening | — | 9 (not scored) |
| Assessment | 15 (Art. 4, 5, 9-15, 17, 20-21, 27, 43-49, 50, 53-55, 72-73) | 73, filtered by risk tier, role, GPAI and FRIA applicability |

The questions live in `assets/js/data/eu-ai-act.js`. Each question has an `id`, `text`, `ref` (article), `weight` (1-3), `guidance` (the recommended action) and an optional `na: true` to allow "Not applicable".

## Scoring

```
score = Σ(weight × answer value) ÷ Σ(weight) × 100
Yes = 1, Partially = 0.5, No = 0, Not applicable = excluded, unanswered = No
```

Gap severity depends on the question weight and the risk tier. The full rules are on the "How it works" page in the app and in `assets/js/engine.js`.

## Run locally

Open `index.html` in a browser. There is no build step and no dependencies.

## Publish on GitHub Pages

1. Create a new repository on GitHub, for example `ai-compliance-checker`.
2. From this folder, push the files:

   ```bash
   git init
   git add .
   git commit -m "Initial version of AI Compliance Checker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ai-compliance-checker.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/ai-compliance-checker/`.

The empty `.nojekyll` file tells GitHub Pages to serve the files as they are.

## Project structure

```
index.html                  page shell
assets/css/styles.css       styles (light and dark theme, print layout for PDF)
assets/js/data/eu-ai-act.js EU AI Act question bank and screening
assets/js/engine.js         risk classification and scoring (no DOM, testable in Node)
assets/js/app.js            interface and routing
```

## Disclaimer

This is a self-assessment aid. It does not provide legal advice, and a good score does not certify compliance.
