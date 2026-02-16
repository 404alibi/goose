// =============================================================================
// Agua Caliente App — Brand Identity & Design System
// =============================================================================
//
// Brand colors, design tokens, and visual identity extracted from
// Brandfetch, app store listings, and official website analysis.
// Date crawled: 2026-02-16

// ---------------------------------------------------------------------------
// Brand Identity
// ---------------------------------------------------------------------------

pub const BRAND_NAME: &str = "Agua Caliente Casinos";
pub const TAGLINE: &str = "Experience Extraordinary";
pub const OWNER: &str = "Agua Caliente Band of Cahuilla Indians";
pub const WEBSITE: &str = "https://www.aguacalientecasinos.com";
pub const BRAND_UNIFIED_YEAR: u32 = 2019; // Unified brand identity across all properties

/// Casino property locations
pub const PROPERTIES: &[(&str, &str)] = &[
    ("Agua Caliente Casino Palm Springs", "Palm Springs, CA"),
    ("Agua Caliente Casino Resort Spa Rancho Mirage", "Rancho Mirage, CA"),
    ("Agua Caliente Casino Cathedral City", "Cathedral City, CA"),
];

// ---------------------------------------------------------------------------
// Color Palette
// ---------------------------------------------------------------------------

/// Primary brand colors (core to logo and key UI elements)
pub mod colors {
    /// Gold/Yellow — evokes wealth, desert sun, opulence
    /// Used for: accents, highlights, promotional buttons, reward badges, CTAs
    pub const GOLD_PRIMARY: &str = "#CEA719";
    pub const GOLD_PRIMARY_RGB: (u8, u8, u8) = (206, 167, 25);
    pub const GOLD_PRIMARY_CMYK: (u8, u8, u8, u8) = (0, 19, 88, 19);

    /// Teal/Blue-Green — signature "Agua" water theme
    /// Used for: logo elements, headers, app navigation bars
    pub const TEAL_PRIMARY: &str = "#01818C";
    pub const TEAL_PRIMARY_RGB: (u8, u8, u8) = (1, 129, 140);
    pub const TEAL_PRIMARY_HSL: (u16, u8, u8) = (185, 99, 28); // hue°, sat%, light%
    pub const TEAL_PRIMARY_CMYK: (u8, u8, u8, u8) = (99, 8, 0, 45);

    /// Dark Brown/Gray — depth and sophistication
    /// Used for: subheadings, borders, secondary backgrounds
    pub const DARK_BROWN: &str = "#514A4A";
    pub const DARK_BROWN_RGB: (u8, u8, u8) = (81, 74, 74);

    /// Deep Blue/Navy — luxury and stability
    /// Used for: footers, secondary text
    pub const DEEP_BLUE: &str = "#003366";
    pub const DEEP_BLUE_RGB: (u8, u8, u8) = (0, 51, 102);

    /// Accent Red — energy, promotions, alerts
    /// Used for: buttons, event banners, tribal motifs (limited to 10-20% of design)
    pub const ACCENT_RED: &str = "#C8102E";
    pub const ACCENT_RED_RGB: (u8, u8, u8) = (200, 16, 46);
    pub const ACCENT_RED_PANTONE: &str = "185 C";

    /// Login button gold (slightly warmer variant)
    pub const BUTTON_GOLD: &str = "#D4AF37";
    pub const BUTTON_GOLD_RGB: (u8, u8, u8) = (212, 175, 55);

    // --- Neutral Colors ---

    /// Dark text color
    pub const TEXT_DARK: &str = "#333333";
    pub const TEXT_DARK_RGB: (u8, u8, u8) = (51, 51, 51);

    /// White — backgrounds, text on dark surfaces
    pub const WHITE: &str = "#FFFFFF";

    /// Light background — desert-inspired off-white
    pub const BG_LIGHT: &str = "#F5F5F5";
    pub const BG_LIGHT_RGB: (u8, u8, u8) = (245, 245, 245);

    // --- Play Agua Specific Colors ---

    /// Near-black — immersive gaming backgrounds
    pub const GAMING_BG_DARK: &str = "#1A1A1A";
    pub const GAMING_BG_DARK_RGB: (u8, u8, u8) = (26, 26, 26);

    /// Alert red for gaming notifications
    pub const GAMING_ALERT_RED: &str = "#FF0000";

    // --- Semantic Colors ---

    /// Success / earned rewards
    pub const SUCCESS_GREEN: &str = "#28A745";

    /// Warning / pending
    pub const WARNING_AMBER: &str = "#FFC107";

    /// Error / locked
    pub const ERROR_RED: &str = "#DC3545";

    /// Info / links
    pub const INFO_BLUE: &str = "#007BFF";
}

// ---------------------------------------------------------------------------
// Design Tokens
// ---------------------------------------------------------------------------

/// Elevation / shadow levels
pub const SHADOW_ELEVATION_CARD_PT: u32 = 8;
pub const SHADOW_ELEVATION_BUTTON_PT: u32 = 4;
pub const SHADOW_ELEVATION_MODAL_PT: u32 = 16;

/// Border radius tokens
pub const RADIUS_SMALL_PT: u32 = 4;
pub const RADIUS_MEDIUM_PT: u32 = 8;
pub const RADIUS_LARGE_PT: u32 = 12;
pub const RADIUS_PILL_PT: u32 = 999; // Fully rounded / pill shape

