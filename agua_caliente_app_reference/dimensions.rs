// =============================================================================
// Agua Caliente App — Dimensions & Screen Specifications
// =============================================================================
//
// App dimensions, supported screen sizes, and UI element sizing guidelines
// extracted from app store listings and platform design guidelines.
// Date crawled: 2026-02-16

// ---------------------------------------------------------------------------
// iOS Target Dimensions (points)
// ---------------------------------------------------------------------------
// The Agua Caliente app requires iOS 15.5+ and is optimized for iPhone & iPad.
// The baseline design canvas starts at 375×812 pt (iPhone 14/15/16 standard).
// Safe area insets: 44-50pt top (status bar + notch), 34pt bottom (home indicator).

/// iOS screen dimensions in points (width × height, portrait orientation)
pub const IOS_SCREEN_DIMENSIONS: &[(&str, u32, u32)] = &[
    ("iPhone 16 Pro Max", 440, 956),
    ("iPhone 16 Plus", 430, 932),
    ("iPhone 16 / 15 / 14", 393, 852),
    ("iPhone SE (2025)", 375, 667),
    ("iPad Pro 12.9-inch", 1024, 1366),
    ("iPad Pro 11-inch", 834, 1194),
    ("iPad Air / iPad 10th gen", 820, 1180),
    ("iPad Mini 6th gen", 744, 1133),
];

/// iOS safe area insets in points
pub const IOS_SAFE_AREA_TOP_PT: u32 = 47;    // Status bar + Dynamic Island / notch
pub const IOS_SAFE_AREA_BOTTOM_PT: u32 = 34;  // Home indicator
pub const IOS_SAFE_AREA_LEFT_PT: u32 = 0;
pub const IOS_SAFE_AREA_RIGHT_PT: u32 = 0;

// ---------------------------------------------------------------------------
// Android Target Dimensions (dp — density-independent pixels)
// ---------------------------------------------------------------------------
// The app targets Android 5.0+ (Play Agua) and modern Android (main app).
// Baseline design canvas: 360×640 dp (smallest phone viewport).
// Status bar: 24dp top; navigation bar: 48dp bottom (gesture navigation).

/// Android screen dimensions in dp (width × height, portrait orientation)
pub const ANDROID_SCREEN_DIMENSIONS: &[(&str, u32, u32)] = &[
    ("Small Phone (budget)", 360, 640),
    ("Standard Phone (Pixel 9)", 393, 851),
    ("Large Phone (Galaxy S25 Ultra)", 412, 915),
    ("Foldable (unfolded)", 880, 1960),
    ("Tablet 10-inch", 800, 1280),
];

/// Android system bar heights in dp
pub const ANDROID_STATUS_BAR_HEIGHT_DP: u32 = 24;
pub const ANDROID_NAV_BAR_HEIGHT_DP: u32 = 48;

// ---------------------------------------------------------------------------
// App Icon Dimensions
// ---------------------------------------------------------------------------

/// iOS App Icon (required for App Store submission)
pub const IOS_APP_ICON_PX: u32 = 1024; // 1024×1024 px (single asset, auto-scaled)

/// Android Adaptive Icon dimensions
pub const ANDROID_ICON_FOREGROUND_DP: u32 = 108; // 108×108 dp foreground layer
pub const ANDROID_ICON_STORE_PX: u32 = 512;      // 512×512 px for Play Store listing

// ---------------------------------------------------------------------------
// Screenshot Dimensions (App Store / Play Store Listings)
// ---------------------------------------------------------------------------

/// iOS App Store screenshot specifications (pixels)
pub const IOS_SCREENSHOT_SPECS: &[(&str, u32, u32)] = &[
    // iPhone screenshots (portrait)
    ("iPhone 6.9\" Display (Pro Max)", 1320, 2868),
    ("iPhone 6.7\" Display (Plus)", 1290, 2796),
    ("iPhone 6.5\" Display", 1284, 2778),
    ("iPhone 6.1\" Display (Standard)", 1179, 2556),
    ("iPhone 5.5\" Display (Legacy)", 1242, 2208),
    // iPad screenshots (portrait)
    ("iPad Pro 12.9\" (6th gen)", 2048, 2732),
    ("iPad Pro 11\"", 1668, 2388),
];

