# Repository people list

For the current trial, the website loads `demo-people.json` from GitHub Pages automatically. Section 02 and section 05 show dropdowns of names, and selecting a person fills the IC. There is no upload/import control. Keep this public file fictional. A person may have both landlord and witness roles; names can be selected or typed directly in the legal-name and witness-name fields.

Use this format (all example identities below are fictional). ICs must be strings to preserve leading zeros. Version 1 accepts 12 or 14 digits, with or without 6-2-4 or 6-2-6 hyphens.

```json
{
  "version": 1,
  "people": [
    {
      "id": "landlord-1",
      "name": "Fictional Landlord",
      "ic": "12345678901234",
      "roles": ["landlord", "witness"]
    },
    {
      "id": "witness-1",
      "name": "Fictional Witness",
      "ic": "234567-89-012345",
      "roles": ["witness"]
    }
  ]
}
```

Use unique IDs, names up to 100 characters, and at most 200 people.

GitHub Actions Secrets cannot be fetched by this static website at runtime. Injecting a secret into a deployed HTML/JS/JSON asset exposes the names and ICs publicly. If you choose to retain this JSON in a GitHub Secret, `PRIVATE_PEOPLE_JSON` is a suitable name and the entire JSON above is its value format; this app does not retrieve it or publish it. Real personal data is not connected to this public trial. Do not add an Actions step that writes the secret into the Pages artifact. A shared hosted list would require an authenticated backend and access controls.

The usual 12-digit Malaysian NRIC uses 6-2-4 formatting. The app also accepts the requested 14-digit 6-2-6 format, without adding or removing digits.

For a public trial, `demo-people.json` loads fictional landlord and witness choices automatically. Keep that file fictional; real names and ICs require a private authenticated service.

Name fields use native suggestions and allow manual typing. Built-in fictional suggestions remain usable if the repository JSON request fails.
