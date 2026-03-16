# Story 2.6: Responsive Layout, Accessibility Audit, and CSS Foundations

Status: done

## Story

As a user,
I want the app to work flawlessly on any device from a 375px mobile screen to a wide desktop, with full keyboard and screen-reader support,
So that the todo app is usable for everyone regardless of device or ability.

## Acceptance Criteria

1. **Given** the app renders on a 375px-wide viewport **When** all features are exercised (create, toggle, delete) **Then** all interactive elements are visible and usable without horizontal scrolling (FR20).

2. **Given** touch-based interaction on a mobile device **When** tapping any interactive element **Then** all tap targets are ≥44×44px (WCAG 2.5.5) (FR21).

3. **Given** the app stylesheet (`App.css`) **When** inspected **Then** it uses CSS custom properties for all colours and spacing **And** the layout is mobile-first (base styles for mobile, media queries for larger screens).

4. **Given** the rendered app **When** an automated accessibility audit is run **Then** zero critical WCAG 2.1 AA violations are reported (NFR8) **And** all colour contrast ratios meet WCAG AA minimums (NFR11).

5. **Given** the app **When** navigated entirely by keyboard (Tab, Enter, Space) **Then** all actions — create, toggle, delete — are fully operable without a mouse (FR17, NFR9).

6. **Given** the app **When** navigated with a screen reader **Then** all interactive elements have descriptive accessible names (FR18, NFR10) **And** dynamic list changes are announced via the ARIA live region.

## Implementation Notes

- `App.css`: full CSS design system with custom properties for colours, spacing, border-radius, shadows
- Mobile-first layout with media query at 640px
- All interactive touch targets set to `min-height/min-width: var(--touch-target)` = 44px (WCAG 2.5.5)
- `.visually-hidden` utility for screen-reader-only text
- `:focus-visible` outline on all interactive elements (WCAG 2.4.7)
- ARIA live region (`aria-live="polite"`) in `TodoList.tsx` for dynamic list change announcements
- All buttons have `aria-label`; form input has `aria-required`, `aria-describedby`, `aria-invalid`
- Colour contrast: dark text `#111827` on white background (≥7:1 ratio); grey `#6b7280` on white (≥4.5:1)
- Loading spinner uses `role="status"` + `aria-live="polite"`
- Error banner uses `role="alert"` + `aria-live="assertive"`
