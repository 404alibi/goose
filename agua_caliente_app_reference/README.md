# Agua Caliente App Reference

Comprehensive reference data extracted from the Agua Caliente casino app listings on Google Play Store and Apple App Store.

**Date Crawled:** 2026-02-16

## Sources

| Source | URL |
|--------|-----|
| Google Play (Main App) | https://play.google.com/store/apps/details?id=com.aguacaliente.AguaCaliente |
| Apple App Store (Main App) | https://apps.apple.com/us/app/agua-caliente/id354078926 |
| Apple App Store (Play Agua) | https://apps.apple.com/us/app/play-agua/id1504113741 |
| Google Play (Play Agua) | https://play.google.com/store/apps/details?id=com.gan.agua.slots |
| Brandfetch | https://brandfetch.com/aguacalientecasinos.com |

## Rust Module Structure

```
agua_caliente_app_reference/
├── mod.rs          # Module root — re-exports all submodules
├── app_info.rs     # App metadata, versions, features, privacy, version history
├── dimensions.rs   # Screen dimensions, UI element sizes, screenshot specs
├── assets.rs       # Images, animations, videos, graphics, fonts, typography
├── brand.rs        # Brand colors, design tokens, logo specs, UI screen descriptions
└── README.md       # This file
```

## Quick Reference

### App Identity

| Field | Main App | Play Agua |
|-------|----------|-----------|
| Name | AGUA CALIENTE | Play Agua |
| Version | 7.1.0 | 1.3.0 |
| Size (iOS) | 253 MB | 98.5 MB |
| Rating (iOS) | 4.8 ★ (860 ratings) | 4.6 ★ (~1,500 ratings) |
| Rating (Android) | 4.5 ★ (503 ratings) | 4.5 ★ |
| Category | Entertainment | Casino |
| iOS Min | 15.5 | 14.0 |
| Price | Free | Free (IAP) |
| Package (Android) | com.aguacaliente.AguaCaliente | com.gan.agua.slots |
| App ID (iOS) | 354078926 | 1504113741 |

### Brand Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Gold (Primary) | `#CEA719` | (206, 167, 25) | Accents, highlights, CTAs, reward badges |
| Teal (Primary) | `#01818C` | (1, 129, 140) | Logo, headers, navigation bars |
| Dark Brown | `#514A4A` | (81, 74, 74) | Subheadings, borders |
| Deep Blue | `#003366` | (0, 51, 102) | Footers, secondary text |
| Accent Red | `#C8102E` | (200, 16, 46) | Buttons, event banners (10-20% usage) |
| Button Gold | `#D4AF37` | (212, 175, 55) | Login/CTA buttons |
| Text Dark | `#333333` | (51, 51, 51) | Body text |
| Background Light | `#F5F5F5` | (245, 245, 245) | Light backgrounds |
| Gaming Dark | `#1A1A1A` | (26, 26, 26) | Play Agua dark backgrounds |

### App Dimensions

#### iOS Baseline Design Canvas
- **375 × 812 pt** (iPhone 14/15/16 standard)
- Safe area: 47pt top, 34pt bottom

#### Android Baseline Design Canvas
- **360 × 640 dp** (smallest phone viewport)
- Status bar: 24dp, Nav bar: 48dp

#### Key UI Element Sizes

| Element | iOS (pt) | Android (dp) |
|---------|----------|--------------|
| Min tap target | 44 × 44 | 48 × 48 |
| Nav/App bar height | 44 | 56 |
| Tab/Bottom nav height | 49 | 56 |
| Tab bar icon | 25 | 24 |
| Horizontal margin | 16 | 16 |
| Element spacing | 8 | 8 |
| Card corner radius | 12 | 28 |

### Fonts

| Font | Usage | Weights |
|------|-------|---------|
| Montserrat (or similar) | Headings, Logo, CTAs | Bold (700), ExtraBold (800), Black (900) |
| Open Sans / Roboto | Body text, UI labels | Regular (400), Medium (500) |
| SF Pro (iOS) | System UI | Regular, Medium, Semibold, Bold |
| Roboto (Android) | System UI | Regular (400), Medium (500), Bold (700) |
| Playfair Display | Luxury accents | Regular (400), Bold (700) |

### Typography Scale

| Role | Size (pt/sp) | Weight |
|------|-------------|--------|
| Display / Hero | 48 | ExtraBold |
| Headline 1 | 34 | Bold |
| Headline 2 | 28 | Bold |
| Title | 24 | Bold |
| Subtitle | 20 | Medium |
| Body Large | 17 | Regular |
| Body | 16 | Regular |
| Body Small | 14 | Regular |
| Caption | 12 | Regular |
| Overline / Label | 10 | Medium, Uppercase |

### Screenshot Dimensions

#### iOS App Store (pixels)
| Device | Width | Height |
|--------|-------|--------|
| iPhone 6.9" (Pro Max) | 1320 | 2868 |
| iPhone 6.7" (Plus) | 1290 | 2796 |
| iPhone 6.1" (Standard) | 1179 | 2556 |
| iPad Pro 12.9" | 2048 | 2732 |

#### Google Play Store (pixels)
| Type | Width | Height |
|------|-------|--------|
| Phone 1080p | 1080 | 1920 |
| Phone modern | 1080 | 2400 |
| Phone 1440p | 1440 | 2560 |

### App Screens (Post-2025 Redesign)

1. **Splash Screen** — Full-screen gold logo on dark bg, desert imagery, 2-3s load
2. **Login** — ACE Club Number + PIN, gold Login button, Forgot PIN link
3. **Home Dashboard** — Card feed, promo carousel, quick-action buttons, 5-tab bottom nav
4. **Rewards / ACE Club** — Tier progress circle, perks list, Redeem Points button
5. **Promotions & Events** — Filterable event cards, RSVP buttons, gamified "More Ways to Win"
6. **Profile / Settings** — Photo upload, notification toggles, Play Agua link
7. **Property Selector** — Segmented control for 3 locations
8. **Hotel Booking** — Date picker, room cards
9. **Dining Reservation** — Restaurant list, time slots
10. **Notification Center** — Timestamped notification list

### Animation Inventory

| Animation | Description |
|-----------|-------------|
| Splash Loader | Subtle logo animation, premium feel |
| Screen Transitions | Smooth slide/fade between screens |
| Pull-to-Refresh | Standard platform refresh on dashboard |
| Carousel Swipe | Horizontal promo card swipe |
| Button Feedback | Haptic + subtle scale on tap |
| Notification Badge | Red badge pulse on bell icon |
| Progress Circle | Animated tier advancement meter |
| Slot Reel Spin | Spinning reels in Play Agua |
| Win Celebration | Particle/confetti effects |
| Fortune Wheel | Rotating wheel with deceleration |

**Target:** 120 FPS, animations under 300ms

### Play Agua Game Assets

- **50+ slot titles** including: Roaming Reels, King of Bling, China Shores, Savannah Storm, Treasure Voyage
- **Table games:** Roulette, Blackjack, Video Poker
- **UI elements:** Fortune Wheel, Daily Bonus Popup, Challenge Progress Bars, Chip/Token Icons
- **Visual style:** Dark casino backgrounds (#1A1A1A) with neon accents, gold win animations
