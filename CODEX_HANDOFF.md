# RentHouse GJX — handover to Codex

## Where to start
Repository: https://github.com/Frickson/renthouse-gjx
Pages target: https://frickson.github.io/renthouse-gjx/
Working branch: `main`. The repository is public. This project was initially built in a ChatGPT conversation; that conversation is NOT automatically imported into Codex. This file and `AGENTS.md` preserve the important context.

## Product brief
Build and maintain an easy-to-use browser-only tenancy agreement generator using the sanitized 12-page Malaysian agreement template in `assets/`. A landlord fills a web form for name, IDs, contact information, property/address, rent, deposits, term and dates, witness names/IDs, inventory, and up to 10 photos. Generate an unsigned PDF with the same layout, plus Preview PDF and Download PDF controls. The user's sensitive data is processed only locally and MUST NOT be committed, uploaded, stored or logged.

## Previously addressed
- Agreement date on page 1 AND page 2.
- Different names, addresses, payment terms, monthly rental, deposits and one-year/multi-month term values supported.
- Page 7 unsigned signature areas and witnesses editable; source signatures excluded.
- Page 8 First Schedule data auto-populated.
- Page 9 inventory-table border corruption repaired.
- Automatic photo appendix fixed to pages 10–12 (max 10 JPG/PNG):
  7 = [4,2,1], 8 = [4,2,2], 9 = [4,4,1], 10 = [4,4,2].
- Older page 13 stamp certificate omitted (12 pages total).
- A browser-generated 12-page test PDF and synthetic photo tests were used in the initial build; test artifacts themselves were excluded from public repo.

## Review / next recommended work
1. Verify the live Pages deployment after GitHub Pages source was configured; inspect the latest Actions run and website.
2. Review app's form and resulting PDF against sanitized backgrounds for unresolved visual inconsistencies, especially table borders on page 9 and text overflow for long names/addresses.
3. Add automated unit and browser E2E tests (use only synthetic identifiers) to this repo and GitHub Actions CI. Include 0–10 photo cases, with the four specific groupings.
4. Improve mobile layout and accessible keyboard labels, validation messages and file-upload previews/reordering without adding storage or telemetry.
5. Assess PDF output fidelity and printability; keep exact page count and dates consistent. Do not alter contractual terms without review.
6. Update docs and tests for changes, preserving public privacy protections.

## Commands
```bash
python3 -m http.server 8000
# In a separate terminal:
node --test
```
The website needs no install step or frontend build system. A browser runner may need to be installed separately for E2E testing.

## Non-negotiables
Do NOT publish original signed agreements, originals' NRICs, banking information, signatures, internal property photographs, sensitive outputs, or secrets. Do NOT add a cloud PDF conversion service or analytics without explicit permission.

## Updated form and pagination

The current user request supersedes the original fixed 12-page requirement: retain nine agreement pages and omit empty photo appendix pages (0 photos → 9 pages; 1–2 → 10; 3–4 → 11; 5–10 → 12). Four photos use 2/2. IC fields accept standard 12-digit 6-2-4 and requested 14-digit 6-2-6 formats. Bank and account are separate, inventory uses quantities, and the repository dummy JSON provides landlord/witness autofill; see PRIVATE_PEOPLE.md. No real identities or original attachment content were added to the repository.

The current trial reads dummy names/ICs automatically from demo-people.json. File-import UI has been removed at the user’s request. Inventory quantities appear as item/number rows. Real secrets remain disconnected because publishing them in static assets makes them public.
