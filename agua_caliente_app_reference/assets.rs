// =============================================================================
// Agua Caliente App — Assets Reference
// =============================================================================
//
// Catalog of visual assets, animations, graphics, fonts, and media elements
// identified from app store listings, official website, and brand resources.
// Date crawled: 2026-02-16
//
// NOTE: Actual binary assets (images, videos, fonts) cannot be directly
// extracted from app stores without decompiling the APK/IPA. This module
// documents the asset types, descriptions, and specifications observed.

// ---------------------------------------------------------------------------
// Pictures / Images
// ---------------------------------------------------------------------------

/// Categories of images used in the Agua Caliente app
pub const IMAGE_CATEGORIES: &[(&str, &str)] = &[
    ("Splash Screen", "Full-screen logo on dark background with desert sunset imagery or tribal motifs"),
    ("App Icon", "Stylized Agua Caliente logo in gold on dark background, 1024x1024px (iOS), 512x512px (Android)"),
    ("Promo Banners", "Card-based promotional images for events, dining, entertainment — ~16:9 aspect ratio"),
    ("Casino Floor Photos", "High-end photography of gaming floors, slot machines, table games"),
    ("Resort Imagery", "Luxury hotel rooms, pools, spa facilities, desert landscapes"),
    ("Event Posters", "Concert and entertainment event promotional graphics"),
    ("Dining Photos", "Restaurant and food photography for reservation features"),
    ("Property Photos", "Exterior and interior shots of Rancho Mirage, Palm Springs, Cathedral City locations"),
    ("ACE Club Tier Badges", "Loyalty tier icons (Gold, Platinum, Diamond) — circular badge format"),
    ("Profile Avatars", "User profile placeholder and uploaded photo display"),
    ("QR Codes", "Generated QR codes for in-casino reward redemption"),
];

/// Image format specifications (inferred from platform standards)
pub const IMAGE_FORMATS: &[(&str, &str)] = &[
    ("App Icon", "PNG (no alpha for iOS, adaptive layers for Android)"),
    ("Screenshots", "PNG or JPEG, sRGB color space"),
    ("In-App Photos", "JPEG (compressed for mobile bandwidth)"),
    ("Promo Graphics", "PNG with transparency or JPEG"),
    ("Tier Badges/Icons", "PNG with transparency or SVG (vector)"),
];

// ---------------------------------------------------------------------------
// Play Agua — Game Assets
// ---------------------------------------------------------------------------

/// Slot game visual assets in Play Agua companion app
pub const SLOT_GAME_TITLES: &[&str] = &[
    "Roaming Reels",
    "King of Bling",
    "China Shores",
    "Savannah Storm",
    "Treasure Voyage",
];

pub const PLAY_AGUA_GAME_TYPES: &[&str] = &[
    "Slots (50+ titles)",
    "Roulette",
    "Blackjack",
    "Video Poker",
];

pub const PLAY_AGUA_ASSET_TYPES: &[(&str, &str)] = &[
    ("Slot Reel Symbols", "Themed icons per game — fruits, gems, animals, cultural symbols"),
    ("Slot Machine Frames", "Decorative borders around reel area, themed per game"),
    ("Table Game Layouts", "Roulette wheel, blackjack table, poker table graphics"),
    ("Chip/Token Icons", "Virtual currency display — gold coins, colored chips"),
    ("Fortune Wheel", "Spinning wheel graphic with prize segments, refreshes every 4 hours"),
    ("Win Animations", "Particle effects, coin showers, glow effects on wins"),
    ("Game Thumbnails", "Grid-view selection cards for each game (~16:9 or 1:1 aspect)"),
    ("Background Art", "Dark casino-themed backgrounds with neon accents"),
    ("Daily Bonus Popup", "Modal overlay with bonus amount and claim button"),
    ("Challenge Progress Bars", "Horizontal progress indicators for Daily/Weekly/Monthly challenges"),
];

// ---------------------------------------------------------------------------
// Animations & Motion
// ---------------------------------------------------------------------------

/// Animation types observed/described in the app
pub const ANIMATIONS: &[(&str, &str)] = &[
    ("Splash Screen Loader", "Subtle logo animation on launch — premium feel, 2-3 second duration"),
    ("Screen Transitions", "Smooth slide/fade transitions between screens"),
    ("Pull-to-Refresh", "Standard platform pull-to-refresh on dashboard feed"),
    ("Carousel Swipe", "Horizontal swipe animation for promo card carousels"),
    ("Button Press Feedback", "Haptic feedback + subtle scale animation on tap"),
    ("Notification Badge", "Red badge pulse animation on bell icon for unread offers"),
    ("Progress Circle", "Animated circular progress meter for tier advancement (gold/green fill)"),
    ("Slot Reel Spin", "Spinning reel animation in Play Agua games"),
    ("Win Celebration", "Particle/confetti effects and coin shower on slot wins"),
    ("Fortune Wheel Spin", "Rotating wheel with deceleration easing in Play Agua"),
    ("Card Expand", "Expand/collapse animation for promo and event detail cards"),
    ("Tab Switch", "Bottom navigation tab highlight transition"),
];

