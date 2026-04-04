---
name: pacific-surf-corporate-wellness
description: "Use when creating or improving Pacific Surf School strategy for corporate adults (25-45) in Lima: anti-crowd positioning (Barranquito vs Makaha), mobile-first landing UX, bilingual local SEO, WhatsApp deep-link conversion, package pricing (4/8 classes), and experiment design with CAC-based decisions. Trigger phrases: corporate wellness surf, surf adults Lima, Barranquito strategy, WhatsApp funnel, Yape Plin conversion, SEO Barranco, package upsell, surf landing mobile-first."
---

# Pacific Surf Corporate Wellness Skill

## Outcome
Produce an execution-ready growth plan that connects positioning, offer design, UX, SEO, and WhatsApp sales operations for Pacific Surf School.

## Scope
- Market: Lima, adults 25-45 with corporate profile.
- Core thesis: Barranquito as premium anti-crowd refuge.
- Conversion channel: WhatsApp consultative close + immediate payment via Yape/Plin.
- Product focus: progression memberships (4 and 8 classes) over one-off classes.

## Inputs Required
- Current landing URL or draft screens/content.
- Current pricing model and class modality:
  - Group class base price: S/.110 per class.
  - Personalized class base price: S/.150 per class.
  - Package ladder (group):
    - 4 classes: S/.418 (5% discount, saves S/.22)
    - 8 classes: S/.792 (10% discount, saves S/.88)
    - 12 classes: S/.1122 (15% discount, saves S/.198)
    - 16 classes: S/.1408 (20% discount, saves S/.352)
- Preferred operating slots: 6:00, 8:00, 10:00, 4:00.
- WhatsApp response SLA and staffing availability.
- Traffic source plan (SEO, Google Ads, social).
- Baseline metrics (if available): CTR to WhatsApp, close rate, CAC, package mix.

## Workflow
1. Define strategic frame
- Summarize target segment pains: stress, time scarcity, desire for privacy.
- State positioning statement: anti-crowd Barranquito advantage.
- Confirm key differentiators: long waves, safer parking, lower crowd density.

2. Build commercial matrix
- Design offer ladder:
  - Exploratory class (hook, high anchor price).
  - 4-class progression membership (highlight as most popular).
  - 8-class progression plan (best long-term value).
- Reflect live pricing in commercial assets:
  - Group class: S/.110 (base).
  - Personalized class: S/.150 (base).
  - Add package cards for 4/8/12/16 classes with discount and savings labels.
- Define WhatsApp upsell script logic:
  - If user asks for 1 class, offer immediate upgrade to 4 classes with existing discount and highlight total savings.
  - If user asks for 4 classes, test upsell to 8 classes by emphasizing schedule continuity and larger savings.
- Define payment close path: Yape/Plin instructions + proof-of-payment step.

3. Design mobile-first conversion architecture
- Hero: clear anti-routine promise + real media + ISA/FENTA trust marks.
- Persistent CTA: fixed mobile button to WhatsApp.
- Anti-crowd comparison block: Barranquito vs saturated zones.
- Pricing section: simple visual package comparison with savings callout.
- Final CTA: prefilled WhatsApp deep links per package intent.
- Reservation flow UX checks:
  - Step sequence: package -> class type/schedule -> frequency -> customer data -> live summary.
  - Validate required fields before WhatsApp submit: full name, valid email, WhatsApp, start date, and selected weekdays for weekly mode.

4. Build bilingual local SEO plan (ES/EN)
- Prioritize transactional intents:
  - clases de surf Barranco
  - surf school Lima Costa Verde
  - surf lessons for adults Lima
- Map one primary intent per section/page.
- Define title/meta/H1 variants for ES and EN pages.

5. Define technical performance baseline
- Use static generation deployment strategy (Next.js/Nuxt) with CDN hosting.
- Set Core Web Vitals targets:
  - LCP <= 2.5s (aspirational <= 1.5s)
  - CLS <= 0.1
  - INP <= 200ms
- Ensure media optimization and mobile render checks.

6. Launch experiment and decision rule
- Run hyper-local Google Ads experiment (Miraflores, San Isidro, Barranco).
- Route to a dedicated executive wellness landing variant.
- Primary KPI: CAC for 4-class package close via WhatsApp.
- Apply scaling rule:
  - If CAC < 25% of package gross margin after 15 days, scale spend.
  - Otherwise audit WhatsApp script and landing friction before scaling.

## Decision Points
- Positioning emphasis:
  - If audience reports crowd/parking pain, emphasize anti-crowd proof earlier.
  - If audience reports budget sensitivity, emphasize package savings and progression value.
- CTA intensity:
  - If WhatsApp CTR is low, simplify CTA copy and increase intent-specific buttons.
  - If CTR is high but close rate is low, improve response speed and sales script.
- Traffic mix:
  - If SEO traction is early-stage, accelerate paid local search for demand capture.
  - If CAC is rising, rebalance toward high-intent SEO pages and remarketing.

## Quality Gates (Definition of Done)
- Strategic clarity:
  - Positioning statement is explicit and anti-crowd differentiator is evidence-backed.
- Offer clarity:
  - 1/4/8 class ladder is clear; 4-class package is visually prioritized.
- Conversion readiness:
  - All core CTAs deep-link to WhatsApp with prefilled intent messages.
- Operational readiness:
  - Team can respond in <= 10 minutes during campaign windows.
- Measurement readiness:
  - Dashboard tracks at minimum: WhatsApp CTR, package mix, close rate, and CAC for 4-class package.
- SLA readiness:
  - Team is staffed to sustain <= 10 minute response times in campaign windows.
- Performance readiness:
  - Mobile pages meet CWV targets in staging and production checks.

## Output Format
Return the result in this order:
1. Executive summary (5-8 lines)
2. Prioritized initiatives table (impact, effort, metric)
3. Commercial matrix (pricing, upsell, payment flow)
4. Mobile-first sitemap + textual wireframe
5. Bilingual SEO action plan
6. Risks/assumptions
7. Next experiment (hypothesis, metric, decision threshold)

## Example Prompts
- Create a corporate surf wellness go-to-market plan for Barranquito targeting adults 25-45 in Lima.
- Rewrite our landing structure to maximize WhatsApp package sales (4 and 8 classes).
- Build a bilingual SEO plan (ES/EN) for transactional surf-intent keywords in Barranco.
- Audit our WhatsApp funnel and propose script fixes to reduce CAC for the 4-class package.
