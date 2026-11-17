# Codex project instructions — renthouse-gjx

## Project objective
Maintain a static, privacy-conscious, client-side web app that lets users fill in tenancy-agreement details, generate an unsigned tenancy PDF matching the approved template with 9 agreement pages and up to 3 photo pages, preview it, and download it.

## Architecture
- `index.html` — form structure and field groups
- `styles.css` — responsive UI
- `app.js` — form wiring, validation, photo loading, PDF generation/download
- `pdfwriter.mjs` — standalone browser PDF writer
- `photo-layout.mjs` — photo allocation / sizing logic
- `utils.mjs` — date, monetary, formatting utilities
- `assets/blank-tenancy-template.pdf`, `assets/page-01.png` to `assets/page-12.png` — sanitized page backgrounds
- `.github/workflows/deploy.yml` — deploy static site to GitHub Pages on push to `main`.

No backend, database, Node build step, secret, user authentication, telemetry, or external JS CDN is required. Development: `python3 -m http.server 8000` and visit `http://localhost:8000`.

## Must preserve
1. Flow: fill form → generate local PDF → preview PDF → download PDF.
2. Page count 9–12, A4-compatible: omit empty photo appendix pages. Page 13 of the source contract was a historical stamping certificate and must never be copied into new agreements.
3. Dates on both page 1 and page 2 must reflect the form's agreement date, while First Schedule dates/duration match the form and computed term.
4. Page 7 has unsigned signature lines; NEVER reproduce original signatures. Witness names/IDs must follow form inputs (including the option to use the same witness twice).
5. Page 9 inventory table and border alignment must not break. Verify visually after any table changes.
6. Pages 10–12 are property photo appendix pages. Accept at most 10 JPG/PNG images, in upload order. Keep their original proportions and fit WITHOUT cropping or stretching. Required arrangements: 7→4/2/1, 8→4/2/2, 9→4/4/1, 10→4/4/2; single photos centered, two stacked, four in 2×2.
7. Never embed the original signed PDF, former tenants' names/NRICs, financial account numbers, signatures, interior photographs or filled agreements in this PUBLIC GitHub repository. Keep assets sanitized and form data entirely within the visitor's browser. Never persist sensitive values or upload them to services.
8. Avoid silent legal edits; flag unclear source clauses to the user. This is a PDF template tool, not legal advice.

## Testing and quality gates
- Run `node --test` or `node tests/utils.test.mjs` if tests are available (some earlier visual test artifacts were intentionally omitted from the public repository).
- Test in Chromium or equivalent against a locally served HTTP URL, not a `file://` origin.
- Exercise the Generate, Preview and Download buttons with **fictional** names/IDs.
- Verify generated PDF has 9 agreement pages plus only populated photo appendix pages and date agreement consistency on pages 1, 2 and 8; check witness and rent fields on pages 7–9.
- Generate 7/8/9/10-photo cases using synthetic portrait/landscape test pictures, verify required grouping and no distortion.
- Inspect images/screenshots of pages 1, 2, 7, 8, 9, 10 and 12 for clipping/overlaps, especially page 9.
- Check browser console for errors, mobile-width UI, and GitHub Pages path prefix `/renthouse-gjx/`.
- Do not commit generated PDFs or actual sensitive tenancy details as test fixtures.

## Deployment
Public repository: https://github.com/Frickson/renthouse-gjx
Expected site: https://frickson.github.io/renthouse-gjx/
GitHub Pages Source: GitHub Actions; workflow: `.github/workflows/deploy.yml`. Pushing to `main` triggers a site deployment. Check Actions for success; never claim live status without verification.

## Current handoff
See `CODEX_HANDOFF.md` for project scope, previous issues fixed, and recommended next tasks. Read `README.md` for field and photo layout documentation.
