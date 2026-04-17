# 📄 Product Requirement Document (PRD)

## 1. Project Information

- **Project Name:** The Catalyst Mobile Bar Official Website
- **Brand Name:** The Catalyst Mobile Bar
- **Location:** Vancouver, BC, Canada
- **Status:** Draft / Version 1.0
- **Last Updated:** 2026-03-19

---

## 2. Project Overview & Goal

### 2.1 Brand Vision

- **The Essence of 'The Catalyst':** We go beyond the role of a traditional bartender. Our mission is to serve as the ultimate 'Atmosphere Catalyst'—elevating the energy of every event and creating seamless connections between guests through the art of hospitality.
- **Vancouver Premium Value:** By blending British Columbia’s seasonal local ingredients with Vancouver’s modern lifestyle, we provide a unique 'Pop-up Bar' experience that transcends spatial boundaries—from rustic outdoor weddings to chic urban rooftop parties.

---

## 3. Target Audience

### 3.1 The Outdoor Wedding Couple (Main)

- **Audience:** Engaged couples planning outdoor weddings in Greater Vancouver, Whistler, and the Fraser Valley.
- **Needs:** 'Instagrammable' cocktails and a stylish mobile bar trailer that complements their wedding decor.
- **Key Focus:** Providing artistic drink designs that enhance the overall aesthetic and atmosphere of the wedding.

### 3.2 Brand & Corporate Events

- **Audience:** Brand managers, marketing agencies, and office coordinators hosting product launches or pop-up events in Downtown Vancouver.
- **Needs:** Bespoke cocktails that reflect brand colors or logos, focusing on visual impact.
- **Key Focus:** Creating high-visual content that encourages guests to share their experience on social media (Instagram, TikTok).

### 3.3 Private Party Hosts

- **Audience:** Individuals hosting high-end home parties for birthdays, anniversaries, or private milestones.
- **Needs:** Professional bartenders crafting beautiful, handcrafted cocktails instead of standard pours.
- **Key Focus:** Delivering a premium bar experience that reflects the host's sophisticated taste and attention to detail.

---

## 4. Site Map (Information Architecture)

### 4.1 Home (The Experience)

- **Visual Hero:** High-definition video/imagery of the mobile bar trailer and signature cocktails.
- **Brand Story:** Introduction to 'The Catalyst' identity and our focus on visual aesthetics.
- **Social Feed:** Integrated Instagram feed for real-time visual updates (replaces a separate gallery page).

### 4.2 Services & Menu (The Bar)

- **Service Packages:** Detailed breakdown of service tiers and what is included in each.
- **Visual Lookbook:** A curated list of signature cocktails highlighting aesthetic details and garnishes.

### 4.3 Planning & FAQ (The Essentials)

- **Service Areas:** Coverage information for Vancouver, Whistler, Fraser Valley, and surrounding areas.
- **Legal & Safety:** Guidance on BC Liquor Laws (SEP), liability insurance, and professional certifications.

### 4.4 Contact (The Inquiry)

- **Booking Form:** Comprehensive lead generation form including Date, Location, Guest Count, and Event Type.
- **CTA:** Direct "Get a Quote" or "Check Availability" buttons for quick conversions.

---

## 5. Key Functional Requirements

### 5.1 Visual & Aesthetic Experience

- **Image-Centric Optimization :** still cuts that highlight cocktail garnishes, vibrant colors, and the intricate details of the mobile bar trailer (moving away from video backgrounds to focus on crisp imagery).
- **Mobile-First Responsive Design:** Optimize layouts specifically for mobile users—ensuring images appear as a clean, expansive gallery to accommodate the high volume of local Vancouver mobile traffic (80%+).
- **Interactive Lookbook:** Implementation of a "Lightbox" feature where clicking a signature menu item expands the image to reveal visual highlights and local ingredient stories.

### 5.2 Core Lead Capture (Inquiry System)

- **Objective:** Accurately collect event data from potential clients to maximize the conversion rate from inquiry to confirmed booking.
- **Core Features:**
  - **Multi-Step Inquiry Form:** Intuitive fields for Event Details (Date, Venue), Guest Count, and Service Style (Craft Cocktails vs. Beer/Wine).
  - **Automated Notifications:** Instant admin alerts for new leads and branded auto-response emails for clients.
  - **Mobile-Optimized UI:** Integration of touch-friendly components such as Date Pickers and Dropdown menus.

### 5.3 Trust & Localization

- **Social Proof & Partnerships:** A dedicated slider for client testimonials and featured logos of partner vendors (e.g., Wedding Planners, Venues) to build brand authority.
- **Compliance Footer:** Permanent display of legal credentials, including "Serving It Right" certification, Liability Insurance coverage, and Business Registration details to ensure local trust.

---

## 6. Non-Functional Requirements

- **SEO:** Local keyword optimization for "Mobile Bar Vancouver" and "Wedding Bartender BC."
- **Performance:** Optimized loading speed for high-definition imagery using next-gen formats (WebP/AVIF).
- **Accessibility:** Adherence to web accessibility standards for seamless inquiry form submission.
- **Security:** Mandatory SSL encryption and reliable hosting to protect client inquiry data.

