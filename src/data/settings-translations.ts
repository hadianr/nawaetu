/**
 * Settings Page Translations
 * Localized text for settings page in Indonesian and English
 */

export const SETTINGS_TRANSLATIONS = {
  id: {
    // Header
    title: "Pengaturan",
    
    // Stats Section
    statsLabel: "Statistik Ibadah",
    statsComingSoon: "Segera Hadir",
    statsDescription: "Matangkan niat, pantau hasil nanti ✨",
    
    // Location Section
    locationLabel: "Lokasi",
    locationUpdating: "Memperbarui...",
    locationDetecting: "Mendeteksi...",
    
    // Calculation Method
    methodLabel: "Metode",
    methodPlaceholder: "Pilih metode",
    
    // Prayer Notifications
    notificationTitle: "Notifikasi Adzan",
    notificationButton: "Aktifkan Notifikasi Adzan",
    notificationDenied: "Izin notifikasi ditolak. Mohon aktifkan di pengaturan browser Anda.",
    
    // Theme
    themeTitle: "Tampilan Aplikasi",
    
    // Audio Settings
    audioTitle: "Pengaturan Audio",
    muadzinLabel: "Suara Adzan",
    
    // Language Settings
    languageTitle: "Bahasa",
    languageDescription: "Bahasa aplikasi akan berubah sesuai pilihan.",
    
    // Support Card
    supportTitle: "Dukung Nawaetu",
    supportPremiumText: "Terima kasih telah menjadi Muhsinin! Hasil infaq digunakan untuk server & pengembangan.",
    supportText: "Bantu kami menjaga aplikasi tetap gratis dan bebas iklan selamanya.",
    infaqButtonPremium: "Infaq Lagi",
    infaqButton: "Infaq",
    
    // About Section
    aboutAppName: "Nawaetu",
    aboutTagline: "Luruskan Niat, Sempurnakan Ibadah",
    aboutDescription: "Teman ibadah digital yang menjaga setiap langkahmu tetap sesuai tuntunan Al-Qur'an & Sunnah.",
    aboutHashtag: "#LuruskanNiat",
    aboutVersion: "v1.0.0 (Production)",
  },
  en: {
    // Header
    title: "Settings",
    
    // Stats Section
    statsLabel: "Worship Statistics",
    statsComingSoon: "Coming Soon",
    statsDescription: "Perfect your intention, monitor results later ✨",
    
    // Location Section
    locationLabel: "Location",
    locationUpdating: "Updating...",
    locationDetecting: "Detecting...",
    
    // Calculation Method
    methodLabel: "Method",
    methodPlaceholder: "Select method",
    
    // Prayer Notifications
    notificationTitle: "Prayer Notifications",
    notificationButton: "Enable Prayer Notifications",
    notificationDenied: "Notification permission denied. Please enable it in your browser settings.",
    
    // Theme
    themeTitle: "App Appearance",
    
    // Audio Settings
    audioTitle: "Audio Settings",
    muadzinLabel: "Adhan Voice",
    
    // Language Settings
    languageTitle: "Language",
    languageDescription: "The app language will change according to your selection.",
    
    // Support Card
    supportTitle: "Support Nawaetu",
    supportPremiumText: "Thank you for being a Muhsinin! Your donations support server and development.",
    supportText: "Help us keep the app free and ad-free forever.",
    infaqButtonPremium: "Donate Again",
    infaqButton: "Donate",
    
    // About Section
    aboutAppName: "Nawaetu",
    aboutTagline: "Perfect Your Intention, Perfect Your Worship",
    aboutDescription: "Your digital worship companion keeping every step aligned with the Quran & Sunnah.",
    aboutHashtag: "#PerfectYourIntention",
    aboutVersion: "v1.0.0 (Production)",
  }
};

// Helper function to get translation
export function getSettingsTranslation(locale: string, key: keyof typeof SETTINGS_TRANSLATIONS.id): string {
  const translations = SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS] || SETTINGS_TRANSLATIONS.id;
  return translations[key] as string;
}
