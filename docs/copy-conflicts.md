# Copy conflicts on oemmart.com — for Tom to rule on

Status: **recorded, not changed.** Nothing in this list has been edited on the site.
Every item below is a wording or claim decision, and wording is Tom's call.

Compiled 2026-08-29 against:

- the live site (`landing-nav-about-contact` @ `837f9ad` — see "Where the site actually is" below)
- `OEMMart-OnePager.html` (2026-08-25) and `SignalForge-Introduction.html` (15 plates)
- `SignalForge-Introduction-SOURCES.md` — the source ledger, which already ruled on several of these
- the OEMMart group chat, 2026-08-22 and 2026-08-24
- the product code: `SignalForge-frontend` and `SignalForge-backend`

The recurring theme: **the brochure work built a "no source, no claim" discipline and applied it.
The website is the one artefact that discipline was never run over.** Five of the items below were
deliberately cut from the brochure and are still live on the site.

---

## A. Brand architecture

### A1 — The site calls the whole product "Ollie". Tom's definition is narrower.

Live copy: *"Ollie turns it all into demand intelligence."* On the site, Ollie also drafts
responses, tracks competitors and finds contacts.

Tom, 2026-08-24:
> "Ollie AI is our matcher for government tenders. The idea is we need to create a brand for the
> matcher, as I believe our matching technology needs to exceed whatever keyword and industry code
> matching engines exist today"

> "We need to personify our matcher. For example, we say things like 'Ollie is our watchdog, keeping
> an eye out for you whenever new opportunities arise'. Eventually we will need to merge Signalforge
> and Ollie together into one brand."

So: **SignalForge is the platform, Ollie AI is the brand of the matcher**, and the merge is a future
intent, not a done thing. The one-pager was restructured on that reading and Tom accepted it.

The word "SignalForge" does not appear anywhere on the website.

**Complication.** The decision was taken (2026-08-29) that this pass of the site does *not* promote
buying signals. Tom's framing ties SignalForge to the two-sided platform, so introducing the name
now implies the half we are not talking about. One defensible reading: keep Ollie AI in front for a
tenders-only site, and only correct what Ollie is claimed to *do*. **Needs Tom.**

### A2 — A second, unmerged version of this copy already exists.

Branch `codex/signalforge-oemmart-copy`, 2026-07-08, author `ndrwzheng <ndrwzheng@gmail.com>`
(one commit in the whole repo). It adds "SIGNALFORGE BY OEMMART", a four-block Market Signals /
Private Fit Scoring / Actionable Opportunities / Feedback Loop section, and a **Company Brain**
block ("Your catalogue becomes Ollie's memory").

It conflicts with the current site, with "signals not yet", and with The Brain's real status
(see C5). **Who wrote it, and does it stand?** If it is Tom's, it outranks anything drafted since.

---

## B. Coverage numbers — three published versions, none matching the stated reality