---

## 7. Technical Stack & Requirements

### 7.1 Core Web Stack

- **Framework: Next.js (App Router)** – Leveraging `next/image` for high-definition image optimization and Server-Side Rendering (SSR) to maximize local SEO performance.
- **Styling: Tailwind CSS** – Utilizing a utility-first CSS framework to rapidly build a minimal, sophisticated, and modern UI.
- **Database & ORM: PostgreSQL & Prisma** – Ensuring reliable storage of inquiry data and efficient management of relational data models.

### 7.2 Enhancement Tools

- **Form Management: React Hook Form + Zod** – Handling complex inquiry forms with robust validation and ensuring type safety for all user-submitted data.
- **Animation: Framer Motion** – Using subtle, short-duration transitions (fade/slide/scale) to guide attention without delaying booking actions.

### 7.3 Non-Functional Requirements

- **Performance:** Automatic conversion of high-res cocktail images to WebP/AVIF formats and implementation of Lazy Loading via `next/image` to maintain high speeds.
- **SEO & Metadata:** Generation of dynamic metadata based on local Vancouver/Whistler keywords to boost search engine visibility.
- **Mobile-First UX:** Ensuring all interactive elements (Date Pickers, form inputs, etc.) are perfectly optimized for touch-based mobile environments.
- **Security:** Establishing a secure data transmission architecture using Next.js API Routes and Prisma to prevent direct public exposure of the database.

---

## 8. Design Direction

This website follows Catalyst's strict design guideline: premium editorial minimalism, mobile-first UX, and image-led storytelling. The design tone must remain calm, refined, and conversion-focused.

### 8.1 Visual Concept

- Premium Editorial Minimalism: Remove decorative noise and preserve visual trust through restraint.
- Image-Led Storytelling: Let still photography carry first impression; keep UI quiet so media and CTA stand out.
- Negative Space First: If a screen feels busy, remove one element before reducing font size.

### 8.2 Core Color Palette

- **Primary Editorial Palette (Default):**
  - `bg.base`: `#F3EFE0` (Creamy Beige)
  - `text.primary`: `#2C2C2C` (Deep Charcoal)
  - `accent.gold`: `#C5A059` (Burnished Gold)
- **Catalyst Dark Palette (Selective Use):**
  - `bg.dark`: `#0F0F10` (Deep Black)
  - `text.onDark`: `#F5F2E8` (Warm Ivory)
  - `accent.gold.dark`: `#D2B06B`
- **Usage Rules:**
  - Light palette is default for most pages.
  - Dark palette is allowed for hero, premium highlight blocks, and footer.
  - Gold is accent-only (CTA/divider/icon detail), not a full-page background color.
  - Maintain readable contrast for all text and controls.

### 8.3 Typography Strategy

- **Headline Serif:** `Prata` or `Playfair Display`
- **Body/UI Sans:** `Inter` or `Montserrat`
- **Hierarchy Rules:**
  - `display`: hero headline only
  - `h1/h2/h3`: section and card titles
  - `body`: paragraph copy and form labels
  - `meta`: captions, helper text, legal notes
- **Usage Rules:**
  - Serif for headings, numbers, and short emphasis only.
  - Sans for body, controls, and long-form text.
  - Keep copy blocks short and readable on mobile.

### 8.4 UI/UX Key Points

- **Hero Section:** High-quality still imagery with concise serif headline and one primary CTA.
- **CTA Hierarchy:** One primary CTA per section ("Get a Quote" or "Check Availability"), avoiding competing actions.
- **Forms (Inquiry-Critical):**
  - Label-first input structure (not placeholder-only)
  - Large touch targets and stable vertical rhythm
  - Progressive disclosure for multi-step inputs
  - Calm, precise inline validation messaging
- **Navigation:** Keep header clean and predictable; sticky/floating actions must not obstruct form fields on mobile.
- **Motion & Interaction:** Prioritize subtle feedback states (hover/focus/active), avoid novelty/bounce effects.
- **Accessibility & Trust:** Ensure visible focus states, semantic heading order, and legible legal/compliance content.

---

## 9. Future Roadmap (Phase 2)

- **Online Deposit:** Secure deposit payment system integrated with Stripe or PayPal for booking confirmations.

## 10. Coding & Design Standards (Mandatory)

To ensure consistency, visual quality, and long-term maintainability, all development and design processes must strictly adhere to the following guidelines:

- **Strict Adherence:** You must rigorously follow the specific guidelines and design principles outlined below when writing any code or designing any interface.
- **Design System:** Every visual element, layout, typography, and UI component must comply with the design principles and editorial minimalism patterns defined in `@designer_guideline.md`.
- **Frontend Development:** All frontend code must adhere to the architectural principles, component structures, and state management patterns defined in `@frontend-guideline.md`.
- **Backend Development:** All backend code must comply with the API design principles, security protocols, and database schema patterns defined in `@backend-guideline.md`.
- **Architectural Integrity:** To maintain the unified quality of the project, any deviation from the established patterns must be documented in advance and receive formal approval.
