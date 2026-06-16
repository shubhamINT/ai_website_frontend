# Infographic payload spec — for the backend agent

This document tells the backend agent **exactly what JSON to emit** so the frontend
renders rich, magazine-quality infographic cards (like the DevOps reference card) instead
of sparse text-and-bullets cards.

The frontend renderer is already capable of the rich look. **The cards look plain only
because the payloads are plain** — most cards arrive as `title + hero.description + one
bullet_list` and nothing else. The renderer supports stat grids, CTA banners, icon
bullets, and illustrated hero graphics; the agent simply has to send them.

> **One rule above all:** a card that is *worth showing* is worth filling. Aim for a
> **hero + 2–4 sections**, and include **at least one visual section** (`stats`,
> `icon_bullets`, or `cta_banner`) per card. A card that is only a header + one bullet
> list is a failure mode — fold that content into a richer composition or don't send a
> card at all.

---

## 1. Transport

- **Single card** → `publish_infographic` (topic `ui.infographic`), instant render.
- **Deck / multiple cards** → `publish_ui_stream` (topic `ui.flashcard`): one packet per
  card, each carrying `stream_id` + `card_index`, closed by an `end_of_stream` marker.
  Each packet's payload must set `"type": "infographic"` (routing is by `payload.type`,
  **not** topic).

A card with `type: "flashcard"` is the *image-led* card (different component). For
composed, text-led, data-rich content, always use `type: "infographic"`.

---

## 2. The full contract

```jsonc
{
  "type": "infographic",            // REQUIRED — routes to the infographic renderer
  "title": "DevOps: More Than Just Tools",
  "icon": "rocket",                 // Lucide icon name for the header badge
  "visual_intent": "processing",    // accent color — see §4
  "hero": {
    "description": "DevOps is about culture, speed, and reliability. It breaks silos, automates delivery, and ensures seamless software production.",
    "graphic": "devops_loop"        // preset key — see §5
  },
  "sections": [                     // ORDERED — rendered top-to-bottom, staggered
    { "type": "icon_bullets", "title": "The DevOps Advantage", "items": [
        { "icon": "users",  "title": "Embed DevOps", "text": "practices in teams" },
        { "icon": "target", "title": "Align development", "text": "QA, and operations" },
        { "icon": "zap",    "title": "Automate delivery", "text": "for rapid releases" }
    ]},
    { "type": "stats", "title": "Business Impact", "items": [
        { "icon": "rocket",        "value": "3X",  "label": "Faster Time to Market",        "intent": "processing" },
        { "icon": "shield-check",  "value": "50%", "label": "Reduction in Deployment Failures", "intent": "success" },
        { "icon": "clock",         "value": "40%", "label": "Improvement in Productivity",  "intent": "processing" },
        { "icon": "bar-chart-3",   "value": "30%", "label": "Lower Operational Costs",      "intent": "warning" }
    ]},
    { "type": "cta_banner", "icon": "trophy",
      "title": "Build Better. Deliver Faster. Together.",
      "text": "DevOps transforms the way teams build, ship, and run software—driving innovation at scale." }
  ],
  "chips": ["DevOps", "CI/CD", "Cloud"]   // footer tag pills (icons auto-derived)
}
```

Top-level fields:

| field | type | notes |
|---|---|---|
| `type` | `"infographic"` | **Required.** |
| `title` | string | Header line. Keep ≤ ~6 words. |
| `icon` | Lucide name | Header badge icon. Falls back to `info`. |
| `visual_intent` | enum | Accent color, see §4. Default `neutral`. |
| `hero` | object | `{ description?, graphic?, icon?, title? }`. Render skipped if it has neither `description` nor `graphic`. |
| `sections` | array | Ordered blocks, §3. **This is where richness lives.** |
| `chips` | string[] | Footer pills. Icons are auto-mapped from keywords. |

---

## 3. Section blocks (the five `type` values)

