# OEMMart Landing Page Redesign — Design Spec

Date: 2026-07-03
Status: content architecture frozen, approved via iterative mockup review
Visual source of truth: `_mockups/direction-c-plus-v2.html` (this spec documents decisions; the mockup documents pixels)

## 1. Goal

Replace the current Webflow-exported homepage with a purpose-built landing page that:
- makes a cold visitor understand what OEMMart does within seconds (pain-first, visual-first)
- positions the company as **AI-powered demand intelligence** (government tenders are chapter one, not the story)
- converts to one action: **Book a demo** (single CTA intent site-wide)
- differentiates visually from incumbent B2B software sites through scroll-driven transformation storytelling

Audience: prospective customers only (OEM/manufacturer and B2B supplier teams that answer RFPs and plan expansion). Investors are not a design target.

## 2. Decisions log (all user-approved)

| Decision | Choice |
|---|---|
| Audience | Customer-only |
| Delivery | New self-contained page replaces `index.html`; old pages remain temporarily |
| Positioning | Demand intelligence at the center; bids as first chapter |
| Direction | C+ v2 "Transformation / Visual-First" (chosen over A "Enterprise Trust" and B "Intelligence Terminal") |
| Reading load | Minimal: every section is a visual installation; one red focal point per viewport |
| Pricing | **Removed** (no self-anchoring, no competitor visibility) |
| Contact | Merged into final CTA section; full HubSpot field set |
| Social proof | Kaeser logo card + Dr. Cater quote card (merged, dual-panel) |
| Brand | Logo-accurate red `#ed3f2e` + navy `#27276e`; Inter (locked from pitch deck, overrides taste-skill default) |

## 3. Page architecture (final section order)

1. **Nav** — floating glass pill, fixed. Real OEMMart logo (white via CSS filter over dark hero, original colors after world-flip). Links: Product, About, Contact. CTA button "Book a demo" → `#contact`. One CTA label for one intent, everywhere.
2. **Hero: the Transformation** — pinned scroll-scrub stage (GSAP ScrollTrigger, `+=2800px`).
   - BEFORE (dark navy world): 6 floating tender PDFs (real filenames from product screenshots: NEW_CUMBERLAND 355pp, Roseville Power Plant, Palo Alto Water, Naval Yard SOW, etc.) + 2 red-edged market-signal cards (FEDERAL REGISTER grants, INDUSTRY WIRE competitor exit). Red "DUE IN N DAYS" stamps. Ambient drift + stamp throb.
   - Copy: **"Every deal you're missing is public."** / "Buyers publish what they need. Standards shift. Competitors move. It all lands somewhere, faster than any team can read."
   - Scrub sequence: before-copy exits → docs converge and are swallowed by the red Ollie orb → world flips dark→light → AFTER content staggers in.
   - AFTER: logo mark + **"Ollie turns it all into _demand intelligence_."** / "Find the deals, score your fit, draft the response, see where your market is heading. One AI, every morning." + Book a demo (→`#contact`) + See it work.
3. **Before/After drag slider** — "Monday, 8:02 AM." Left: 6 portals, 361 unread postings (grey world). Right: one 6:00 AM email, three FitScored matches (92/88/61). Pointer-draggable divider.
4. **The machine (dark band)** — **"Matched _while you sleep_."** Animated pipeline: mini-docs stream in → Ollie orb (breathing + ripple) → out come score chip 92, citation chip "Source: pg. 355", "Draft response.docx". Labels: READ · SCORE · DRAFT.
5. **AI first draft** — **"The first draft _writes itself_."** + "Ask for changes in plain English. Only that paragraph rewrites. Hand edits welcome."
   Three-act looping installation on a paper sheet (double-bezel shell): (a) draft types itself word-by-word with red source tokens; (b) ¶3.4 gets selection highlight + user chat bubble "Cite our ISO 8573-1 Class 2 rating in the exception."; (c) only that paragraph rewrites, ends with green REWRITTEN tag. Side chips: "pulled from tender · pg. 355" / "from your catalogue".
6. **Signal (dark band)** — kicker SIGNAL, **"A thousand signals. _One move_."** / "Ollie fuses live market signals with your catalogue, wins and regions, then tells you where to push next."
   Three-column synthesis pipeline: RAW SIGNALS (6 timestamped grey source chips) → YOUR CONTEXT (lens card: Your catalogue / Your past wins / Your regions / Your goals + orb) → YOUR MOVE (red-gradient insight card with recommendation + source chips). Cycle: 3 relevant signals light up red → lens pulses → insight swaps (2 rotating examples, one referencing the Kaeser March win).
   Below: **matching flywheel** — "Every yes and no makes the next match _sharper_." Auto-cycling FitScore card (34→61→88→93) with clickable ✓/✗ buttons and verdict trail.
