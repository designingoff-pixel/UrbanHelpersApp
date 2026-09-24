---
name: Luminous Nocturne
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 16px
  card-gap: 24px
  section-margin: 48px
---

## Brand & Style

The design system is engineered for **Urban Helpers**, a premium service platform demanding high glanceability and a flagship aesthetic. The brand personality is authoritative yet vibrant, evoking the feeling of a high-end command center for one's urban lifestyle and well-being.

The visual style follows a **Luminous Nocturne** approach: a deep, saturated dark mode that uses light not just for visibility, but as a functional signifier. Drawing inspiration from futuristic health interfaces and premium automotive dashboards, the system prioritizes high-contrast focal points against expansive, light-absorbing backgrounds. The aesthetic is clean, professional, and uncompromisingly modern, utilizing subtle gradients and 3D depth to create a tactile, "flagship" experience.

## Colors

The palette is anchored by a two-tone dark foundation: **Deep Navy** for primary backgrounds and **Midnight Blue** for surface containers and elevated cards. 

Functionality is mapped to specific luminous color pairings:
- **Electric Blue & Cyan:** Reserved for Authentication and core system actions.
- **Purple & Violet:** Dedicated to Profile, personal settings, and identity.
- **Teal & Green:** Indicates Security, health verification, and successful states.
- **Orange & Coral:** High-priority Alerts, notifications, and urgent interventions.

Avoid pure black (#000000) to maintain color depth. All accents should be applied as vibrant "glows" or gradients against the dark base to ensure they appear light-emitting.

## Typography

This design system uses a dual-font strategy to balance character with utility. **Plus Jakarta Sans** is used for all headings and display text to provide a modern, premium, and slightly rounded feel. **Inter** is utilized for body text and functional labels to ensure maximum legibility and a systematic, technical appearance.

Hierarchy is enforced through drastic scale differences. "Display" and "Headline" levels should be treated as hero elements. For mobile, headline sizes are scaled down slightly to maintain glanceability without overwhelming the viewport. Use "Label-MD" with increased letter spacing for category headers and overlines.

## Layout & Spacing

The layout philosophy follows a **fluid-to-fixed adaptive grid**. On mobile, a 4-column grid with 20px margins is used. On desktop, the layout expands to a 12-column grid with a maximum content width of 1440px.

Spacing relies on a strict 8px linear scale. Group related components using 8px or 16px gaps, while distinct sections should be separated by 48px or more to maintain the premium, spacious feel. High-glanceability is achieved by providing generous "air" around critical data points, preventing the dark background from feeling claustrophobic.

## Elevation & Depth

In this design system, depth is communicated through **Tonal Layering** and **Luminous Accents** rather than traditional drop shadows.

1.  **Level 0 (Floor):** Deep Navy (#071522).
2.  **Level 1 (Card/Surface):** Midnight Blue (#0B1D2A). These surfaces are solid or use subtle vertical gradients.
3.  **Level 2 (Interaction/Pop):** Accent-tinted outlines (1px, 10% opacity) or very soft, wide-spread ambient glows that match the category color (e.g., a soft green glow for security cards).

Avoid transparent glass backgrounds for primary cards to ensure information density and contrast. Use backdrop blurs (Glassmorphism) exclusively for floating navigation bars or modal overlays to maintain context of the layer beneath.

## Shapes

The shape language is defined by large, friendly radii that mirror flagship hardware design. 
- **Standard Cards:** 24px corner radius.
- **Buttons:** Fully rounded (pill-shaped) to provide a distinct interactive affordance.
- **Input Fields:** 16px corner radius.

The "Rounded" setting (0.5rem base) scales up to a 1.5rem (24px) `rounded-xl` for primary containers. This softness balances the "tech-heavy" dark mode and high-contrast typography, making the interface feel approachable.

## Components

### Buttons
Primary buttons are pill-shaped and utilize vibrant linear gradients (e.g., Electric Blue to Cyan). They should feature a subtle "inner glow" on the top edge to simulate a 3D glass effect. Secondary buttons use a Midnight Blue fill with a 1px colored border.

### Cards
Cards are the primary container. They must use the 24px corner radius. For flagship features, use a subtle 45-degree gradient fill (Midnight Blue to a slightly lighter Navy). 3D illustrations for health and home services should sit partially "outside" the card bounds or overlap the top-right corner to create depth.

### Input Fields
Fields are solid Midnight Blue with 16px corners. The "Active" state is indicated by a 2px border in the category-appropriate accent color (e.g., Electric Blue for login) and a faint outer glow.

### Chips & Tags
Small, semi-transparent capsules (20% opacity of the accent color) with high-contrast text. Used for status indicators and filtering.

### Health/Service Indicators
Use "Samsung Health 2026" inspired progress rings and data visualizations. These should use the Teal/Green palette for positive metrics and Orange/Coral for warnings, utilizing thick stroke widths and rounded caps.