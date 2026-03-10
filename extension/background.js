/**
 * Nawaetu Extension – Background Service Worker
 * Handles persistent adzan alarm notifications, even when popup is closed.
 */

const ALARM_PREFIX = 'nawaetu_prayer_';

// Enable side panel behavior on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'SCHEDULE_ALARMS') {
        scheduleAlarms(msg.timings);
        sendResponse({ ok: true });
    }
    return true;
});

function scheduleAlarms(timings) {
    const sholat = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // Clear previous alarms
    sholat.forEach(name => chrome.alarms.clear(ALARM_PREFIX + name));

    sholat.forEach(name => {
        const raw = timings[name];
        if (!raw) return;
        const [h, m] = raw.split(':').map(Number);
        // Reminder alarm: 10 min before
        const reminderMs = new Date(`${today}T${pad(h)}:${pad(m)}:00`).getTime() - 10 * 60 * 1000;
        // Adzan alarm: on time
        const adzanMs = new Date(`${today}T${pad(h)}:${pad(m)}:00`).getTime();

        if (reminderMs > Date.now()) {
            chrome.alarms.create(`${ALARM_PREFIX}reminder_${name}`, { when: reminderMs });
        }
        if (adzanMs > Date.now()) {
            chrome.alarms.create(`${ALARM_PREFIX}adzan_${name}`, { when: adzanMs });
        }
    });
}

// Handle alarm fires
chrome.alarms.onAlarm.addListener(alarm => {
    if (!alarm.name.startsWith(ALARM_PREFIX)) return;

    const isAdzan = alarm.name.includes('_adzan_');
    const name = alarm.name.replace(ALARM_PREFIX, '').replace('reminder_', '').replace('adzan_', '');

    const labels = {
        Fajr: 'Subuh', Dhuhr: 'Dzuhur', Asr: 'Ashar', Maghrib: 'Maghrib', Isha: "Isya'"
    };
    const label = labels[name] || name;

    if (isAdzan) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-128.png',
            title: `🕌 Waktu Adzan – ${label}`,
            message: `Allahu Akbar! Waktu sholat ${label} telah tiba.`,
            priority: 2
        });
    } else {
        // Reminder
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-128.png',
            title: `⏰ Bersiap Sholat ${label}`,
            message: `Adzan ${label} dalam 10 menit. Bersiap dan ambil wudu. 🕌`,
            priority: 1
        });
    }
});

function pad(n) { return String(n).padStart(2, '0'); }