/// Google Play Store screenshot specifications (pixels)
pub const ANDROID_SCREENSHOT_SPECS: &[(&str, u32, u32)] = &[
    // Minimum and maximum dimensions
    ("Minimum", 320, 320),
    ("Maximum", 3840, 3840),
    // Common phone screenshot sizes (portrait)
    ("Phone 1080p", 1080, 1920),
    ("Phone 1440p", 1440, 2560),
    ("Phone 1080×2400 (modern)", 1080, 2400),
    // Tablet
    ("Tablet 7-inch", 1200, 1920),
    ("Tablet 10-inch", 1600, 2560),
];

/// Number of screenshot slots observed in listings
pub const IOS_SCREENSHOT_SLOTS_MAIN_APP: u32 = 3;
pub const IOS_SCREENSHOT_SLOTS_PLAY_AGUA: u32 = 4;

// ---------------------------------------------------------------------------
// UI Element Dimensions (Inferred from Platform Guidelines)
// ---------------------------------------------------------------------------

/// iOS UI element sizing in points
pub mod ios_ui {
    /// Minimum tappable area (Apple HIG)
    pub const MIN_TAP_TARGET_PT: u32 = 44;

    /// Navigation bar height
    pub const NAV_BAR_HEIGHT_PT: u32 = 44;

    /// Tab bar height
    pub const TAB_BAR_HEIGHT_PT: u32 = 49;

    /// Tab bar icon size
    pub const TAB_BAR_ICON_PT: u32 = 25;

    /// Standard button dimensions (estimated from app)
    pub const LOGIN_BUTTON_WIDTH_PT: u32 = 280;
    pub const LOGIN_BUTTON_HEIGHT_PT: u32 = 50;

    /// Card/promo banner height (estimated)
    pub const PROMO_BANNER_HEIGHT_PT: u32 = 300;

    /// Corner radius for cards/buttons
    pub const CARD_CORNER_RADIUS_PT: u32 = 12;
    pub const BUTTON_CORNER_RADIUS_PT: u32 = 10;

    /// Standard margins and spacing
    pub const MARGIN_HORIZONTAL_PT: u32 = 16;
    pub const ELEMENT_SPACING_PT: u32 = 8;

    /// Typography sizes (points)
    pub const FONT_SIZE_HEADLINE_PT: u32 = 34;
    pub const FONT_SIZE_TITLE_PT: u32 = 28;
    pub const FONT_SIZE_BODY_PT: u32 = 17;
    pub const FONT_SIZE_CAPTION_PT: u32 = 12;
}

/// Android UI element sizing in dp
pub mod android_ui {
    /// Minimum tappable area (Material Design)
    pub const MIN_TAP_TARGET_DP: u32 = 48;

    /// App bar height
    pub const APP_BAR_HEIGHT_DP: u32 = 56;

    /// Bottom navigation height
    pub const BOTTOM_NAV_HEIGHT_DP: u32 = 56;

    /// Icon baseline size
    pub const ICON_SIZE_DP: u32 = 24;

    /// FAB (Floating Action Button) diameter
    pub const FAB_DIAMETER_DP: u32 = 56;

    /// Standard button dimensions (estimated from app)
    pub const BUTTON_WIDTH_DP: u32 = 200;
    pub const BUTTON_HEIGHT_DP: u32 = 48;

    /// Corner radius for Material Design 3 components
    pub const CARD_CORNER_RADIUS_DP: u32 = 28;
    pub const BUTTON_CORNER_RADIUS_DP: u32 = 20;

    /// Standard margins and spacing (8dp grid)
    pub const MARGIN_HORIZONTAL_DP: u32 = 16;
    pub const ELEMENT_SPACING_DP: u32 = 8;
    pub const CARD_SPACING_DP: u32 = 16;

    /// Typography sizes (sp — scale-independent pixels)
    pub const FONT_SIZE_HEADLINE_SP: u32 = 24;
    pub const FONT_SIZE_TITLE_SP: u32 = 20;
    pub const FONT_SIZE_BODY_SP: u32 = 14;
    pub const FONT_SIZE_CAPTION_SP: u32 = 12;
}

// ---------------------------------------------------------------------------
// App File Sizes
// ---------------------------------------------------------------------------

/// App download/install sizes
pub const MAIN_APP_SIZE_IOS_MB: f64 = 253.0;
pub const PLAY_AGUA_SIZE_IOS_MB: f64 = 98.5;
// Android sizes vary by device; not listed in Play Store text content