7. **Coverage counters** — count-up 1 (SAM.gov) / **20+** (state portals, red) / 2 (provinces) + single portal-name marquee.
8. **Proof screenshot** — **"Every answer _shows its source_."** Real product screenshot in double-bezel frame; red annotation ring around the actual `[Source: ..._pg_355.pdf]` citation + "source · page 355" tag with connector.
9. **Social proof duo** — Left (navy card): official Kaeser logo on white plate (`images/kaeser-us-logo.png`), red rule, "screens tenders across all 50 states", `PAYING CUSTOMER · SINCE 2025`. Right (white card): verbatim Cater quote with the competitive sentence mark-highlighted, JC monogram, "Dr. Joseph E. Cater III · Market Economics", real LinkedIn link.
10. **CTA + contact (`#contact`)** — **"Bid on the right things."** / "A 30-minute demo on your own product line. No slides." Form card: First/Last name (2-col), Company, Work email, Phone (optional), **Product catalogue dropzone** ("Attach your catalogue and Ollie starts scoring tenders against it from day one." — PDF/ZIP, multi-file, filenames shown on select), marketing-consent checkbox, one-line privacy note + policy link. Submit "Book a demo →" → success state "Got it. We'll reply within one business day." Phone fallback: +1 (925) 770-4587.
11. **Footer** — OEMMart Inc. Toronto, Canada · Privacy · Terms · Contact.

## 4. Visual & motion system

- Palette: red `#ed3f2e` (+deep `#d4441e`), navy `#27276e`, stage navy `#0f1a3e`/`#152250`, paper `#fcfcfa`, ink `#111420`. One accent (red), one focal point per viewport.
- Type: Inter (400–900) + IBM Plex Mono for data/labels. Display headlines 900 weight, tracking −0.04em.
- Rhythm: light page with two dark navy bands (machine, Signal) as deliberate color-block moments; hero performs the single dark→light theme flip.
- Motion: GSAP 3.12 + ScrollTrigger via CDN (pin/scrub hero only); everything else CSS keyframes, IntersectionObserver reveals (translate+blur ease-out), spring curve `cubic-bezier(0.32,0.72,0,1)`. Transform/opacity only.
- Components: double-bezel shells (outer tinted wrapper + inner core), pill buttons with nested circular arrow, floating glass pill nav.
- Fallbacks (mandatory): `prefers-reduced-motion` → static end-states everywhere (hero shows AFTER, sheet shows revised state, pipelines static). GSAP load failure → `body.static` same degradation. All copy visible without JS.
- No em-dashes anywhere in visible copy.

## 5. Technical implementation plan

- **Files**: new `index.html` + `css/landing.css` + `js/landing.js` (split from mockup for maintainability; no build step, still a static site). Old Webflow files untouched and still used by about/blog/support pages.
- **Assets**: reuse repo images (product screenshots, OEMMart logo, `kaeser-us-logo.png`). Fonts via Google Fonts with `font-display: swap` (acceptable for GH Pages static hosting; self-hosting optional later).
- **SEO/meta** (new): title "OEMMart | AI Demand Intelligence for B2B Suppliers"; meta description from hero copy; OG/Twitter card (og:image: product screenshot or generated banner); canonical; favicon unchanged.
- **Analytics**: port Apollo visitor tracker script from old index.
- **Forms**: submit to the existing HubSpot form (portalId `341778708`, formId `90f0e3b8-f6d7-4d19-a872-c69098bc6d91`) via Forms API from our native form (option B, full visual control). Fallback option A: embed HubSpot form and restyle. File upload via Forms API needs the HubSpot field name — open question below.
- **Old pages**: nav Contact → `/#contact`. `contact.html` kept but its body links point users to the new section (GH Pages cannot 301). About/Blog remain linked from footer only.
- **Accessibility**: focus states on all interactive elements, labels above inputs, WCAG AA contrast (verified for red-on-white CTA, grey body text), keyboard access to slider (left/right arrows nudge divider — to add during implementation), `alt` on all images.

## 6. Risks / open questions

1. **Deploy source mismatch (release blocker, not implementation blocker)**: live oemmart.com (waitlist nav: Features/FitScore AI/How It Works/Resources) is NEWER than this GitHub repo. Confirm where production deploys from before shipping, or the newer live content gets overwritten.
2. **HubSpot file-upload field name** for Forms API submission — needs a look inside the HubSpot form definition (CEO/marketing access).
3. **Kaeser logo resolution**: current asset is 130×40 from us.kaeser.com (crisp at display size). Ask Kaeser for a high-res authorized file for production.
4. **Cater attribution**: confirm his preferred title wording; optionally request headshot permission (upgrade from JC monogram).
5. **Signal example content**: the two insight cards and six raw signals are plausible mock content; swap in real examples if CEO provides them.
6. **"Join the Waitlist" vs "Book a demo"**: live site currently says waitlist; this design assumes demo-booking is the desired motion. Confirm.

## 7. Out of scope

- Redesign of About / Blog / Support pages (follow-up project)
- Pricing page (intentionally removed)
- Buyer-side product story (supplier-side only)
- CMS/build tooling (stays a hand-maintained static site)
