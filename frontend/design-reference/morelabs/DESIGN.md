---
version: alpha
name: "More Labs Light"
description: "Typography baseline relies on CircularStd-Book for primary hero/slide heading (h1)."
colors:
  black-overlay: "#000000"
  bright-blue-accent: "#0194ce"
  light-blue-tint: "#e5f5fc"
  white-surface: "#ffffff"
  navy-primary: "#004876"
typography:
  hero-heading:
    fontFamily: "CircularStd-Book"
    fontSize: "55.44px"
    fontWeight: "400"
    lineHeight: "1.2"
  section-heading:
    fontFamily: "CircularStd-Book"
    fontSize: "36.8px"
    fontWeight: "400"
    lineHeight: "44.16px"
  sub-heading:
    fontFamily: "CircularStd-Book"
    fontSize: "24.84px"
    fontWeight: "400"
    lineHeight: "37.26px"
  body-regular:
    fontFamily: "CircularStd-Book"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "24px"
  body-bold:
    fontFamily: "CircularStd-Bold"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "25.6px"
  small-label:
    fontFamily: "CircularStd-Bold"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "22px"
  nav-item:
    fontFamily: "CircularStd-Book"
    fontSize: "15px"
    fontWeight: "400"
    lineHeight: "22.5px"
  medium-label:
    fontFamily: "CircularStd-Medium"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "16.8px"
rounded:
  pill: "30px"
  large-pill: "25px"
  circle: "170px"
  subtle: "3px"
  small: "15px"
spacing:
  xs: "5px"
  sm: "8px"
  md-sm: "10px"
  md: "15px"
  md-lg: "18px"
  lg: "20px"
  xl: "25px"
  2xl: "30px"
  3xl: "40px"
  4xl: "45px"
  5xl: "50px"
  6xl: "100px"
components:
  brand-identity:
    textColor: "{colors.navy-primary}"
    fontSize: "19.8px"
    backgroundColor: "rgba(0,0,0,0)"
    padding: "0px"
  button-primary-filled:
    backgroundColor: "{colors.navy-primary}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.pill}"
    borderWidth: "2px"
    borderColor: "{colors.navy-primary}"
    padding: "10px 22px"
    fontSize: "14px"
    boxShadow: "none"
  button-secondary-outlined:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.navy-primary}"
    rounded: "{rounded.pill}"
    borderWidth: "2px"
    borderColor: "{colors.navy-primary}"
    padding: "10px 18px"
    fontSize: "16px"
    boxShadow: "none"
  hero:
    headingFontSize: "55.44px"
    headingColor: "{colors.navy-primary}"
    subHeadingFontSize: "24.15px"
    subHeadingColor: "{colors.navy-primary}"
    ctaVariant: "secondary-outlined"
    layout: "centered overlay on full-bleed image"
  icon-action:
    textColor: "{colors.navy-primary}"
    backgroundColor: "rgba(0,0,0,0)"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
    fontSize: "18.4px"
    boxShadow: "none"
  navigation-desktop-nav:
    backgroundColor: "rgba(0,0,0,0)"
    textColor: "{colors.navy-primary}"
    padding: "0px 50px 0px 35px"
    fontSize: "15.2px"
    borderWidth: "0px"
    boxShadow: "none"
  navigation-menu-item:
    textColor: "{colors.navy-primary}"
    backgroundColor: "rgba(0,0,0,0)"
    fontSize: "15.2px"
    rounded: "0px"
  promo-banner:
    backgroundColor: "{colors.navy-primary}"
    textColor: "{colors.white-surface}"
    fontSize: "14px"
    padding: "8px 0px"
  trust-signal-quote:
    fontSize: "24.84px"
    fontFamily: "CircularStd-Book"
    textColor: "{colors.navy-primary}"
    layout: "left-aligned large quote text"
  trust-signal-stat-card:
    backgroundColor: "{colors.navy-primary}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.large-pill}"
    padding: "20px 25px"
---

## Overview

Typography baseline relies on CircularStd-Book for primary hero/slide heading (h1).

This system uses a 5px base grid with scale values 5, 8, 10, 15, 18, 20, 25, 30, 40, 45, 50, 100.