Only these five `type`s render. Anything else degrades to a markdown block (so unknown
types are safe but plain — don't rely on it).

### `stats` — the headline metric grid (USE THIS OFTEN)

The single highest-impact block. Big colored numbers in tiles. 2-up on phones, 4-up on
wide cards. Each tile can carry its own `intent` for per-tile color.

```jsonc
{ "type": "stats", "title": "Business Impact", "items": [
  { "icon": "rocket", "value": "3X", "label": "Faster Time to Market", "intent": "processing" },
  { "icon": "shield-check", "value": "50%", "label": "Fewer Failures", "intent": "success" }
]}
```
- `value` = the big number/figure ("3X", "50%", "10k+", "24/7"). Keep short.
- `label` = caption under it.
- Best with **3 or 4 items**. Mix intents for a lively palette.

### `icon_bullets` — feature/benefit list with icon badges

```jsonc
{ "type": "icon_bullets", "title": "Key Capabilities", "graphic": "cloud_stack", "items": [
  { "icon": "code", "title": "Custom App Development", "text": "Web, mobile, and enterprise apps" },
  { "icon": "palette", "title": "UI/UX Design", "text": "Research-led product design" }
]}
```
- `title` (bold) + optional `text` (muted sub-line) per item.
- Optional `graphic` renders a preset illustration centered below the list.
- Prefer this over `bullet_list` whenever each point has a label + explanation.

### `cta_banner` — gradient call-to-action / closing statement

```jsonc
{ "type": "cta_banner", "icon": "trophy",
  "title": "Build Better. Deliver Faster.",
  "text": "INT transforms how teams ship software." }
```
- Full-width blue→emerald gradient banner. Great as the **last** section to close a card.

### `markdown` — rich prose

```jsonc
{ "type": "markdown", "title": "Overview", "content": "INT delivers **end-to-end** digital services across *industries*…" }
```
- Supports GFM (bold, italic, lists, headings). Use for narrative paragraphs.

### `bullet_list` — plain check-mark list (use sparingly)

```jsonc
{ "type": "bullet_list", "title": "Industries Served", "items": ["Banking", "Insurance", "Retail"] }
```
- Lowest-richness block. Fine for a short flat enumeration (industries, locations).
- **Do not** make a whole card out of just one of these — pair it with a `stats`,
  `icon_bullets`, or `cta_banner`, or use `icon_bullets` instead.

---

## 4. `visual_intent` → accent color

Drives header badge, hero panel tint, underlines, glow. Pick by the content's mood:

| value | color | use for |
|---|---|---|
| `neutral` | zinc/grey | default, informational |
| `processing` | blue | tech, process, in-progress, services |
| `success` | emerald | wins, results, positive metrics |
| `warning` | amber | costs, caution, attention |
| `urgent` | rose | risk, critical, time-sensitive |

`stats` tiles also accept a per-tile `intent` — mix them for a multi-color metric row
(see the DevOps example: blue / green / blue / amber).

---

## 5. Preset graphic keys

`hero.graphic` and `icon_bullets.graphic` accept **only these keys**. Any other value
(or a URL, or inline SVG) renders **nothing** — never invent keys, never send image URLs.
Pick the closest match to the card's topic:

| key | depicts | use for |
|---|---|---|
| `devops_loop` | blue→green infinity loop | DevOps, CI/CD culture |
| `cicd_pipeline` | 3-stage node pipeline | build/test/deploy, automation |
| `cloud_stack` | cloud + server layers | cloud, infra, hosting, migration |
| `ai_workflow` | neural network | AI/ML, data pipelines, automation |
| `security_shield` | shield + check | cybersecurity, compliance, trust |
| `growth_chart` | rising bars + trend arrow | business impact, ROI, growth |
| `web_development` | browser + `</>` | web/app dev, software engineering |
| `data_analytics` | donut + bar chart | analytics, BI, dashboards, insights |
| `team_collaboration` | connected people | teams, partnership, consulting |
| `digital_marketing` | megaphone + sound arcs | marketing, SEO, lead-gen, campaigns |

> If no key fits the topic, **omit `graphic`** rather than forcing a wrong one. A wrong
> graphic looks worse than none. When you add a new key here, the frontend
> `PresetGraphic` and `PresetGraphicKey` type must be updated too — coordinate.

---

## 6. Density playbook (turn plain cards rich)

The four plain examples that triggered this spec, and how each should have been built:

| Was sent (plain) | Should be (rich) |
|---|---|
| "Summary" — a flashcard with one paragraph | `infographic`: `hero.description` + a `markdown` section + 2–3 `chips`. Add `hero.graphic` if a topic matches. |
| "Industries Served" — header + 1 bullet_list | `hero` (graphic: `team_collaboration`) + `icon_bullets` (industry + one-liner each) **or** keep the list but add a `stats` row ("5 sectors", "20+ yrs"). |
| "Comprehensive Services" — header + hero + 1 bullet_list | `hero` (graphic: `web_development`) + `icon_bullets` (each service + sub-line) + `cta_banner`. |
| "Digital Marketing" — header + 3 icon_bullets | Good start — add a `stats` row (reach/leads/ROI, graphic `growth_chart`) + `cta_banner`. |

**Checklist before sending any infographic:**
- [ ] `type: "infographic"` set
- [ ] `visual_intent` chosen to match mood
- [ ] `hero.description` present (1–2 sentences) and `hero.graphic` set when a key fits
- [ ] **2–4 `sections`**, ordered
- [ ] **≥ 1 visual section**: `stats` and/or `icon_bullets` and/or `cta_banner`
- [ ] a `cta_banner` to close when the card is "selling" something
- [ ] 2–4 `chips`
- [ ] every `icon` is a real Lucide name; every `graphic` is a key from §5

---

## 7. Golden example — what "rich" means

The DevOps card in §2 is the target shape: header + illustrated hero + `icon_bullets` +
4-tile `stats` + `cta_banner` + chips. Build cards at **that density**. When in doubt,
add a `stats` row and a `cta_banner` — they carry the most visual weight for the least
text.
