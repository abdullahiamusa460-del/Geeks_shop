---
name: Velora Contemporary Studio
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5c5e64'
  on-secondary: '#ffffff'
  secondary-container: '#e0e2e8'
  on-secondary-container: '#62646a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1f'
  on-tertiary-container: '#818488'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e0e2e8'
  secondary-fixed-dim: '#c4c6cc'
  on-secondary-fixed: '#191c20'
  on-secondary-fixed-variant: '#44474c'
  tertiary-fixed: '#e0e2e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#191c1f'
  on-tertiary-fixed-variant: '#44474a'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  nav-link:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter: 1.5rem
  container-max-width: 1280px
---

## Brand & Style

This design system embodies a modern, elevated, and minimalist e-commerce aesthetic calibrated for contemporary fashion, streetwear, and lifestyle apparel. It communicates understated luxury, tactile precision, and effortless utilitarian sophistication.

### Target Audience & Emotional Impact
The target audience consists of design-conscious, modern urban consumers who appreciate structured tailoring, premium basics, and frictionless digital commerce. The interface evokes feelings of composure, trust, and curated clarity by prioritizing generous negative space, crisp black focal points, and soft neutral tone transitions.

### Design Movement & Core Principles
- **Modern Monochromatic Minimalism:** Relying on tonal grayscale harmony, high-contrast typography, and pure functional clarity rather than ornamental decoration.
- **Editorial Photographic Prominence:** Clean UI architecture serves as a quiet frame for rich product imagery, soft natural shadows, and macro fabric textures.
- **Micro-Structured Tactility:** Pill badges, square swatch rings, and rounded container viewports introduce tactile, reassuring tap targets that make shopping intuitive and seamless.

## Colors

The color palette is built on strict neutral discipline, using deep obsidian blacks for key interactive calls-to-action and headers, paired with balanced slate charcoals, soft ash borders, and warm muted off-whites for surfaces.

### Functional Roles
- **Primary (`#111111`):** Applied to primary action buttons ("Add to Cart"), major headings, active navigation elements, selected size swatches, and prominent badge chips.
- **Secondary (`#4A4D52`):** Used for descriptive body copy, secondary microcopy, product metadata labels, and inactive icon states.
- **Tertiary (`#E5E7EB`):** Reserved for delicate divider rules, container stroke boundaries, unselected size chip borders, and swatch halo rings.
- **Neutral Surface (`#F8F8F8`):** Serves as secondary surface fills, product image backdrop tints, and subtle badge backgrounds (e.g., "New Arrival" tag).
- **Pure Canvas (`#FFFFFF`):** Base canvas background for ultimate legibility and crisp contrast.
- **Accent Sand (`#E8DFD8`):** Contextual swatch tint for natural textile variants alongside standard heather grays (`#C8CBD0`) and matte blacks (`#111111`).

## Typography

The typographic hierarchy utilizes **Plus Jakarta Sans** uniformly across display, body, and label roles. Its geometric construction, subtle warmth, and modern proportional rhythm balance high-fashion editorial presence with effortless digital reading.

### Hierarchy & Style Rules
- **Brand Wordmark:** Rendered in bold geometric uppercase with expanded tracking (`0.08em`) to assert architectural authority.
- **Product Titles:** Set at `headline-lg` (`32px`, bold) with tight negative tracking (`-0.02em`) to maintain a clean, compact footprint above the price block.
- **Pricing & Highlights:** Primary price is displayed at `22px` semibold, while crossed-out comparison prices sit at `14px` muted gray, accented by a solid black discount tag.
- **Labels & Micro-Navigation:** Navigation links and attribute titles ("Color:", "Size:") feature semibold weights with uppercase transformations or distinct baseline alignments.

## Layout & Spacing

The layout model is anchored on an 8px modular spacing system, operating within a centered max-width container (`1280px`) with fluid edge margins.

### Grid Architecture
- **Desktop (1024px and up):** 12-column grid structure. Product details utilize an asymmetrical split: a 7-column media gallery paired with a 5-column sticky purchase column.
- **Thumbnail Strip:** Sits vertically aligned to the left of the main stage image with an 80px fixed width and 12px vertical gaps.
- **Related Products Row:** 4-column equal distribution with 24px gutters.
- **Mobile (< 768px):** Reflows into a single full-width column. The image gallery transitions into a horizontal swipe carousel with dot pagination, followed by purchase actions anchored to the viewport bottom.

## Elevation & Depth

This system avoids heavy drop shadows, opting instead for crisp structural boundaries, flat tonal nesting, and subtle outline definition.

### Elevation Strategy
- **Layer 0 (Base Canvas):** `#FFFFFF` pure white canvas.
- **Layer 1 (Card & Imagery Plates):** Subtle neutral background (`#F4F4F5` / `#F8F8F8`) framing product apparel without harsh drop shadows.
- **Layer 2 (Interactive Outlines):** Low-contrast borders (`1px solid #E5E7EB`) define unselected inputs, secondary buttons, and thumbnail frames.
- **Layer 3 (Active Overlays & Menus):** Floating action buttons (such as quick-zoom) and dropdown dialogs utilize an ambient shadow: `0 8px 24px rgba(0, 0, 0, 0.08)`.
- **Layer 4 (Modals & Drawers):** High-level overlay backdrops with 20% alpha black and 4px backdrop blur.

## Shapes

The shape hierarchy combines softened structural rectangles with circular indicators and pill chips, establishing a contemporary, approachable silhouette.

### Radius System
- **Product Media & Main Containers:** `rounded-lg` (`12px` / `0.75rem` to `16px` / `1rem`) for large product photo backdrops, zoom plates, and banner cards.
- **Interactive Buttons & Selectors:** `8px` (`0.5rem`) for primary action buttons, wishlist squares, and size selection blocks.
- **Badge Chips:** Fully rounded pill capsules (`9999px`) for contextual statuses like "New Arrival".
- **Color Swatches:** Concentric `50%` circles, with a 2px offset border identifying the active option.

## Components

### Buttons
- **Primary ("Add to Cart"):** Full-width, high-density black button (`#111111`) with white text, 8px corner radius, internal icon prefix, 48px height, and subtle scale down on tap.
- **Icon Action ("Wishlist"):** Square 48px × 48px button with a 1px solid border (`#E5E7EB`), centered vector heart icon, and hover state tinting to `#F4F4F5`.

### Size Selectors & Chips
- **Size Squares:** 44px × 44px minimal boxes. Inactive states feature a `1px solid #E5E7EB` border and muted text; the selected state fills solid `#111111` with white text.
- **Category & Feature Badges:** Pill-shaped capsules with a light ash background (`#F4F4F5`), dark typography (`#111111`), and 4px vertical / 12px horizontal padding.

### Color Swatches
- 28px circular color fills. The active swatch is surrounded by a 2px outer outline ring separated by a 2px white gap.

### Product Detail Tabs
- Minimalist horizontal tab bar with active items indicated by a crisp 2px black bottom line indicator and font weight shift to semibold.

### Value Proposition / Feature Callouts
- Horizontal cluster featuring minimal line-art icons paired with a 2-line vertical micro-stack (bold 12px title + 11px muted description) without enclosing containers.

### Product Grid Cards
- Rounded image preview window with a top-right or bottom-right quick-wishlist trigger, followed by vertically stacked clean typography (product name at 14px bold, price at 13px regular).