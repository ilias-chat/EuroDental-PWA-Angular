---
name: Atmospheric Material
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e7e7f1'
  surface-container-highest: '#e1e2eb'
  on-surface: '#191b22'
  on-surface-variant: '#424753'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c2c6d5'
  surface-tint: '#005ac1'
  primary: '#0058bd'
  on-primary: '#ffffff'
  primary-container: '#2771df'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006e2c'
  on-secondary: '#ffffff'
  secondary-container: '#86f898'
  on-secondary-container: '#00722f'
  tertiary: '#765700'
  on-tertiary: '#ffffff'
  tertiary-container: '#956e00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004494'
  secondary-fixed: '#89fa9b'
  secondary-fixed-dim: '#6ddd81'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdea0'
  tertiary-fixed-dim: '#fbbc06'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#f9f9ff'
  on-background: '#191b22'
  surface-variant: '#e1e2eb'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  safe-area-bottom: 32px
---

## Brand & Style

This design system merges the structured logic of Material 3 with the approachability of Soft UI. The brand personality is helpful, optimistic, and highly intuitive, designed specifically for a mobile-first PWA experience. It prioritizes clarity through generous whitespace and tactile feedback.

The aesthetic utilizes **Soft UI** principles—gentle shadows and subtle tonal shifts—to make the interface feel physically present yet lightweight. This "Atmospheric" approach ensures that even complex PWA workflows feel airy and manageable. The goal is to evoke a sense of reliability and modern "Google-esque" efficiency while feeling more organic and comfortable for long-term mobile interaction.

## Colors

The color palette centers on the classic Google Blue as the primary anchor, symbolizing trust and action. Supporting colors utilize high-vibrancy tones (Emerald, Amber, Ruby) to denote success, warning, and error states, ensuring high glanceability on mobile screens.

We utilize a **Dynamic Active State** for high-priority interactive elements. Instead of flat fills, active or "pressed" states utilize a lush Indigo-to-Cyan gradient to provide visual depth and energy. Backgrounds remain off-white (#F8F9FA) to reduce harshness and allow soft shadows to be visible.

## Typography

The typography strategy employs **Plus Jakarta Sans** for headlines to mimic the friendly, geometric purity of Google's Product Sans. It provides a modern, sophisticated edge that feels approachable. For body text and labels, **Be Vietnam Pro** is used for its exceptional legibility and warm, contemporary feel on high-density mobile displays.

Hierarchy is maintained through clear weight distinctions rather than excessive size variance. Tracking is slightly tightened for larger headlines to maintain a cohesive "block" look, while labels are given extra breathing room for clarity at small sizes.

## Layout & Spacing

The design system uses a **Fluid Grid** model optimized for the PWA experience. The layout is structured around an 8px base unit to ensure alignment and rhythm. 

- **Margins:** A standard 20px side margin is used to prevent content from hitting the screen edge, creating a "contained" feel.
- **Vertical Rhythm:** Elements are stacked using increments of 8px, with 24px being the standard "breathable" gap between major sections.
- **PWA Considerations:** All layouts must account for the mobile safe-area-inset, particularly at the bottom to accommodate gesture bars. Bottom-sheet components should utilize the `safe-area-bottom` token for padding.

## Elevation & Depth

This system avoids harsh, singular shadows. Instead, it uses **Ambient Multi-Layered Shadows** to create a Soft UI effect. Surfaces do not "float" high above the background; they appear to be gently emerging from it.

Depth is created by combining a soft, large-blur shadow (e.g., 20px blur, 5% opacity) with a tighter, more saturated shadow at the base. This mimics the way light diffuses around soft-touch objects. For "Pressed" or "Active" states, the shadow should shrink and darken slightly to indicate the element being physically pushed into the surface.

## Shapes

The shape language is defined by **High-Radius Corners**. This design system favors organic, pill-shaped geometries over strict rectangles to enhance the "Soft UI" feel.

- **Base Components:** 16px radius for standard small elements (chips, small buttons).
- **Cards & Containers:** 24px to 32px radius to create a friendly, modern container look.
- **Interactive Elements:** Primary CTAs are fully pill-shaped (rounded-full) to provide a clear, tactile target for thumb interactions.

## Components

### Buttons
Primary buttons are pill-shaped with the Indigo-to-Cyan gradient. They utilize a subtle glow effect (a shadow tinted with the primary color) to signify importance. Secondary buttons are outlined with a soft 1.5px border or use a tonal surface fill.

### Cards
Cards are the primary content vessel. They feature a 24px corner radius and a very soft, diffused shadow. There are no borders on cards; depth is entirely communicated through the tonal difference between the card surface (#FFFFFF) and the page background (#F8F9FA).

### Inputs
Input fields use a "Soft Well" approach—they appear slightly recessed into the surface using a subtle inner shadow. When focused, the border transforms into the Primary Blue with a 2px thickness.

### Bottom Sheets
Crucial for PWAs, bottom sheets use a 32px top-corner radius. They should include a visible "grabber" handle at the top (32px wide, 4px high, rounded).

### Chips & Tags
Small, highly rounded (pill) elements used for filtering or status. Use high-vibrant supporting colors at 10% opacity for the background with full-vibrancy text for readability.