/// Animation performance targets
pub const ANIMATION_TARGET_FPS: u32 = 120; // Optimized for 120Hz ProMotion displays
pub const ANIMATION_MAX_DURATION_MS: u32 = 300; // Keep under 300ms per best practices

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

/// Video content types in the app
pub const VIDEO_CONTENT: &[(&str, &str)] = &[
    ("Event Promos", "Short promotional clips for concerts, shows, and special events"),
    ("How-To Guides", "Setup and tutorial videos for app features (mentioned in Play Agua)"),
    ("Property Tours", "Virtual tours of casino and resort facilities"),
    ("Video Player", "In-app video player (bug fixed in v4.0.12, April 2023)"),
];

// ---------------------------------------------------------------------------
// Graphics / Icons
// ---------------------------------------------------------------------------

/// UI icon set used in the app
pub const UI_ICONS: &[(&str, &str)] = &[
    ("Home", "House icon — bottom navigation tab"),
    ("Rewards/Trophy", "Trophy icon — rewards section tab"),
    ("Offers/Tag", "Price tag icon — offers section tab"),
    ("Events/Calendar", "Calendar icon — events section tab"),
    ("Profile/Person", "Person silhouette — profile section tab"),
    ("Notifications Bell", "Bell icon with red badge counter — top bar"),
    ("Search", "Magnifying glass — top bar search"),
    ("Settings Gear", "Gear icon — settings access"),
    ("QR Scanner", "QR code frame icon — in-casino redemption"),
    ("Location Pin", "Map pin — property selector"),
    ("Checkmark", "Green checkmark — earned/completed rewards"),
    ("Lock", "Lock icon — locked/unavailable benefits"),
    ("Key/PIN", "Key icon — secure PIN input field"),
    ("Arrow/Chevron", "Navigation arrows for list items and back button"),
    ("Star", "Star rating icon for reviews and tier display"),
    ("Chip/Coin", "Casino chip icon for credits/points display"),
];

/// Icon sizing specifications
pub const ICON_SIZE_IOS_TAB_BAR_PT: u32 = 25;
pub const ICON_SIZE_IOS_NAV_BAR_PT: u32 = 22;
pub const ICON_SIZE_ANDROID_BASELINE_DP: u32 = 24;
pub const ICON_SIZE_ANDROID_TOUCH_DP: u32 = 48;

// ---------------------------------------------------------------------------
// Fonts / Typography
// ---------------------------------------------------------------------------

/// Font families used in the Agua Caliente app
pub const FONTS: &[(&str, &str, &str)] = &[
    // (font_name, usage, weights)
    ("Montserrat (or similar geometric sans-serif)", "Primary — Headings, Logo, CTAs", "Bold (700), ExtraBold (800), Black (900)"),
    ("Open Sans / Roboto", "Secondary — Body text, UI labels, descriptions", "Regular (400), Medium (500)"),
    ("SF Pro (iOS system)", "iOS platform — System UI, navigation, alerts", "Regular, Medium, Semibold, Bold"),
    ("Roboto (Android system)", "Android platform — System UI, Material components", "Regular (400), Medium (500), Bold (700)"),
    ("Playfair Display (serif accent)", "Tertiary — Luxury touches in invitations, menus", "Regular (400), Bold (700)"),
];

/// Typography scale (in points for iOS / sp for Android)
pub const TYPOGRAPHY_SCALE: &[(&str, u32, &str)] = &[
    // (role, size_pt_or_sp, weight)
    ("Display / Hero", 48, "ExtraBold"),
    ("Headline 1", 34, "Bold"),
    ("Headline 2", 28, "Bold"),
    ("Title", 24, "Bold"),
    ("Subtitle", 20, "Medium"),
    ("Body Large", 17, "Regular"),
    ("Body", 16, "Regular"),
    ("Body Small", 14, "Regular"),
    ("Caption", 12, "Regular"),
    ("Overline / Label", 10, "Medium, Uppercase"),
];

/// Typography styling details
pub const LINE_HEIGHT_MULTIPLIER: f32 = 1.5;
pub const LETTER_SPACING_LABELS_PX: f32 = 0.5;
pub const CTA_TEXT_STYLE: &str = "ALL-CAPS for calls-to-action buttons";