**Signature traits:**
- Core token rhythm: Token evidence indicates consistent color, spacing, and radius rhythm across visible UI.

## Colors

The palette uses 5 validated color tokens across 1 theme profile. Semantic roles stay attached to observed usage so generation agents can choose accents without inventing new color meaning.

**Semantic naming:**
- **action-text** maps to `navy-primary`: Role "text" is grounded by usage context "All headings, body text, borders, button fills, links, and brand accents site-wide".
- **action-background** maps to `white-surface`: Role "background" is grounded by usage context "Page background, card surfaces, secondary button fill, input backgrounds".
- **surface-background** maps to `light-blue-tint`: Role "background" is grounded by usage context "Subtle section background tint, tag/badge surfaces".
- **content-background** maps to `bright-blue-accent`: Role "background" is grounded by usage context "Savings tag, highlight accent".

### Text Scale
- **Navy Primary** (#004876): All headings, body text, borders, button fills, links, and brand accents site-wide. Role: text. {authored: rgb(0, 72, 118), space: rgb, alpha: 0.05}

### Surface & Shadows
- **Black Overlay** (#000000): Overlay/scrim layer for modals and drawers. Role: background. {authored: rgba(0, 0, 0, 0.4), space: rgb, alpha: 0.4}
- **Bright Blue Accent** (#0194ce): Savings tag, highlight accent. Role: background. {authored: rgb(1, 148, 206), space: rgb}
- **Light Blue Tint** (#e5f5fc): Subtle section background tint, tag/badge surfaces. Role: background. {authored: rgb(229, 245, 252), space: rgb}
- **White Surface** (#ffffff): Page background, card surfaces, secondary button fill, input backgrounds. Role: background. {authored: rgb(255, 255, 255), space: rgb, alpha: 0.2}

## Typography

Typography uses CircularStd-Book, CircularStd-Bold, CircularStd-Medium across extracted hierarchy roles. Keep hierarchy mapped to these token rows before adding decorative type styles.

Mixes CircularStd-Book and CircularStd-Bold and CircularStd-Medium for visual contrast. Sizes range from 14px to 55.44px.

### Font Roles
- **Headline Font**: CircularStd-Book
- **Body Font**: CircularStd-Book

### Type Scale Evidence
| Role | Font | Size | Weight | Line Height | Letter Spacing | Stack / Features | Notes |
|------|------|------|--------|-------------|----------------|------------------|-------|
| Primary hero/slide heading (h1) | CircularStd-Book | 55.44px | 400 | 1.2 | normal | CircularStd-Book | Extracted token |
| Section-level h2/h3 headings | CircularStd-Book | 36.8px | 400 | 44.16px | normal | CircularStd-Book | Extracted token |
| Slide sub-headings, callout text | CircularStd-Book | 24.84px | 400 | 37.26px | normal | CircularStd-Book | Extracted token |
| Primary body copy, descriptions | CircularStd-Book | 16px | 400 | 24px | normal | CircularStd-Book | Extracted token |
| Emphasized body text, labels, nav items | CircularStd-Bold | 16px | 400 | 25.6px | normal | CircularStd-Bold | Extracted token |
| Button labels, small UI labels | CircularStd-Bold | 14px | 400 | 22px | normal | CircularStd-Bold | Extracted token |
| Navigation menu items | CircularStd-Book | 15px | 400 | 22.5px | normal | CircularStd-Book | Extracted token |
| Tag labels, badge text, secondary UI labels | CircularStd-Medium | 14px | 400 | 16.8px | normal | CircularStd-Medium | Extracted token |

## Layout

Responsive system uses 4 breakpoint tier(s): mobile, tablet, desktop, wide.

### Responsive Strategy
- **mobile (320-1439px)**: Constrain layout for small viewports and prioritize vertical stacking.
- **tablet (768-1100px)**: Increase spacing and column structure for medium-width viewports.
- **desktop (1024-1439px)**: Expand layout density and horizontal composition for wide viewports.
- **wide (1440-1599px)**: Stretch composition with generous gutters and wider layout spans.

### Spacing System
| Token | Value | Px | Notes |
|------|-------|----|-------|
| xs | 5px | 5 | Extracted spacing token |
| sm | 8px | 8 | Extracted spacing token |
| md-sm | 10px | 10 | Extracted spacing token |
| md | 15px | 15 | Extracted spacing token |
| md-lg | 18px | 18 | Extracted spacing token |
| lg | 20px | 20 | Extracted spacing token |
| xl | 25px | 25 | Extracted spacing token |
| 2xl | 30px | 30 | Extracted spacing token |
| 3xl | 40px | 40 | Extracted spacing token |
| 4xl | 45px | 45 | Extracted spacing token |
| 5xl | 50px | 50 | Extracted spacing token |
| 6xl | 100px | 100 | Extracted spacing token |

## Elevation & Depth

Keep depth flat unless validated shadow or interaction evidence appears in the extraction payload. Do not invent shadows beyond this evidence boundary.

### Shadow Evidence
| Shadow Token | Layers | Details |
|--------------|--------|---------|
| card-elevation | 2 | 0px 4px 20px 0px rgba(0, 0, 0, 0.1) |

### Interaction Signals
| Theme | Signal | Evidence |
|-------|--------|----------|
| Light | backdrop-filter | blur(12px) |
| Light | outline-color | rgb(0, 72, 118) ; rgb(255, 255, 255) ; rgb(0, 72, 116) |
| Light | outline-width | 3px ; 0px |
| Light | outline-offset | 0px |
| Light | transform | matrix(1, 0, 0, 1, 0, 0) ; matrix(1, 0, 0, 1, -428.951, 0) ; matrix(1, 0, 0, 1, -432.428, 0) |

## Shapes

Shape language maps directly to rounded tokens. Keep component corners consistent with the role mapping below before introducing bespoke geometry.

### Radius Roles
| Token | Value | Px | Role Mapping |
|------|-------|----|--------------|
| subtle | 3px | 3 | Subtle corner |
| small | 15px | 15 | Card corner |
| large-pill | 25px | 25 | Large surface corner |
| pill | 30px | 30 | Large surface corner |
| circle | 170px | 170 | Large surface corner |

### Geometry Evidence
| Radius Token | Shape | Units |
|--------------|-------|-------|
| pill | 30px | px |
| large-pill | 25px | px |
| circle | 170px | px |
| subtle | 3px | px |
| small | 15px | px |

## Components

Components should be recreated from token references first, then tuned with variant notes and probe-backed state guidance.
- **Primary CTA Button**: Filled pill-shaped button with navy background and white text, used for primary purchase/shop actions
- **Site Navigation**: Horizontal top navigation bar with transparent background, navy text links, and hamburger menu icon on mobile
- **Hero Slide**: Full-bleed lifestyle photography hero with centered overlay heading, sub-heading, and CTA button
- **Announcement Bar**: Thin scrolling marquee bar at top of page with promotional messages and links
- **Logo**: Centered wordmark logo linking to homepage
- **Icon Button**: Circular icon-only button used for accessibility and utility actions (e.g., accessibility widget)
- **Social Proof Block**: Testimonial/quote block with large pull-quote text and a stat callout card (e.g., 'Over 4,500 Five Star Reviews')

### Brand Identity

**default**
- textColor: #004876
- fontSize: 19.8px
- backgroundColor: rgba(0,0,0,0)
- padding: 0px
- State guidance: Probe-confirmed: a.logo__image-link

### Button

**primary-filled**
- backgroundColor: #004876
- textColor: #ffffff
- rounded: 30px
- borderWidth: 2px
- borderColor: #004876
- padding: 10px 22px
- fontSize: 14px
- boxShadow: none
- State guidance: Probe-confirmed: button.btn â navy fill, white text, 30px radius, 2px border

**secondary-outlined**
- backgroundColor: #ffffff
- textColor: #004876
- rounded: 30px
- borderWidth: 2px
- borderColor: #004876
- padding: 10px 18px
- fontSize: 16px
- boxShadow: none
- State guidance: Probe-confirmed: a.slide__btn â white fill, navy text/border, 30px radius, matches --COLOR-BUTTON-SECONDARY-BG and --COLOR-BUTTON-SECONDARY-TEXT

### Hero

**default**
- headingFontSize: 55.44px
- headingColor: #004876
- subHeadingFontSize: 24.15px
- subHeadingColor: #004876
- ctaVariant: secondary-outlined
- layout: centered overlay on full-bleed image
- State guidance: Probe-confirmed: h1.slide__heading (55.44px), h2.slide__text (24.15px), a.slide__btn (outlined button)

### Icon Action

**default**
- textColor: #004876
- backgroundColor: rgba(0,0,0,0)
- rounded: 30px
- padding: 8px
- fontSize: 18.4px
- boxShadow: none
- State guidance: Probe-confirmed: button.icon-fallback-text

### Navigation

**desktop-nav**
- backgroundColor: rgba(0,0,0,0)
- textColor: #004876
- padding: 0px 50px 0px 35px
- fontSize: 15.2px
- borderWidth: 0px
- boxShadow: none
- State guidance: Probe-confirmed: #NavStandard â transparent bg, navy text, generous horizontal padding

**menu-item**
- textColor: #004876
- backgroundColor: rgba(0,0,0,0)
- fontSize: 15.2px
- rounded: 0px
- State guidance: Probe-confirmed: div.menu__item

### Promo Banner

**default**
- backgroundColor: #004876
- textColor: #ffffff
- fontSize: 14px
- padding: 8px 0px
- State guidance: Visually confirmed in screenshot â navy background, white text, scrolling ticker

### Trust Signal

**quote**
- fontSize: 24.84px
- fontFamily: CircularStd-Book
- textColor: #004876
- layout: left-aligned large quote text

**stat-card**
- backgroundColor: #004876
- textColor: #ffffff
- rounded: 25px
- padding: 20px 25px
- State guidance: Visually confirmed in screenshot â navy rounded card with white text stat

## Do's and Don'ts

Guardrails protect Core token rhythm without adding unsupported visual claims.

| Do | Don't |
|----|---------|
| Do maintain consistent spacing using the base grid | Don't make unsupported claims about absent visual features |
| Do maintain WCAG AA contrast ratios (4.5:1 for normal text) | Don't mix rounded and sharp corners in the same view |
| Do use the primary color only for the single most important action per screen |  |
| Do verify evidence before writing new design-system guidance |  |

## Responsive Evidence

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <= 380px | only screen and (max-width: 380px) |
| Mobile | <= 400px | only screen and (max-width: 400px) |
| Mobile | <= 479px | only screen and (max-width: 479px) |
| Mobile | <= 480px | (max-width: 480px) |
| Mobile | <= 500px | only screen and (max-width: 500px) |
| Mobile | <= 550px | only screen and (max-width: 550px) |
| Mobile | <= 667px | (max-width: 667px) |
| Mobile | <= 668px | screen and (max-width: 668px) |
| Mobile | <= 670px | only screen and (max-width: 670px) |
| Mobile | <= 737px | only screen and (max-width: 737px) |
| Mobile | <= 750px | screen and (max-width: 750px) |
| Mobile | <= 767px | (max-width: 767px) |
| Breakpoint 13 | <= 768px | only screen and (max-width: 768px) |
| Breakpoint 14 | <= 800px | screen and (max-height: 300px), screen and (max-width: 800px) and (orientation: landscape) |
| Breakpoint 15 | <= 900px | (max-width: 900px) |
| Breakpoint 16 | <= 966px | (max-width: 966px) |
| Breakpoint 17 | <= 980px | (max-width: 980px) |
| Breakpoint 18 | <= 1023px | (max-width: 1023px) |
| Breakpoint 19 | <= 1199px | only screen and (max-width: 1199px) |
| Breakpoint 20 | <= 1260px | (max-width: 1260px) |

## Agent Prompt Guide

### Example Component Prompts
- Create Announcement Bar variant that preserves Thin scrolling marquee bar at top of page with promotional messages and links.
- Create Hero Slide variant that preserves Full-bleed lifestyle photography hero with centered overlay heading, sub-heading, and CTA button.
- Create Icon Button variant that preserves Circular icon-only button used for accessibility and utility actions (e.g., accessibility widget).

### Iteration Guide
1. Start with extracted palette and typography roles only.
2. Map spacing and radius directly from token tables before visual polish.
3. Apply component patterns one section at a time and compare against source intent.
4. Keep elevation claims tied to explicit evidence in output.
5. Iterate with smallest diffs and re-check section hierarchy after each change.
