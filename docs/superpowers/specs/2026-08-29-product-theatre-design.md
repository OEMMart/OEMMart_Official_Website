# Product Theatre — putting the real SignalForge UI on the landing page

Date: 2026-08-29
Status: awaiting review
Pixel source of truth: `F:\GitHub Clone\SignalForge-frontend\docs\superpowers\specs\mockups\detail-v2-radar.html`
and `signal-contacts-inline.html` — both are committed, user-approved interactive mockups of the
real product, and are what the brochure's "sample data from the product design mockups" captions
already point at.

## 1. The problem

The site asserts three things and shows none of them:

- *"Every answer shows its source."* — proved with a screenshot of `chat.oemmart.com`, a different
  product, whose own last line reads "no exact chunk citation was provided"
- *"Every opportunity arrives with the person who signs it."* — proved with an empty concept card
  and a `REVEAL` button that reveals nothing
- The score — shown as a bare `92`, with no breakdown, while the product attributes every point

Meanwhile the layout is nine full-width bands stacked in one straight line. Nothing in the rhythm
tells a reader that anything here is a working system rather than a brochure.

## 2. Goal

Replace the invented visuals with the actual product surface, and break the vertical spine so the
page reads as a system rather than a leaflet. Under existing headings only — no new marketing copy,
which is Tom's call (see `docs/copy-conflicts.md`).

## 3. Decisions

| # | Decision | Choice |
|---|---|---|
| D1 | Static or interactive | **Interactive.** Panels are operable, not pictures. |
| D2 | Layout | **A** — one horizontal theatre plus one asymmetric bento. Not a full horizontal redesign (C), which would disturb the approved narrative; not a second theatre (B), whose material is buying signals, which this pass does not promote. |
| D3 | Horizontal mechanic | **Pin + scrub.** The section pins; wheel-down drives horizontal travel; when the travel completes the pin releases and the page resumes downward. No manual horizontal scrolling, no shift-scroll, no drag. |
| D4 | Sub-animations inside the theatre | `containerAnimation`, so each panel animates as it arrives horizontally. Note the GSAP constraint: ScrollTriggers using `containerAnimation` cannot themselves pin or snap. |
| D5 | Below 640px | **Vertical fallback.** The four panels stack; every interaction is kept; the pin and the horizontal travel are dropped. Delivered through the `gsap.matchMedia()` split already in `landing.js`. |
| D6 | `prefers-reduced-motion` | Same path as D5. The existing `body.static` branch already covers the rest of the page. |
| D7 | Copy | None invented. Panels sit under headings already on the page. Product labels inside a panel are the product's own labels, not marketing wording. |
| D8 | Buying signals | Not promoted. The Command Center panel is narrowed to tender rows and the "Signal mix" tile is omitted — see §6. |

## 4. The horizontal theatre — "one tender, end to end"

Sits where the current `draftsec` band is, under its existing heading. Four panels, travelling right
as the reader scrolls down:

```
Command Center   →   Tender detail      →   Source documents   →   Draft proposal
four counters        Why it scored 88       (4) + key dates        + Pursue / Decline
```

| # | Panel | What it shows | What the reader can do |
|---|---|---|---|
| 1 | Command Center | The four morning counters and the ranked shortlist | Hover a row: it lifts and shows its score tier |
| 2 | Tender detail | HVAC Replacement, match score 88, the six-stage journey | Click a score line: the written reason for those points expands |
| 3 | Source documents | The four attachments and the dates pulled out of them | Click "Download all": the ZIP affordance animates, downloads nothing |
| 4 | Draft proposal | The generated draft with its cited page | Click Pursue: the journey advances one stage and the decision is recorded in-panel |

Every value is verbatim from the approved mockups, and each panel carries the same
"sample data from the product design mockups" attribution the brochure uses.

## 5. The bento — evidence and contacts

Sits under the two existing headings *"Every answer shows its source."* and *"Every opportunity
arrives with the person who signs it."* Deliberately unequal, not a split grid:

- **Wide cell — Evidence.** Two quoted passages, each with publication and date beneath it. This is
  the literal object the "shows its source" headline promises. Replaces the `chat.oemmart.com`
  screenshot, which comes out.
- **Narrow cell — Contacts.** The unlock state machine, clickable: *not started → discovering →
  contacts ready*. Makes the pricing promise visible — finding people is free, only revealing a
  detail spends, and phone never unlocks before email. Replaces the empty `REVEAL` card.

No left accent bars anywhere. Depth comes from the established grammar: raised faces with a white
top edge and warm shadow, recessed wells for inset content, one dark-glass anchor per composition.

## 6. Honest narrowing, recorded

The real Command Center mixes government tenders and buying signals in one ranked list, and the
mockup's shortlist contains two signal rows (Hydro-Québec 92, Suncor 81). Because this pass does not
promote buying signals, panel 1 shows tender rows only and omits the "Signal mix" tile.

This makes the panel a **subset** of the product, never a misstatement — but it does make the
product look narrower than it is. Worth revisiting when signals go public.

## 7. Non-goals

- No new marketing copy. No headline, subhead, or claim is written or altered.
- The Brain is not shown; its analysis surface is still in development.
- No real network calls. Panels are self-contained; nothing fetches, downloads, or submits.
- No change to the Kaeser social proof, the coverage counters, or any of the items in
  `docs/copy-conflicts.md`. Those are Tom's.

## 8. Risks

| Risk | Handling |
|---|---|
| Pinned sections add page height and can feel like the page has frozen | Travel capped so the theatre takes roughly one and a half screens of scroll; a progress indicator shows position within the four panels |
| A second pin on the page (the hero already pins) can fight the first | Both are created top-to-bottom in source order, which is the order ScrollTrigger refreshes in; no `refreshPriority` needed as long as that holds |
| Interactive panels are heavier than an image | Transform and opacity only; no layout-animating properties; panels built as static markup, not rendered at runtime |
| Mobile fallback drifts from the desktop version | One markup tree, two `gsap.matchMedia()` branches — the panels are the same DOM in both |

## 9. Verification

Not done until all of these pass in a browser, not in the terminal:

1. Desktop 1440×900 — scroll into the theatre, confirm the page stops advancing, the panels travel
   sideways, and the page resumes after the fourth
2. Each of the four interactions actually responds
3. 375×812 — panels stack vertically, no pin, interactions still work, nothing overflows
4. `prefers-reduced-motion: reduce` — static stack, all content reachable
5. No horizontal page scrollbar at any width from 320px to 1920px
