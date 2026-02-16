// =============================================================================
// Agua Caliente App — Core App Information
// =============================================================================
//
// Extracted from Google Play Store and Apple App Store listings.
// Date crawled: 2026-02-16

/// Primary Agua Caliente Casino Rewards App
pub mod main_app {
    /// App identity and metadata
    pub const APP_NAME: &str = "AGUA CALIENTE";
    pub const PACKAGE_ID_ANDROID: &str = "com.aguacaliente.AguaCaliente";
    pub const APP_ID_IOS: u64 = 354078926;
    pub const CURRENT_VERSION: &str = "7.1.0";
    pub const VERSION_DATE: &str = "2025-11-17";
    pub const SIZE_IOS_MB: f64 = 253.0;
    pub const PRICE: &str = "Free";
    pub const CATEGORY: &str = "Entertainment";
    pub const AGE_RATING: &str = "18+";
    pub const LANGUAGE: &str = "English";

    /// Developer information
    pub const DEVELOPER: &str = "Agua Caliente Band of Cahuilla Indians";
    pub const DEVELOPER_ADDRESS: &str = "32250 Bob Hope Dr, Rancho Mirage, CA 92270-2704, United States";
    pub const SUPPORT_EMAIL: &str = "webservices@aguacaliente.net";
    pub const SUPPORT_PHONE: &str = "+1 888-999-1995";
    pub const DEVELOPER_PHONE: &str = "+1 760-866-6402";
    pub const COPYRIGHT: &str = "© 2025 Agua Caliente Casinos®";

    /// Ratings
    pub const RATING_GOOGLE_PLAY: f32 = 4.5;
    pub const RATING_APPLE_STORE: f32 = 4.8;
    pub const TOTAL_RATINGS_APPLE: u32 = 860;
    pub const TOTAL_RATINGS_GOOGLE: u32 = 503;
    pub const DOWNLOADS_GOOGLE: &str = "10K+";

    /// Platform compatibility
    pub const IOS_MIN_VERSION: &str = "15.5";
    pub const IPADOS_MIN_VERSION: &str = "15.5";

    /// App Store URLs
    pub const GOOGLE_PLAY_URL: &str =
        "https://play.google.com/store/apps/details?id=com.aguacaliente.AguaCaliente";
    pub const APPLE_STORE_URL: &str =
        "https://apps.apple.com/us/app/agua-caliente/id354078926";

    /// Key features
    pub const FEATURES: &[&str] = &[
        "Participate in exclusive 'mobile-only' offers and promotions",
        "Receive exclusive messages and push notifications",
        "View Free Play, offers and Point Balances",
        "View Entries and Check into on-site drawings",
        "Book a hotel room or dinner reservation",
        "ACE Club loyalty program integration",
        "Property-specific toggles (Palm Springs, Rancho Mirage, Cathedral City)",
        "QR code scanner for in-casino redemption",
        "Dark mode support",
        "Integration with Play Agua companion app",
    ];

    /// Description
    pub const DESCRIPTION: &str = "The Agua Caliente Casino app offers instant access to \
        the ACE Club, your ACE Club benefits and rewards, along with the latest information \
        on promotions and events happening at the property.";

    /// Version history (most recent entries)
    pub const VERSION_HISTORY: &[(&str, &str, &str)] = &[
        ("7.1.0", "2025-11-17", "Minor bug fixes and feature enhancements"),
        ("7.0.0", "2025-11-03", "Minor bug fixes and feature enhancements"),
        ("5.0.1", "2025-05-27", "Minor enhancements and bug fixes to improve experience"),
        ("5.0.0", "2024-08-19", "Completely re-designed app with easy access to all Agua Caliente Casinos features"),
        ("4.0.12", "2023-04-17", "Fixed issues with video player"),
        ("4.0.11", "2022-11-02", "Bug Fixes"),
        ("4.0.10", "2021-12-20", "Bug fixes, Updated Fuel location"),
        ("4.0.9", "2021-12-13", "Added new section for Agua Caliente Fuel, Bug Fixes"),
        ("4.0.8", "2021-12-04", "Added Agua Caliente Fuel to Properties"),
        ("4.0.7", "2021-07-23", "Added ability to order food from the app"),
        ("4.0.6", "2020-10-15", "Added integration with the New Agua Caliente Play Agua App"),
        ("4.0.5", "2020-09-03", "Added Agua Caliente Cathedral City property; Added New Careers Section"),
        ("4.0.4", "2020-03-09", "Agua Connect, Player Portal, Casino Information; Stability improvements"),
        ("4.0", "2019-09-25", "Agua Connect, Player Portal, Casino Information"),
        ("2.0", "2019-04-16", "Brand Update, Performance Enhancements, Minor Bug Fixes"),
    ];

