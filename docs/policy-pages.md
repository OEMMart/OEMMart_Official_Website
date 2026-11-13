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

## Reading typography

The opening uses the document's existing words in a single lead followed by
supporting context. There is no introductory card or added overview heading.
The Inter family stays consistent with the marketing site: a 20px/28px medium
lead, 16px/26px regular text, and 14px/21px supporting note. On a phone, the lead
reduces to 18px. The article has a maximum measure of 70ch and a shared alignment
for its introduction and numbered sections. Paragraphs use 14px space after;
sections use a larger, consistent interval.

These choices apply the hierarchy in the [GOV.UK paragraph guidance](https://design-system.service.gov.uk/styles/paragraphs/),
the measure and paragraph relationships in [Practical Typography](https://practicaltypography.com/line-length.html),
and the type-scale approach in [Carbon](https://carbondesignsystem.com/elements/typography/overview/).
The numerical sizes are tailored to OEMMart's existing typeface and layout.
