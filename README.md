# EU AI Act Compliance Checker

A free, browser-only self-assessment of AI systems against the **EU AI Act** (Regulation (EU) 2024/1689).

Answer a short screening that classifies the system's risk tier, then answer the questions that apply to your tier and role. You get:

- an overall readiness score and a score per obligation area
- the EU AI Act risk tier (unacceptable, high, limited, minimal) with the reason
- a gap analysis with article references and a recommended action for each gap
- a three-phase remediation roadmap (30 / 90 / 180 days)
- a checklist of the documents you need to show for each applicable obligation
- export to PDF (print), JSON and CSV

Everything runs in the browser. Answers are stored only in `localStorage` and never uploaded.

## Question banks

| Bank | Sections | Questions |
|---|---|---|
| EU AI Act | 15 (Art. 4, 5, 9-15, 17, 20-21, 27, 43-49, 50, 53-55, 72-73) | 73, filtered by risk tier, role, GPAI and FRIA applicability |
| Runtime Assurance (optional) | 8 (policy records, per-decision guards, reasoning faithfulness, model integrity, audit trail, risk routing, trust states, re-certification) | 33 |
| Screening | — | 10 (not scored) |

## Runtime Assurance module

A checklist shows what is documented, not what the system does on each decision. When the screening question about decisions made at runtime is answered Yes, the Runtime Assurance module asks whether the obligations of Articles 10, 12, 13, 14 and 15 are enforced and evidenced on every decision. Its gaps are rated one level lower than legal gaps because it goes beyond the legal minimum.

The **Coverage** tab then shows how much of the assessment is enforced on paper (lifecycle), on every decision (runtime), by people (human oversight) and after release (continuous), and which runtime threats are still open.

The module is based on: M. Hassan, B. Sardar, S. Islam, S. Silvestri, F. Fiori, D. Di Stasio, D. Amelin, *Governing High-Risk AI at Runtime: Reasoning Guards, Behavioural Attestation and Trust-Based Remediation*.

The questions live in plain data files, so they are easy to edit:

- `assets/js/data/eu-ai-act.js`: EU sections, questions and screening
- `assets/js/data/runtime-assurance.js`: Runtime Assurance sections, questions and threat list

Each question has an `id`, `text`, `ref` (article), `weight` (1-3), `guidance` (the recommended action) and an optional `na: true` to allow "Not applicable".

## AI assistant (optional)

The results page can show an **AI Assistant** tab that writes a remediation plan and answers questions about the result. It calls a small backend on a Hugging Face Space (open Qwen 2.5 7B model). Set its address in `assets/js/config.js`; when `aiEndpoint` is empty the tab is hidden and nothing is ever sent.

Only the risk level, scores and top 15 gaps are sent, and only when the user clicks. The system name, organisation and notes are never sent.

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
assets/js/config.js         site settings (AI assistant address)
assets/js/data/eu-ai-act.js EU AI Act question bank and screening
assets/js/data/runtime-assurance.js Runtime Assurance question bank and threats
assets/js/engine.js         risk classification and scoring (no DOM, testable in Node)
assets/js/app.js            interface and routing
```

## Disclaimer

This is a self-assessment aid. It does not provide legal advice, and a good score does not certify compliance.
