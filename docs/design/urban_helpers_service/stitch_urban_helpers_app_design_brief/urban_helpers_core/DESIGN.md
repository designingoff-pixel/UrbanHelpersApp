---
name: Urban Helpers Core
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434655'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
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
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
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
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a premium, service-oriented ecosystem that balances professional reliability with modern accessibility. The visual language utilizes a "Sophisticated Tech-Service" aesthetic, characterized by high-clarity layouts, soft floating surfaces, and intentional whitespace. 

The system employs a refined Corporate-Modern style with subtle Glassmorphic influences. It emphasizes a sense of "lightness" and "fluidity" through the use of translucent layers and soft-focus shadows, ensuring that the onboarding and authentication experience feels frictionless and trustworthy. The primary goal is to project competence and ease-of-use for a diverse user base navigating urban services.

## Colors

The palette is anchored by a high-contrast Primary Blue for action and authority, supported by a Secondary Teal that signals growth and service completion. 

- **Background:** A cool-tinted off-white (#F7F9FC) provides a low-strain canvas that differentiates from pure white surface cards.
- **Surface:** Pure white (#FFFFFF) is reserved for interactive cards and modals to maximize perceived elevation.
- **Accents:** A logical hierarchy of status colors is established—Violet for tertiary interactions, Red for critical health/error states, and Orange for urgent/emergency alerts.
- **Interactive States:** Use a 10% overlay of the primary color for hover states and 20% for active/pressed states.

## Typography

This design system uses a dual-font strategy to separate brand personality from functional utility.

- **Headings:** Plus Jakarta Sans is used for all titles and display text. Its soft, geometric curves provide a modern, welcoming tone. Tighten letter spacing on larger sizes to maintain a premium "editorial" feel.
- **Body & Interface:** Manrope is used for all long-form text, inputs, and labels. Its high legibility and balanced proportions ensure clarity in data-heavy screens and multi-step forms.
- **Hierarchy:** Maintain a clear vertical rhythm by using `body-md` for standard UI text and `headline-md` for section headers within onboarding cards.

## Layout & Spacing

The layout utilizes a 12-column fluid grid for desktop and a single-column layout for mobile. 

- **Onboarding Specifics:** Center-aligned "Floating Surface" layouts are preferred for authentication. The main interaction card should have a maximum width of 480px on desktop to maintain focus.
- **Margins:** Use 24px (md) for mobile side margins and 48px (lg) for tablet/desktop side margins.
- **Rhythm:** An 8px base grid governs all padding and margins. Vertical spacing between form elements should consistently be 24px to ensure tap targets are generous and visual breathing room is preserved.

## Elevation & Depth

Hierarchy is established through a "Floating Layer" logic. 

- **Level 0 (Background):** #F7F9FC, flat.
- **Level 1 (Primary Cards):** Pure white with a 24px radius. Use a sophisticated ambient shadow: `0px 12px 32px rgba(37, 99, 235, 0.06)`. The slight blue tint in the shadow links the surface to the primary brand color.
- **Glassmorphism:** For overlays, navigation bars, or secondary background elements, use a backdrop blur of 12px with a 70% white opacity. Add a 1px solid white inner border (20% opacity) to simulate light catching the edge of the "glass."

## Shapes

The shape language is "Hyper-Soft." Every interactive element is rounded to eliminate visual tension.

- **Surfaces:** Large containers and cards use a 24px radius to feel approachable.
- **Buttons:** An 18px radius creates a distinct "pill-lite" look that separates actions from form fields.
- **Inputs:** A 16px radius ensures form fields feel integrated into the soft layout without becoming fully circular.
- **Icons:** Use "Linear Light" icon sets with rounded caps and joins to match the typography's softness.

## Components

### Buttons
- **Primary:** Filled #2563EB with white text. 18px radius. Height: 56px for main onboarding actions.
- **Secondary:** Transparent background with #2563EB border (1.5px) and text.
- **Tertiary:** Ghost style; no border, #2563EB text, subtle gray background on hover.

### Input Fields
- **Default State:** 16px radius, #E5E7EB border, #FFFFFF fill. 16px horizontal padding.
- **Focus State:** 1.5px border #2563EB with a 4px soft outer glow (10% opacity primary color).
- **Labels:** Always use `label-md` positioned above the input with an 8px gap.

### Onboarding Cards
- **Structure:** 24px radius, soft ambient shadow, 40px internal padding for desktop (24px for mobile).
- **Header:** Center-aligned `headline-md` followed by `body-sm` in a neutral gray for subtext.

### Chips & Badges
- **Style:** Small 8px radius or fully pill-shaped.
- **Categorization:** Use the 8-category system for service tagging. For authentication, use a "Security Badge" with a subtle green wash (#14B8A6 at 10% opacity) to signal a secure connection.

### Steppers (Progress Indicators)
- Use horizontal "Dash" style indicators. Active steps are #2563EB, inactive steps are #E5E7EB. 4px height with rounded ends.