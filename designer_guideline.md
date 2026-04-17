# Designer Guideline (Catalyst Mobile Bar)

This guideline defines the visual and UX standards for Catalyst. It is intentionally strict so design and implementation stay aligned.

---

**[IMPORTANT] Always refer to `PFS.md` before creating screens or components.**  
UI decisions must map cleanly to `src/components`, `src/features`, and `src/app` boundaries.

---

## 0. Design North Star

- Premium, editorial minimalism with high visual trust
- Mobile-first by default (one-hand operation)
- Image-led storytelling over decorative UI
- Luxury tone through restraint: fewer elements, better hierarchy

---

## 1. Brand Expression

### 1.1 Core Mood

- Keywords: Refined, Modern, Warm Luxury, Confident
- Avoid playful or loud styling
- Avoid crowded layouts and excessive decoration

### 1.2 Visual Direction

- Use high-quality still photography (cocktails, garnish texture, glass reflections)
- Favor cinematic crop, generous negative space, calm pacing
- Keep interfaces quiet so media and CTA stand out

---

## 2. Color System

Use a dual-brand palette to satisfy both premium editorial mood and Catalyst identity.

### 2.1 Primary Palette

- `bg.base`: `#EAE8E4` (Light Neutral)
- `text.primary`: `#303520` (Deep Charcoal Green)
- `accent.primary`: `#7C826F` (Muted Sage)

### 2.2 Supporting Palette

- `accent.secondary`: `#D6CAB7` (Warm Sand)
- `accent.secondary.2`: `#D6D5CE` (Soft Stone)

### 2.3 Usage Rules

- Default pages: light editorial palette (`bg.base`)
- Use `accent.primary` for key CTAs and focus states
- Use supporting accents (`accent.secondary`, `accent.secondary.2`) for borders, cards, and soft surfaces
- Maintain clear contrast for all text and actionable controls

---

## 3. Typography System

### 3.1 Font Roles (Canonical)

| Role                         | Font                 | Where to use                                                                                                                                 |
| ---------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Main text (UI & reading)** | **Raleway**          | Body copy, navigation, buttons, form labels, inputs, helper text, footer, and all default interface text                                     |
| **Display & brand**          | **Playfair Display** | Logo wordmark treatment, hero/display headlines, section titles when an editorial serif moment is intended, and other design-forward accents |

Do not substitute alternate sans or serif families without updating this guideline.

### 3.2 Type Hierarchy

- `display`: Hero and key editorial headlines — **Playfair Display**
- `h1/h2/h3`: Section titles and card titles — default **Playfair Display** for premium hierarchy; use **Raleway** if the block is dense or data-heavy (e.g. long lists)
- `body`: Paragraphs, descriptions, lists — **Raleway**
- `meta`: Captions, helper text, legal — **Raleway** (often smaller size/weight)

### 3.3 Typography Rules

- **Playfair Display** is for short, high-impact lines and brand-adjacent moments; avoid long paragraphs in serif
- **Raleway** carries all sustained reading and interactive UI
- Keep line length readable on mobile; avoid dense paragraphs

---

## 4. Layout & Spacing

### 4.1 Grid and Rhythm

- Mobile-first spacing rhythm: 4/8/12/16/24/32
- Sections should breathe with generous top/bottom padding
- Use consistent container widths and inner padding

### 4.2 Negative Space Rule

- If a screen feels busy, remove one element before reducing font size
- Prioritize whitespace over borders, shadows, or ornaments

### 4.3 Corner and Surface Language

- Prefer subtle rounding (not playful rounded pills everywhere)
- Keep shadows soft and rare; depth mostly from imagery contrast

---

## 5. Imagery & Media

### 5.1 Image Selection

- Prioritize still cuts with texture and garnish detail
- Avoid low-light noise, heavy filters, or saturated neon tones
- Keep style consistent across Home, Lookbook, and Services

### 5.2 Media Behavior

- Use `next/image` with proper sizing and cropping intent
- Preserve focal point of drink/handcrafted detail on mobile crop
- Lightbox interactions should feel smooth and unobtrusive

---

## 6. Component-Level UX Rules

### 6.1 Buttons

- Primary CTA uses dark/charcoal base with gold accent detail
- Keep labels action-oriented: "Get a Quote", "Check Availability"
- One primary CTA per section; avoid CTA competition

### 6.2 Cards

- Minimal framing, clear title, concise copy
- Let imagery carry first impression; text provides trust context

### 6.3 Forms (Inquiry-Critical)

- Large touch targets and clear vertical rhythm
- Label-first input structure (do not rely on placeholder only)
- Progressive disclosure for multi-step form sections
- Inline validation messaging must be calm and precise

### 6.4 Navigation

- Keep header clean and predictable
- Sticky/floating actions on mobile must not obstruct form fields

---

## 7. Motion & Interaction

### 7.1 Motion Principle

- Motion exists to guide attention, not to decorate
- Prefer subtle fade/slide/scale transitions

### 7.2 Timing

- Use short, smooth durations; avoid dramatic delays
- Interactions should feel responsive under thumb usage

### 7.3 Micro-Interactions

- Hover/focus/active states must be clearly distinguishable
- Avoid bounce or novelty effects that reduce premium tone

---

## 8. Accessibility & Trust

- Ensure readable contrast in both light and dark sections
- Preserve semantic heading order and clear label associations
- Focus states must be visible on all actionable elements
- Legal/compliance content in footer must remain legible and stable

---

## 9. SEO-Aware Design Support

- Design layouts that keep meaningful headings and copy visible
- Do not hide critical business info only in images
- Support fast loading with optimized media and restrained effects

---

## 10. Mapping to Frontend Implementation

- Shared primitives belong in `src/components/ui`
- Brand/layout shells belong in `src/components/common`
- Feature-specific UI lives in `src/features/{domain}/components`
- Avoid one-off styling without token intent; promote reusable patterns

---

## 11. Anti-Patterns (Do Not Use)

- Overdecorated gradients, glassmorphism-heavy effects, flashy neon
- Multiple competing accent colors outside defined palette
- Dense text walls with weak hierarchy
- Tiny tap targets or cramped form spacing
- Animation-first interfaces that delay core booking actions

---

## 12. Quality Checklist (Before Approval)

- Brand tone feels premium and consistent across screens
- Mobile interaction can be completed one-handed
- CTA hierarchy is clear and conversion-oriented
- Form readability and validation clarity are production-ready
- Palette/typography usage follows this document consistently

---

**Summary:** Catalyst design is premium, image-led, and conversion-focused.  
Build calm, elegant interfaces that make booking feel effortless and trustworthy.