| Source | Federal | US states | CA provinces | Municipal |
|---|---|---|---|---|
| **Live site** (`index.html`, coverage section) | 1 — SAM.gov | 20+ | 2 | — |
| 15-plate brochure, Plate 12 | 1 — SAM.gov | 20+ | 2 | — |
| One-pager (Tom's brief, 2026-08-22) | 2 — SAM.gov + **CanadaBuys** | 50 | 10 | 1,000s |
| **Tom's stated reality**, same message | — | **~40** | **4** | expanding |

Tom, 2026-08-22:
> "Mention we have comprehensive North American Coverage: the US federal government (SAM.Gov),
> Canadian Federal Government (CanadaBuys), all 50 US States, all Canadian Provinces, and thousands
> of regional and municipal governments.
>
> (The reality is we're at around 40 US States and 4 Canadian Provinces so far, but our web scraping
> team are expanding very fast)."

The brochure cites the website as its source and classes these as PUBLISHED — so there is no
independent ledger behind 20+/2. The site is wrong in **both** directions: it understates states and
provinces by roughly half, and it omits CanadaBuys entirely.

Decision taken 2026-08-29: publish the reality (2 / ~40 / 4). **Held pending Tom** because it is copy.

---

## C. Claims the brochure deliberately refused that are still live

All five quotes below are from `SignalForge-Introduction-SOURCES.md`, "Deliberately omitted, and why".

### C1 — The 361 figure and its per-portal breakdown

Live: *"Six portals. 361 new postings. Good luck."* with 214 / 37 / 41 / 18 / 22 / 29.

Ledger: the 361 family was **removed** because "the user could not confirm whether the website's
figure is measured or editorial, and directed removal". The brochure now reads "Six portals. Every
morning. Good luck." with no volume claim.

The site still carries the number that was judged unverifiable.

### C2 — Competitor tracking

Live: *"See what your rivals are chasing."* / *"Ollie tracks competitor moves, exits and wins across
every public source"* / *"A competitor just exited compressed-air service in Texas. → 41 active
contracts open for rebid."*

There is no competitor-tracking capability in the product. Buying signals are *buyer* intent
(a company did something that means it is about to buy), not competitor behaviour. The ledger cut a
claim of exactly this species — a lead-time figure — with: **"It was invented."**

Tom's own line was *"be the first to take action and find out these opportunities before their
competitors do"* — being early, not watching rivals. The site's version drifted.

### C3 — The training-data promise

Live: *"never sold, shared, or used to train anyone else's model."*

Ledger: cut as "a contractual commitment with no source", and the brochure instead tells the client
to ask the question and hold the answer to the contract.

### C4 — The product screenshot

Live: the only product screenshot on the site is `chat.oemmart.com` — "Oemmart's Assistant /
Document Q&A", file dated 2025-08-27.

Ledger: "It is real and public, but it shows an **older product surface**, not SignalForge. Using it
would misrepresent what a client gets."

Three further problems: it is a chatbot, and The Brain design record states that a Q&A interaction
was explicitly rejected by the user, so the product has no conversational UI; and the screenshot's
own last line reads "no exact chunk citation was provided", directly under the headline "Every
answer shows its source."

The ledger names the four screenshots worth capturing instead: Command Center with the four
counters, a signal detail with the score breakdown, the evidence panel, and Contacts in its locked
state. Capturing them needs a login on a tenant that has real signal data.

**Update 2026-08-29.** The `<img>` is gone — the proof section now shows the product's real score
attribution instead. **But the same file is still the `og:image`** (`index.html`, line 13), so every
time anyone shares oemmart.com on LinkedIn, Slack or anywhere else, the preview card is still a
screenshot of the old chat product. Same defect, wider blast radius, and it needs an asset nobody
has yet: a real SignalForge screen at about 1200×630. **Needs a decision and a file.**

### C5 — The Brain's status

Not currently on the site, and the decision of 2026-08-29 is to keep it off. Recorded here so it is
not added later by mistake: Plate 13 marks The Brain **"In development"** — "File upload is live
today. The analysis surface is still in development, and we would rather say so." Verified in code:
`server/brain-adapter.ts` is a dual-mode adapter that runs fully mocked unless `BRAIN_INGEST_API_KEY`
is set, and the three real backend contracts are still open.

---

## D. Kaeser

Tom, 2026-08-25:
> "We should remove Kaeser from the brochure until we have a few more logos that we can display"

The one-pager removed it ("a single-logo endorsement reads thin; better none than one"). The
15-plate document still carries it on the back cover. **The website still leads its social proof
with the Kaeser logo card and "PAYING CUSTOMER · SINCE 2025".**

Decision taken 2026-08-29: leave it up for now, pending Tom. Note that the site's line —
*"screens tenders across all 50 states with OEMMart"* — also describes less than what Kaeser
actually uses today.

---

## E. Three names for one number

The same 0–100 score is called:

- **FITSCORE** on the website
- **SIGNAL SCORE** / **MATCH SCORE** in the brochure
- **Match analysis** in the product UI

And the largest scoring pillar is literally named *Capability Fit*. Worth settling on one.

Related: the brochure publishes the weights — **Capability Fit 45 / Opportunity Strength 30 /
Engagement Potential 25**, "fixed, published here, and the same for every customer", read from the
product's scoring configuration and verified against its test suite. The website shows only a bare
"92" with no breakdown, which hides the strongest trust asset we have.

---

## F. Two sets of contact details

| | Email | Phone |
|---|---|---|
| Website | hello@oemmart.com | +1 (925) 770-4587 |
| One-pager | tom.zheng@oemmart.com | +1 415 849 2186 |

Decision taken 2026-08-29: carry both on the site.

---

## G. Two sections that exist on the live site but not on this branch

The 2026-08-29 design-system pass on `signal-pipeline` rebuilt the Signal section and dropped the
machine band. Against the live site that means:

- **`machine` — "Matched while you sleep." (READ · SCORE · DRAFT)** — live, accurate (all three
  steps are real), removed on this branch by mistake. Recommend restoring.
- **`signal` — "A thousand signals. One move."** — live. Under "signals not yet", taking that
  decision to the live site is a **deletion**, not merely a decision to add nothing. Worth being
  explicit that this is what it means.

---

## H. One correction that runs the other way — the ledger is wrong here

The ledger cut the morning email as a fabrication:

> "A morning email digest — oemmart.com promises 'One email. Three worth your time… 6:00 AM', but
> the SignalForge codebase contains **no digest feature**."

That reading came from `SignalForge-frontend` only — the ledger's verified-against list contains no
backend. **The digest is real and lives in `SignalForge-backend`:**

- `core/email_notifier.py` (19 KB) — per-company recipient selection, lookback window, subject built
  from the match count, rendered HTML match cards
- `core/notification_repository.py` — per-recipient idempotency and a delivery audit
- `scripts/run_email_notifier.py` — the scheduled entry point
- `core/migrations/007_email_notifications.sql`

Corroborated by Mike, 2026-08-28 ("I've added the contact detail info in the email notification for
signalforge") and by the OEM-451 A/B report ("emails actually sent from 21 to 40").

**The website's "One email, 6:00 AM" is accurate.** This should be corrected in the ledger before
anyone uses the brochure as a reference and deletes a shipped feature.

The separate criticism still stands: the email is a *delivery channel*, and the site presents it as
the whole product, when the product is a workspace with four top-level areas.

---

## I. Not copy, but needs an owner

**Privacy and Terms in the footer are dead links** (`href="#"`). The About section makes a privacy
promise a few hundred pixels above them. Either the pages get written or the links come out.

---

## Where the site actually is

Worth recording, because it surprised us:

- GitHub Pages for this repo is configured on `main`, has **`cname: null`**, and last deployed
  **2026-01-13**. It serves `oemmart.github.io/OEMMart_Official_Website/` and nothing else.
- Fingerprinting the live site (the `datadoors` tracking pixel, `landing.js?v=5`, the `machine`
  band) matches exactly one branch: **`landing-nav-about-contact` @ `837f9ad`, 2026-08-03.**
- So **oemmart.com is published by something other than this repo's Pages workflow, and merging to
  `main` will not update it.** Whoever owns that pipeline needs to confirm it before any of this
  ships.
