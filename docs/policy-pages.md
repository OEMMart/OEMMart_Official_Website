# Policy pages

The privacy policy and website terms use the shared OEMMart style in
`css/policies.css`. Their body text comes from Tom's November 13, 2026 documents.

## Last updated date

Before previewing a policy edit, run:

```sh
python tools/update-policy-dates.py
```

The publishing workflow also runs this command. It reads the full Git history
and uses the date of the latest change to that policy's title or body text.
Each policy is tracked independently. Changes to markup, navigation, styling,
or the date display itself retain the existing date. A new text edit that has
not been committed uses the current date for local preview.

Dates use the Asia/Shanghai calendar day (UTC+08:00), matching the team's
editing environment. The generated `time` element is present in static HTML,
so it works without JavaScript. It records a content revision, not a separate
legal effective date.

Use `python tools/update-policy-dates.py --check` to verify dates without
changing files. The script rejects shallow checkouts so a cosmetic commit
cannot be mistaken for the first policy revision.
