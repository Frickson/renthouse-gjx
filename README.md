# RentHouse GJX

A privacy-conscious static website that converts an editable tenancy web form into an unsigned, 9–12-page PDF modelled on an existing Malaysia tenancy agreement. The project uses **no server, account, database, third-party scripts or analytics**. Form values and optional property images are processed entirely within the visitor's browser.

## Use it

1. Open the deployed GitHub Pages website, or run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`.
2. Fill in the agreement date, start date, term, parties, identity numbers, addresses, rental amount, deposits, witnesses and inventory.
3. Optionally add up to ten JPG/PNG property photos. The photo appendix (pages 10–12) automatically arranges 1, 2 or 4 images per page, maintaining the original aspect ratio without cropping.
4. Select **Generate PDF**.
5. Select **Open PDF preview** to review it or **Download PDF** to save the finished agreement.

**Important:** Signatures are never carried over. The prior stamping certificate is intentionally excluded. Review the legal wording, parties, dates and obligations; stamp the executed agreement as required by local law. The source agreement contains a reference to a term in "Part V" of its schedule despite the term appearing in "Part IV"; that pre-existing clause is not silently amended.

## Supported fields

- Agreement date on page 1 **and page 2** (Singapore-local today by default)
- Start date, term in months, calculated/overridable expiry date
- Landlord and tenant legal names, NRIC/IDs, contact details and addresses
- Property address (cover, First Schedule and inventory)
- Landlord bank account
- Monthly rent, security, utilities and access card deposits, due day, amounts in words
- Both witness names/IDs, including same-witness option (no signatures)
- Permitted use, renewal clause, 24 inventory rows and up to ten property photos
- Names in every page's footer

## Automatic photo layout

The site generates nine agreement pages plus up to three photographic appendix pages. Empty appendix pages are omitted. Uploaded JPG/PNG files are placed in upload order, scaled down to fit the available frame without cropping or stretching. Extra space is intentionally preserved for unusually tall/wide photos.

| Photos | Page 10 | Page 11 | Page 12 |
|---:|---:|---:|---:|
| 7 | 4 | 2 | 1 |
| 8 | 4 | 2 | 2 |
| 9 | 4 | 4 | 1 |
| 10 | 4 | 4 | 2 |

For 1–6 photos, the layout is [1,0,0], [2,0,0], [2,1,0], [2,2,0], [2,2,1], or [2,2,2] respectively. For example, four photos use two pages with two photos each, producing 11 pages total. With no photos, the agreement has 9 pages. Images are never uploaded or stored by the website.

## Security and publication

`assets/blank-tenancy-template.pdf` and page PNGs are **redacted derivatives** of the agreement. Original parties' names, IC numbers, addresses, bank details, signatures and interior photos are not distributed in this repository. The site does not store form values in cookies or web storage, and sends no user input over the network. The downloaded PDF **will** contain sensitive details supplied by the user, so store/share it carefully.

## PDF fidelity

The fixed text/layout are supplied as rasterized blank-page backgrounds at approximately 2× resolution. The generator overlays editable details in place, then builds an A4-compatible 9–12-page PDF in the browser, without any external PDF library. It retains the visual arrangement but does **not** retain vector/searchable legal body text; newly entered metadata is searchable, while the underlying body is image-backed. Print and inspect the PDF prior to signing.

## Deploy to GitHub Pages

1. Create a **public** repository named `renthouse-gjx` in your GitHub account.
2. Upload everything from this project folder to its `main` branch (including `.github/workflows/deploy.yml`).
3. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the repo **Actions** tab and run/re-run **Deploy static website to GitHub Pages** if it has not deployed automatically.
5. The site will normally be `https://YOUR-GITHUB-USERNAME.github.io/renthouse-gjx/`.

This project is a static website; no API keys, environment variables, hosting payments or database are required.

## Local regression tests

`node --test` checks IC formats, private people-list validation, inventory quantities, photo grouping, page counts and aspect ratios. Chromium regression checks exercise generation, preview and download with fictional data; generated artifacts stay outside the repository.

## Form updates

IC fields accept 12 or 14 digits, with optional 6-2-4 or 6-2-6 hyphens and automatically insert hyphens when leaving the field. Both the standard NRIC format and the requested 6-2-6 format are supported. Bank and account number are separate; the bank dropdown displays Maybank, Hong Leong Bank, and CIMB Bank Sdn Bhd. The PDF bank line uses the abbreviation and account number separated by a space (for example, HLB followed by the account number).

Landlord and witness choices load automatically from the repository’s `demo-people.json`; selecting a name fills its IC. There is no import control. See [list format and privacy](PRIVATE_PEOPLE.md). The legal-name and witness-name fields are editable dropdowns; choosing a listed name fills its IC, and any name/IC can also be entered manually. The same-witness option remains available.

Inventory uses quantities for the source agreement's item types, plus tables and chairs. Zero quantities are omitted. Additional items can be entered one per line; the combined PDF list is limited to 24 rows.

Run `node --test` for form data validation tests. Browser/PDF regression artifacts stay outside the repository.

The public `demo-people.json` contains fictional names and ICs only and loads the dropdowns automatically for testing. Never replace it with real personal data. There is no file-import UI.

Name fields use an explicit dropdown button with clickable options, arrow-key selection, and manual typing. Built-in fictional suggestions remain usable if the repository JSON request fails.

To verify actual name-field interaction locally, serve the app over HTTP and run `node scripts/check-name-fields.cjs` with Playwright and Chromium installed. This checks mouse/keyboard selection, sequential typing, shared witnesses, and all four IC fields at desktop and mobile widths. ICs use `type="text"` with `inputmode="numeric"` so leading zeros and hyphens are preserved; formatting is applied on blur.