/// Spacing scale (8pt grid system)
pub const SPACING_XXS: u32 = 2;
pub const SPACING_XS: u32 = 4;
pub const SPACING_SM: u32 = 8;
pub const SPACING_MD: u32 = 16;
pub const SPACING_LG: u32 = 24;
pub const SPACING_XL: u32 = 32;
pub const SPACING_XXL: u32 = 48;

/// Contrast ratio targets (WCAG compliance)
pub const CONTRAST_RATIO_NORMAL_TEXT: f32 = 4.5;  // AA standard
pub const CONTRAST_RATIO_LARGE_TEXT: f32 = 3.0;   // AA standard for large text
pub const CONTRAST_RATIO_TARGET: f32 = 7.0;       // AAA standard (aspirational)

// ---------------------------------------------------------------------------
// Logo Specifications
// ---------------------------------------------------------------------------

/// Logo description and usage rules
pub const LOGO_DESCRIPTION: &str = "Stylized 'Agua Caliente' in clean modern sans-serif, \
    often accompanied by 'Casinos' in smaller scale below. Some variations include a \
    stylized water droplet or hot spring motif referencing the tribe's cultural heritage.";

pub const LOGO_FORMATS: &[&str] = &["SVG", "PNG", "Vector (AI/EPS)"];

pub const LOGO_VARIANTS: &[&str] = &[
    "Full-color (gold on dark)",
    "Black (monochrome)",
    "White (reversed, for dark backgrounds)",
    "Horizontal layout",
    "Stacked layout",
];

/// Logo clear space rule
pub const LOGO_CLEAR_SPACE: &str = "Maintain at least the height of the 'A' in 'Agua' around the logo";
pub const LOGO_MIN_SIZE_PRINT_INCHES: f32 = 1.0;
pub const LOGO_MIN_SIZE_DIGITAL_PX: u32 = 100;

// ---------------------------------------------------------------------------
// UI Screen Descriptions (Post-2025 Redesign, v5.0+)
// ---------------------------------------------------------------------------

/// App screen inventory with layout descriptions
pub const APP_SCREENS: &[(&str, &str)] = &[
    ("Splash Screen",
     "Full-screen logo (gold 'A' on dark bg), desert sunset imagery, centered welcome text, \
      progress spinner, 2-3 second load time with subtle animation"),

    ("Login Screen",
     "Vertical stack on light bg (beige/white), casino branding at top, \
      ACE Club Number + 4-Digit PIN text fields, large gold Login button (rounded corners), \
      'Forgot PIN?' link, 'New Member? Sign Up' secondary button"),

    ("Home Dashboard",
     "Scrollable card feed, top app bar (profile icon, search, notification bell with red badge), \
      personalized welcome card with tier status, horizontal carousel of quick-action buttons \
      (View Rewards, Active Offers, Upcoming Events, Play Agua Credits), \
      promo cards with images and 'Claim Now' CTAs, bottom tab navigation (5 tabs)"),

    ("Rewards / ACE Club",
     "Tabbed view (Points, Tier Benefits, History), circular progress meter for tier advancement, \
      bullet-point perks list with checkmark icons, 'Redeem Points' gold button, \
      QR code scanner integration"),

    ("Promotions & Events",
     "Grid/list of event cards, filterable by location/date, image thumbnails (16:9), \
      event name + date/time + RSVP button, search/filter bar with dropdowns, \
      'More Ways to Win' gamified section with spinning wheel"),

    ("Profile / Settings",
     "Vertical form with profile header (photo upload, name, member since), \
      toggle switches (notifications, Play Agua link), \
      'Update Info' and 'Contact Support' buttons, privacy policy link"),

    ("Property Selector",
     "Segmented control or dropdown to switch between Palm Springs, Rancho Mirage, \
      Cathedral City locations"),

    ("Hotel Booking",
     "Date picker, room selection cards with photos, booking confirmation flow"),

    ("Dining Reservation",
     "Restaurant list with photos, time slot picker, party size selector"),

    ("Push Notification Center",
     "List of received notifications with timestamps, read/unread states, \
      deep links to relevant offers"),
];

/// Bottom navigation tab bar structure
pub const BOTTOM_NAV_TABS: &[(&str, &str)] = &[
    ("Home", "House icon"),
    ("Rewards", "Trophy icon"),
    ("Offers", "Tag icon"),
    ("Events", "Calendar icon"),
    ("Profile", "Person icon"),
];

// ---------------------------------------------------------------------------
// Design Philosophy
// ---------------------------------------------------------------------------

pub const DESIGN_PHILOSOPHY: &str = "\
The Agua Caliente app follows a luxury casino aesthetic with modern mobile-first design:\n\
- Bold warm colors (gold, teal) for opulence and trust\n\
- High contrast for readability in low-light casino environments\n\
- Card-based layouts for quick scanning and engagement\n\
- Minimal clutter — 'the perfect amount of information' (user review)\n\
- Responsive and adaptive for all device sizes\n\
- Dark mode support\n\
- Haptic feedback for premium tactile experience\n\
- WCAG-compliant contrast ratios for accessibility\n\
- 120Hz animation support for smooth interactions\n\
- Desert-inspired warmth avoiding cool/neon tones\n\
- Unified brand identity across physical and digital touchpoints";
