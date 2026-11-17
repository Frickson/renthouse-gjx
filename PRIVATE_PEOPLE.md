# Private people list

Keep the real file outside this public repository. In section 02, choose your local JSON file. Landlord and witness dropdowns show names; selecting a name fills its IC. A person may have both roles. Manual entry remains available. The list is held only in the current tab; it is never uploaded or stored by the app.

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

Use unique IDs, names up to 100 characters, at most 200 people and a file smaller than 200 KB. An invalid import leaves the previous list intact.

GitHub Actions Secrets cannot be fetched by this static website at runtime. Injecting a secret into a deployed HTML/JS/JSON asset exposes the names and ICs publicly. If you choose to retain this JSON in a GitHub Secret, `PRIVATE_PEOPLE_JSON` is a suitable name and the entire JSON above is its value format; this app does not retrieve it or publish it. Keep a secure local copy to import. Do not add an Actions step that writes the secret into the Pages artifact. A shared hosted list would require an authenticated backend and access controls.

The usual 12-digit Malaysian NRIC uses 6-2-4 formatting. The app also accepts the requested 14-digit 6-2-6 format, without adding or removing digits.

For a public trial, `demo-people.json` loads fictional landlord and witness choices automatically. Keep that file fictional; real names and ICs belong only in your private local file.
