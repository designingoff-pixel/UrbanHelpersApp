---
name: Luminous Nocturne
colors:
  surface: '#041423'
  surface-dim: '#041423'
  surface-bright: '#2b3b4b'
  surface-container-lowest: '#000f1e'
  surface-container-low: '#0c1d2c'
  surface-container: '#112130'
  surface-container-high: '#1b2b3b'
  surface-container-highest: '#263646'
  on-surface: '#d4e4f9'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#d4e4f9'
  inverse-on-surface: '#223242'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4fdbc8'
  on-secondary: '#003731'
  secondary-container: '#04b4a2'
  on-secondary-container: '#003f38'
  tertiary: '#d2bbff'
  on-tertiary: '#3f008e'
  tertiary-container: '#8343f4'
  on-tertiary-container: '#f7edff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#041423'
  on-background: '#d4e4f9'
  surface-variant: '#263646'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
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
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is a premium, high-fidelity interface tailored for urban utility and emergency response. It prioritizes clarity and high-end aesthetics through a mix of **Glassmorphism** and **Corporate Modern** styles.

The visual narrative is "Illumination in the Dark." By using deep navy surfaces as a canvas, the UI utilizes vibrant primary and accent colors to guide the user's eye toward critical actions. Depth is achieved through layered semi-transparent surfaces, soft ambient glows, and significant background blurs that simulate physical glass sheets floating over a digital landscape. The emotional response is one of calm, professional reliability, and technological sophistication.

## Colors

The palette is anchored by a deep navy foundation to ensure maximum contrast for "glow" effects. 

- **Primary & Secondary:** Used for high-priority interactive elements and status indicators.
- **Accent:** Reserved for special features, progress indicators, or premium tier highlights.
- **Surface Strategy:** Use the `#18344F` card color for primary content blocks. Use the Glass Surface (`rgba(255,255,255,0.06)`) with a `20px` backdrop blur for floating navigation, overlays, or secondary context panels.
- **Gradients:** Use linear gradients (top-left to bottom-right) blending Primary to Secondary or Primary to Accent to signify motion or active states.

## Typography

This design system uses **Plus Jakarta Sans** exclusively to maintain a modern, clean, and optimistic feel. 

- **Headings:** Should always be Bold (`700`). For large displays, use negative letter spacing to create a tighter, more "editorial" look.
- **Body Text:** Uses Medium (`500`) weight by default. This ensures legibility against dark backgrounds where regular weights can sometimes appear too thin due to light bleed.
- **Captions:** Use Regular (`400`) weight for meta-data and secondary info.
- **Scale:** Use `headline-lg-mobile` for screen titles on devices narrower than 600px.

## Layout & Spacing

The layout utilizes a **Fluid Grid** model with high internal padding to complement the large corner radii.

- **Grid:** 12-column grid for desktop (max-width 1440px), 8-column for tablet, and 4-column for mobile.
- **Rhythm:** An 8px linear scale is used. However, outer margins are generous (40px on desktop) to emphasize the "floating" nature of the glass modules.
- **Stacking:** Vertical spacing between cards should be consistent at `24px` to allow room for soft drop shadows to breathe without overlapping adjacent content excessively.

## Elevation & Depth

Depth is the defining characteristic of this design system. It is communicated through three specific tiers:

1.  **Floor (Level 0):** The Deep Navy background (`#071827`).
2.  **Raised (Level 1):** Secondary surfaces (`#10243B`) used for sidebars or grouping background elements.
3.  **Floating (Level 2):** Primary cards (`#18344F`) and Glass layers. These should feature a soft, diffuse shadow: `0px 20px 40px rgba(0, 0, 0, 0.4)`.

**Glow Effects:** Critical components (like Emergency buttons or Active status) should have an outer glow (box-shadow) using their own color at 20-30% opacity to simulate a neon-light effect on the dark surface.

## Shapes

The design system uses a hyper-rounded aesthetic to feel friendly and modern.

- **Cards & Modules:** Fixed at `30px` radius. This is a strict brand requirement.
- **Interactive Elements:** Buttons and Inputs use a softer, but still significant, roundedness. 
- **Icons:** Use **Material Symbols Rounded (Outlined)**. The rounded terminals of the icons must mirror the rounded corners of the UI components.

## Components

- **Buttons:** Primary buttons should be solid Primary Color or a Primary-to-Secondary gradient. Large padding (16px 32px) and `16px` radius.
- **Cards:** Background `#18344F` with a subtle 1px inner border of `rgba(255,255,255,0.1)` to define the edges against the dark background. Radius is `30px`.
- **Glass Modules:** Used for persistent navigation bars or modal overlays. `backdrop-filter: blur(20px)` and `background: rgba(255,255,255,0.06)`.
- **Input Fields:** Semi-transparent dark fills with a `12px` radius. On focus, the border should glow with the Primary color.
- **Chips/Badges:** Small, high-contrast pills. For Emergency, use a solid `#EF4444` fill with white text. For others, use low-opacity tints of the semantic colors with high-saturation text.
- **Progress Bars:** Use gradients for the "fill" portion to enhance the premium feel, with a glow on the leading edge.