    /// Data privacy
    pub const DATA_LINKED_TO_USER: &[&str] = &["Name (Contact Info)"];
    pub const DATA_NOT_LINKED: &[&str] = &[
        "Coarse Location",
        "Precise Location",
        "User ID",
        "Device ID",
        "Product Interaction",
        "Crash Data",
        "Performance Data",
    ];
    pub const DATA_ENCRYPTED_IN_TRANSIT: bool = true;
}

/// Play Agua — Companion Gaming App
pub mod play_agua {
    pub const APP_NAME: &str = "Play Agua";
    pub const PACKAGE_ID_ANDROID: &str = "com.gan.agua.slots";
    pub const APP_ID_IOS: u64 = 1504113741;
    pub const CURRENT_VERSION: &str = "1.3.0";
    pub const VERSION_DATE: &str = "2025-02-18";
    pub const SIZE_IOS_MB: f64 = 98.5;
    pub const PRICE: &str = "Free (with In-App Purchases)";
    pub const CATEGORY: &str = "Casino";
    pub const AGE_RATING: &str = "18+";
    pub const LANGUAGE: &str = "English";
    pub const CONTACT_EMAIL: &str = "help@playagua.com";
    pub const COPYRIGHT: &str = "© 2023 Agua Caliente Casinos®";

    pub const RATING_APPLE_STORE: f32 = 4.6;
    pub const TOTAL_RATINGS_APPLE: &str = "~1,500 (1.5K)";
    pub const RATING_GOOGLE_PLAY: f32 = 4.5;

    pub const IOS_MIN_VERSION: &str = "14.0";
    pub const IPADOS_MIN_VERSION: &str = "14.0";
    pub const MACOS_MIN_VERSION: &str = "11.0 (Apple M1 chip or later)";
    pub const VISIONOS_MIN_VERSION: &str = "1.0";

    pub const GOOGLE_PLAY_URL: &str =
        "https://play.google.com/store/apps/details?id=com.gan.agua.slots";
    pub const APPLE_STORE_URL: &str =
        "https://apps.apple.com/us/app/play-agua/id1504113741";

    pub const FEATURES: &[&str] = &[
        "5,000 Welcome Tokens for new users",
        "Daily Login Bonus",
        "Fortune Wheel — win extra chips every 4 hours",
        "50+ authentic casino slots and table games",
        "Exclusive offers and promotions",
        "New slot games added from around the world",
        "Slot titles: Roaming Reels, King of Bling, China Shores, Savannah Storm, Treasure Voyage",
        "Table games: Roulette, Blackjack, Video Poker",
        "Daily, Weekly and Monthly Challenges (v1.3.0)",
        "Progress tracking and milestone prizes",
    ];

    pub const IN_APP_PURCHASES: &[(&str, &str)] = &[
        ("7,500 Credits", "$4.99"),
        ("19,000 Credits", "$9.99"),
        ("40,000 Credits", "$19.99"),
        ("60,000 Credits", "$29.99"),
        ("125,000 Credits", "$49.99"),
        ("280,000 Credits", "$99.99"),
    ];

    pub const VERSION_HISTORY: &[(&str, &str, &str)] = &[
        ("1.3.0", "2025-02-18", "Challenges feature (Daily, Weekly, Monthly), progress tracking, prizes"),
        ("1.2.10", "2024-12-19", "Bug fixes and performance improvements"),
        ("1.2.8", "2024-06-19", "Bug fixes and performance improvements"),
        ("1.2.4", "2023-10-24", "Bug fixes and performance improvements"),
        ("1.2.1", "2023-03-21", "Performance improvements and bug fixes"),
        ("1.1.0", "2022-05-11", "Brand new experience update"),
        ("1.0", "2020-09-28", "Initial release"),
    ];
}
