/**
 * Nawaetu Extension – Popup Script
 * Features: prayer times, countdown, Ramadan mode, bilingual, verse, adzan reminders
 */

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const SHOLAT_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const CACHE_KEY_PRAYERS = 'nawaetu_ext_prayers_v4';
const CACHE_KEY_VERSE = 'nawaetu_ext_verse_v2';
const CACHE_KEY_LANG = 'nawaetu_ext_lang';
const CACHE_KEY_OFFSET = 'nawaetu_ext_hijri_offset';
const CACHE_KEY_NOTIF = 'nawaetu_ext_notif';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const REMINDER_MINUTES = 15; // Show "Bersiap" reminder this many minutes before prayer

// ── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
    id: {
        nextPrayer: 'Sholat Berikutnya', towardsPrayer: 'menuju sholat',
        verseLabel: '📖 Ayat Hari Ini', openFull: 'Buka Lengkap',
        detectingLoc: 'Mendeteksi lokasi…', allowLocation: 'Izinkan Lokasi',
        locationDenied: 'Jakarta (default)',
        prayerNames: {
            Fajr: 'Subuh', Sunrise: 'Terbit', Dhuhr: 'Dzuhur',
            Asr: 'Ashar', Maghrib: 'Maghrib', Isha: "Isya'"
        },
        ramadanDay: 'Ramadan Hari ke-', ramadanLabel: 'Ramadan',
        imsak: 'Imsak', sahur: 'Sahur berakhir', buka: 'Buka Puasa',
        bersiap: '⚠️ Bersiap sholat!', adzanNear: 'Waktu adzan dalam',
        hijriOffset: 'Koreksi Tanggal Hijriyah',
        notifOn: '🔔', notifOff: '🔕',
        notifTooltipOn: 'Notifikasi adzan aktif', notifTooltipOff: 'Aktifkan notifikasi adzan'
    },
    en: {
        nextPrayer: 'Next Prayer', towardsPrayer: 'to prayer',
        verseLabel: '📖 Verse of the Day', openFull: 'Open Full App',
        detectingLoc: 'Detecting location…', allowLocation: 'Allow Location',
        locationDenied: 'Jakarta (default)',
        prayerNames: {
            Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr',
            Asr: 'Asr', Maghrib: 'Maghrib', Isha: "Isha'a"
        },
        ramadanDay: 'Ramadan Day ', ramadanLabel: 'Ramadan',
        imsak: 'Imsak', sahur: 'Sahur ends', buka: 'Iftar',
        bersiap: '⚠️ Prepare for prayer!', adzanNear: 'Adzan in',
        hijriOffset: 'Hijri Date Correction',
        notifOn: '🔔', notifOff: '🔕',
        notifTooltipOn: 'Adzan notifications active', notifTooltipOff: 'Enable adzan notifications'
    }
};

let lang = localStorage.getItem(CACHE_KEY_LANG) || 'id';
let hijriOffset = parseInt(localStorage.getItem(CACHE_KEY_OFFSET) ?? '-1', 10);
let notifEnabled = localStorage.getItem(CACHE_KEY_NOTIF) === 'true';
let countdownInterval = null;
let globalTimings = null;
let reminderShown = false;

// ── MAIN ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    applyLang();
    renderDate();
    renderHijriOffsetControl();
    renderNotifToggle();
    await requestLocationAndLoad();
    await loadVerse();
    renderDailyChecklist();
    setupEventListeners();

    // Tab Navigation setup
    setupTabNavigation();

    // Refresh location button in popup
    document.getElementById('refresh-loc-btn').addEventListener('click', () => {
        localStorage.removeItem(CACHE_KEY_PRAYERS);
        localStorage.removeItem('nawaetu_coords');
        document.getElementById('location-name').textContent = t('detectingLoc');
        requestLocationAndLoad();
    });

    // Initial content loads for Side Panel Tabs
    loadQuranList();
    loadSpiritualContent();
});

function setupEventListeners() {
    document.getElementById('lang-toggle').addEventListener('click', () => {
        lang = lang === 'id' ? 'en' : 'id';
        localStorage.setItem(CACHE_KEY_LANG, lang);
        applyLang();
        if (globalTimings) renderPrayers(globalTimings.timings, globalTimings.hijri);
    });
}

function applyLang() {
    document.getElementById('lang-toggle').textContent = lang === 'id' ? 'EN' : 'ID';
    document.getElementById('open-web-btn').textContent = '↗ ' + t('openFull');
    document.getElementById('countdown-label').textContent = t('towardsPrayer');
    document.getElementById('verse-label').textContent = t('verseLabel');
    // document.getElementById('hijri-offset-label').textContent = t('hijriOffset'); // Removed in unified UI
    if (globalTimings) renderPrayers(globalTimings.timings, globalTimings.hijri);
}

function t(key) { return (T[lang] && T[lang][key] != null) ? T[lang][key] : T.id[key]; }

// ── DATE ─────────────────────────────────────────────────────────────────────
function renderDate() {
    const now = new Date();
    const days = {
        id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    const months = {
        id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    document.getElementById('date-gregorian').textContent =
        `${days[lang][now.getDay()]}, ${now.getDate()} ${months[lang][now.getMonth()]} ${now.getFullYear()}`;
}

// ── HIJRI OFFSET ─────────────────────────────────────────────────────────────
function renderHijriOffsetControl() {
    document.getElementById('hijri-offset-value').textContent = hijriOffset >= 0 ? `+${hijriOffset}` : String(hijriOffset);
    // document.getElementById('hijri-offset-label').textContent = t('hijriOffset'); // Removed in unified UI

    document.getElementById('offset-minus').addEventListener('click', () => {
        if (hijriOffset > -3) {
            hijriOffset--;
            localStorage.setItem(CACHE_KEY_OFFSET, hijriOffset);
            document.getElementById('hijri-offset-value').textContent = hijriOffset >= 0 ? `+${hijriOffset}` : String(hijriOffset);
            if (globalTimings) renderPrayers(globalTimings.timings, globalTimings.hijri);
        }
    });
    document.getElementById('offset-plus').addEventListener('click', () => {
        if (hijriOffset < 3) {
            hijriOffset++;
            localStorage.setItem(CACHE_KEY_OFFSET, hijriOffset);
            document.getElementById('hijri-offset-value').textContent = hijriOffset >= 0 ? `+${hijriOffset}` : String(hijriOffset);
            if (globalTimings) renderPrayers(globalTimings.timings, globalTimings.hijri);
        }
    });
}

// ── NOTIFICATION TOGGLE ───────────────────────────────────────────────────────
function renderNotifToggle() {
    const btn = document.getElementById('notif-toggle');
    btn.textContent = notifEnabled ? t('notifOn') : t('notifOff');
    btn.title = notifEnabled ? t('notifTooltipOn') : t('notifTooltipOff');
    btn.classList.toggle('active', notifEnabled);

    btn.addEventListener('click', async () => {
        if (!notifEnabled) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                notifEnabled = true;
                localStorage.setItem(CACHE_KEY_NOTIF, 'true');
                if (globalTimings) scheduleAdzanNotifications(globalTimings.timings);
                new Notification('Nawaetu 🕌', { body: lang === 'id' ? 'Notifikasi adzan diaktifkan.' : 'Adzan notifications enabled.' });
            }
        } else {
            notifEnabled = false;
            localStorage.setItem(CACHE_KEY_NOTIF, 'false');
        }
        btn.textContent = notifEnabled ? t('notifOn') : t('notifOff');
        btn.title = notifEnabled ? t('notifTooltipOn') : t('notifTooltipOff');
        btn.classList.toggle('active', notifEnabled);
    });
}

// ── GEOLOCATION ───────────────────────────────────────────────────────────────
async function requestLocationAndLoad() {
    // Clear ALL old cache keys to prevent stale city name
    localStorage.removeItem('nawaetu_ext_prayers_v2');
    localStorage.removeItem('nawaetu_ext_prayers_v3');

    // Check if already granted – if so, always fetch fresh GPS (no cache)
    if (navigator.permissions) {
        try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            if (status.state === 'granted') {
                // Use fresh GPS every time popup is opened
                document.getElementById('location-name').textContent = t('detectingLoc');
                const pos = await getCoords();
                localStorage.removeItem(CACHE_KEY_PRAYERS); // Only refresh cache if gps query succeeded
                await loadPrayersWithCoords(pos.coords.latitude, pos.coords.longitude, false);
                return;
            }
            if (status.state === 'denied') {
                document.getElementById('location-name').textContent = t('locationDenied');
                await loadPrayersWithCoords(-6.2088, 106.8456, true);
                return;
            }
        } catch (_) { /* ignore */ }
    }

    // Fallback: check cache then prompt
    const cached = readCache(CACHE_KEY_PRAYERS);
    if (cached && !cached.isDefault) {
        globalTimings = cached;
        setLocationUI(cached.city);
        renderPrayers(cached.timings, cached.hijri);
        return;
    }

    // Prompt user
    showLocationPrompt();
}

function setLocationUI(cityName) {
    document.getElementById('location-name').innerHTML =
        `${cityName} <button id="refresh-loc-btn" class="refresh-loc-btn" title="Perbarui lokasi">🔄</button>`;
    document.getElementById('refresh-loc-btn').addEventListener('click', async () => {
        document.getElementById('location-name').textContent = t('detectingLoc');
        try {
            const pos = await getCoords();
            localStorage.removeItem(CACHE_KEY_PRAYERS);
            await loadPrayersWithCoords(pos.coords.latitude, pos.coords.longitude, false);
        } catch {
            document.getElementById('location-name').textContent = t('locationDenied');
            await loadPrayersWithCoords(-6.2088, 106.8456, true);
        }
    });
}

function showLocationPrompt() {
    document.getElementById('location-name').innerHTML =
        `<button id="allow-loc-btn" class="allow-loc-btn">${t('allowLocation')} 📍</button>`;
    document.getElementById('allow-loc-btn').addEventListener('click', async () => {
        document.getElementById('location-name').textContent = t('detectingLoc');
        try {
            const pos = await getCoords();
            localStorage.removeItem(CACHE_KEY_PRAYERS);
            await loadPrayersWithCoords(pos.coords.latitude, pos.coords.longitude, false);
        } catch {
            document.getElementById('location-name').textContent = t('locationDenied');
            await loadPrayersWithCoords(-6.2088, 106.8456, true);
        }
    });
}

async function loadPrayersWithCoords(lat, lon, isDefault) {
    try {
        const today = getTodayString();
        const method = "20";
        const maghribTune = getMaghribCorrection(lat, lon);
        // Tune format: Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight
        const tuneParam = `2,2,0,4,4,${maghribTune},0,2,0`;
        const url = `https://api.aladhan.com/v1/timings/${today}?latitude=${lat}&longitude=${lon}&method=${method}&tune=${tuneParam}`;

        const res = await fetch(url);
        const json = await res.json();
        if (json.code !== 200) throw new Error();

        const timings = json.data.timings;
        const hijri = json.data.date.hijri;

        // Use BigDataCloud reverse geocoding for real city name
        let city = isDefault ? 'Jakarta (default)' : await getRealCityName(lat, lon);

        setLocationUI(city);

        const payload = { timings, city, hijri, isDefault };
        globalTimings = payload;
        saveCache(CACHE_KEY_PRAYERS, payload);
        renderPrayers(timings, hijri);

        if (notifEnabled) scheduleAdzanNotifications(timings);
    } catch {
        document.getElementById('prayer-grid').innerHTML =
            '<p style="color:#64748b;font-size:12px;text-align:center;padding:8px 0;grid-column:span 6">Gagal memuat jadwal sholat</p>';
    }
}

function getMaghribCorrection(lat, lng) {
    const R = 6371;
    const dLat = (lat - (-6.9175)) * Math.PI / 180;
    const dLng = (lng - 107.6191) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(-6.9175 * Math.PI / 180) * Math.cos(lat * Math.PI / 180)
        * Math.sin(dLng / 2) ** 2;
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distKm <= 25) return 8; // Bandung Raya
    return 3; // Other Indonesian cities
}

async function getRealCityName(lat, lon) {
    try {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
        const res = await fetch(url);
        const json = await res.json();
        // Prefer city > locality > principalSubdivision > countryName
        const city = json.city || json.locality || json.principalSubdivision || json.countryName || 'Lokasi Kamu';
        return city;
    } catch {
        return 'Lokasi Kamu';
    }
}

// ── PRAYERS ──────────────────────────────────────────────────────────────────
function renderPrayers(timings, hijri) {
    renderDate();
    const grid = document.getElementById('prayer-grid');
    const pNames = T[lang].prayerNames;
    const now = new Date();

    // Apply Hijri offset for Ramadan detection
    const rawHijriDay = hijri ? parseInt(hijri.day, 10) : 1;
    const hijriMonth = hijri ? parseInt(hijri.month.number, 10) : 0;
    const adjustedDay = rawHijriDay + hijriOffset;
    const isRamadan = hijriMonth === 9;

    // Ramadan banner
    const banner = document.getElementById('ramadan-banner');
    if (isRamadan) {
        const displayDay = Math.max(1, Math.min(30, adjustedDay));
        document.getElementById('ramadan-day-num').textContent = displayDay;
        document.getElementById('ramadan-banner-label').textContent =
            lang === 'id' ? `Ramadan Hari ke-${displayDay}` : `Ramadan Day ${displayDay}`;
        banner.style.display = 'flex';
    } else {
        banner.style.display = 'none';
    }

    // Imsak = Fajr - 10 min
    const imsakTime = subtractMinutes(timings['Fajr'], 10);

    // Ramadan highlights
    const rhSection = document.getElementById('ramadan-highlights');
    if (isRamadan) {
        document.getElementById('rh-imsak-label').textContent = t('imsak');
        document.getElementById('rh-imsak-time').textContent = imsakTime;
        document.getElementById('rh-sahur-label').textContent = t('sahur');
        document.getElementById('rh-sahur-time').textContent = timings['Fajr'].slice(0, 5);
        document.getElementById('rh-buka-label').textContent = t('buka');
        document.getElementById('rh-buka-time').textContent = timings['Maghrib'].slice(0, 5);
        rhSection.style.display = 'flex';
    } else {
        rhSection.style.display = 'none';
    }

    // Next prayer countdown
    const nextPrayer = getNextSholat(timings, now);
    if (nextPrayer) {
        document.getElementById('next-prayer-name').textContent = pNames[nextPrayer.name] || nextPrayer.name;
        document.getElementById('next-prayer-time-label').textContent = nextPrayer.time.slice(0, 5);
        document.getElementById('next-prayer-label').textContent = t('nextPrayer');
        document.getElementById('countdown-label').textContent = t('towardsPrayer');
        startCountdown(nextPrayer.date, pNames[nextPrayer.name] || nextPrayer.name);
    }

    // Prayer grid (6 columns: Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya)
    grid.innerHTML = '';
    PRAYER_NAMES.forEach(name => {
        const rawTime = timings[name]; if (!rawTime) return;
        const isActive = nextPrayer && nextPrayer.name === name;
        const isIftar = isRamadan && name === 'Maghrib';
        const isSahur = isRamadan && name === 'Fajr';
        const item = document.createElement('div');
        item.className = ['prayer-item', isActive && 'active', isIftar && 'iftar', isSahur && 'sahur']
            .filter(Boolean).join(' ');
        item.innerHTML = `<div class="prayer-item-name">${pNames[name] || name}</div>
                      <div class="prayer-item-time">${rawTime.slice(0, 5)}</div>`;
        grid.appendChild(item);
    });
}

function getNextSholat(timings, now) {
    const today = now.toISOString().split('T')[0];
    for (const name of SHOLAT_NAMES) {
        const raw = timings[name]; if (!raw) continue;
        const [h, m] = raw.split(':').map(Number);
        const dt = new Date(`${today}T${pad(h)}:${pad(m)}:00`);
        if (dt > now) return { name, time: raw, date: dt };
    }
    // Tomorrow Fajr
    const tmrw = new Date(now); tmrw.setDate(tmrw.getDate() + 1);
    const ts = tmrw.toISOString().split('T')[0];
    const fajr = timings['Fajr'];
    if (fajr) {
        const [h, m] = fajr.split(':').map(Number);
        return { name: 'Fajr', time: fajr, date: new Date(`${ts}T${pad(h)}:${pad(m)}:00`) };
    }
    return null;
}

function startCountdown(targetDate, prayerLabel) {
    if (countdownInterval) clearInterval(countdownInterval);
    reminderShown = false;
    const valueEl = document.getElementById('countdown-value');
    const labelEl = document.getElementById('countdown-label');
    const cardEl = document.querySelector('.next-prayer-card');
    const nameEl = document.getElementById('next-prayer-name');

    function update() {
        const diff = Math.max(0, targetDate - new Date());
        const minutes = Math.floor(diff / 60000);
        const hh = Math.floor(diff / 3600000);
        const mm = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);
        valueEl.textContent = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;

        // ── Bersiap reminder: within REMINDER_MINUTES
        if (minutes < REMINDER_MINUTES && minutes >= 0 && diff > 0) {
            if (!reminderShown) {
                reminderShown = true;
                cardEl.classList.add('bersiap');
                // Notification (if user allowed)
                if (notifEnabled && Notification.permission === 'granted') {
                    new Notification(`🕌 ${prayerLabel} – Nawaetu`, {
                        body: lang === 'id'
                            ? `Bersiap, waktu adzan ${prayerLabel} dalam ${minutes} menit.`
                            : `Prepare! ${prayerLabel} adhan in ${minutes} minutes.`,
                        icon: 'icons/icon-128.png'
                    });
                }
            }
            labelEl.textContent = t('bersiap').replace('⚠️ ', '');
            valueEl.classList.add('urgent');
        } else {
            cardEl.classList.remove('bersiap');
            valueEl.classList.remove('urgent');
            labelEl.textContent = t('towardsPrayer');
            if (diff === 0) {
                // Adzan time reached!
                clearInterval(countdownInterval);
                cardEl.classList.add('adzan');
                nameEl.textContent = lang === 'id' ? `🕌 Adzan ${prayerLabel}!` : `🕌 Adhan ${prayerLabel}!`;
                valueEl.textContent = lang === 'id' ? 'Allahu Akbar' : 'God is Greatest';
                if (notifEnabled && Notification.permission === 'granted') {
                    new Notification(`🕌 Waktu Adzan – ${prayerLabel}`, {
                        body: lang === 'id' ? `Allahu Akbar! Waktu ${prayerLabel} telah tiba.` : `Allahu Akbar! Time for ${prayerLabel}.`,
                        icon: 'icons/icon-128.png'
                    });
                }
            }
        }
    }
    update();
    countdownInterval = setInterval(update, 1000);
}

// ── ADZAN NOTIFICATIONS ───────────────────────────────────────────────────────
function scheduleAdzanNotifications(timings) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Chrome extensions can't use persistent alarms from popup.js
    // We show a reminder via countdown when popup is open.
    // Background service worker (background.js) handles persistent alarms.
    // Send timings to background via chrome.runtime.sendMessage
    if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'SCHEDULE_ALARMS', timings });
    }
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}

// ==========================================
// TABS NAVIGATION & VIEWS
// ==========================================
function setupTabNavigation() {
    const defaultView = "view-jadwal";
    const navItems = document.querySelectorAll('.nav-item');
    const viewContainers = document.querySelectorAll('.view-container');

    // Retrieve active tab from local storage or set default
    const savedView = localStorage.getItem('nawaetu_active_tab') || defaultView;

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetViewId = btn.getAttribute('data-target');

            navItems.forEach(n => n.classList.remove('active'));
            viewContainers.forEach(v => v.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetViewId).classList.add('active');

            // Allow storing state so it remembers last open tab
            localStorage.setItem('nawaetu_active_tab', targetViewId);

            // Reset views if necessary
            if (targetViewId === 'view-quran') {
                document.getElementById('quran-list').style.display = 'flex';
                document.getElementById('quran-detail').style.display = 'none';
            }
            if (targetViewId === 'view-spiritual') {
                document.getElementById('spiritual-category-list').style.display = 'grid';
                document.getElementById('spiritual-detail-view').style.display = 'none';
                loadSpiritualContent();
            }
        });
    });

    // Initial activation
    const initialNav = document.querySelector(`.nav-item[data-target="${savedView}"]`);
    if (initialNav) {
        initialNav.click();
    }
}

// ==========================================
// QURAN AUDIO STATE
// ==========================================
let currentAudio = null;
let currentAudioBtn = null;

function toggleAudio(btn, url) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;

        // Also stop full surah playback if active
        const playSurahBtn = document.getElementById('quran-play-surah');
        if (playSurahBtn && playSurahBtn.classList.contains('playing')) {
            playSurahBtn.classList.remove('playing');
            playSurahBtn.textContent = '▶️ Putar';
        }

        if (currentAudioBtn) {
            currentAudioBtn.classList.remove('playing');
            currentAudioBtn.textContent = '🔊 Audio';
        }
    }

    // If clicking the same button that was playing, we just pause it (already done above)
    if (currentAudioBtn === btn) {
        currentAudioBtn = null;
        currentAudio = null;
        return;
    }

    // Play new audio
    currentAudio = new Audio(url);
    currentAudioBtn = btn;
    btn.classList.add('playing');
    btn.textContent = '⏹ Berhenti';

    currentAudio.play().catch(e => console.error("Audio play failed:", e));

    currentAudio.onended = () => {
        btn.classList.remove('playing');
        btn.textContent = '🔊 Audio';
        currentAudio = null;
        currentAudioBtn = null;
    };
}

function toggleBookmark(btn) {
    const key = btn.getAttribute('data-key');
    let bookmarks = JSON.parse(localStorage.getItem('nawaetu_quran_bookmarks') || '[]');
    const isSaved = bookmarks.some(b => b.key === key);

    if (isSaved) {
        // Remove bookmark
        bookmarks = bookmarks.filter(b => b.key !== key);
        btn.classList.remove('saved');
        btn.textContent = '⭐ Simpan';
    } else {
        // Add bookmark
        bookmarks.push({
            key: key,
            surah: btn.getAttribute('data-surah'),
            text: btn.getAttribute('data-text'),
            translation: btn.getAttribute('data-trans')
        });
        btn.classList.add('saved');
        btn.textContent = '⭐ Tersimpan';
    }
    localStorage.setItem('nawaetu_quran_bookmarks', JSON.stringify(bookmarks));
}

function renderBookmarksView() {
    const listContainer = document.getElementById('quran-list');
    const detailContainer = document.getElementById('quran-detail');
    const versesContainer = document.getElementById('quran-verses');
    const backBtn = document.getElementById('quran-back-btn');

    listContainer.style.display = 'none';
    detailContainer.style.display = 'block';

    let bookmarks = JSON.parse(localStorage.getItem('nawaetu_quran_bookmarks') || '[]');

    backBtn.onclick = () => {
        detailContainer.style.display = 'none';
        listContainer.style.display = 'flex';
        versesContainer.innerHTML = '';
        if (currentAudio) { currentAudio.pause(); currentAudio = null; if (currentAudioBtn) currentAudioBtn.classList.remove('playing'); currentAudioBtn = null; }
    };

    if (bookmarks.length === 0) {
        versesContainer.innerHTML = '<div style="text-align:center;color:var(--text-dim);margin-top:20px;">Belum ada ayat tersimpan.</div>';
        return;
    }

    let html = '';
    bookmarks.forEach(b => {
        html += `
            <div class="verse-item">
                <div class="verse-header">
                    <span style="color: var(--text-dim);">${b.surah}</span>
                    <div class="verse-num-badge">${b.key.split(':')[1]}</div>
                </div>
                <div class="verse-text">${b.text}</div>
                <div class="verse-translation">${b.translation}</div>
                <div class="verse-actions">
                    <button class="verse-btn btn-save saved" data-key="${b.key}" data-surah="${b.surah}" data-text="${b.text}" data-trans="${b.translation}">⭐ Tersimpan</button>
                    <button class="verse-btn" onclick="loadQuranDetail(${b.key.split(':')[0]}, '${b.surah}')">📖 Buka Surah</button>
                </div>
            </div>
        `;
    });
    versesContainer.innerHTML = html;
    detailContainer.scrollTo(0, 0);

    versesContainer.querySelectorAll('.btn-save').forEach(btn => {
        btn.onclick = (e) => {
            toggleBookmark(e.target);
            // Hide parent if removed from bookmarks view
            if (!e.target.classList.contains('saved')) {
                e.target.closest('.verse-item').style.display = 'none';
            }
        };
    });
}

// ==========================================
// QURAN FEATURE
// ==========================================
async function loadQuranList() {
    const listContainer = document.getElementById('quran-list');

    // Last Read Badge functionality
    const lastReadBtn = document.getElementById('quran-last-read');
    const lastReadData = JSON.parse(localStorage.getItem('nawaetu_quran_lastRead') || 'null');
    if (lastReadData) {
        lastReadBtn.style.display = 'flex';
        lastReadBtn.textContent = `⏱️ Lanjut: ${lastReadData.name}`;
        lastReadBtn.onclick = () => loadQuranDetail(lastReadData.number, lastReadData.name);
    } else {
        lastReadBtn.style.display = 'none';
    }

    // Bookmarks View Button
    const bookmarksBtn = document.getElementById('quran-bookmarks');
    bookmarksBtn.onclick = () => renderBookmarksView();

    // Check local cache
    const cachedQuran = localStorage.getItem('nawaetu_quran_list');
    if (cachedQuran) {
        renderQuranList(JSON.parse(cachedQuran));
        return;
    }

    try {
        listContainer.innerHTML = '<div class="skeleton" style="width: 100%; height: 60px;"></div><div class="skeleton" style="width: 100%; height: 60px;"></div><div class="skeleton" style="width: 100%; height: 60px;"></div>';
        const res = await fetch('https://quran-api-id.vercel.app/surah');
        if (!res.ok) throw new Error("Failed to load surahs");

        const json = await res.json();
        if (json && json.data) {
            localStorage.setItem('nawaetu_quran_list', JSON.stringify(json.data));
            renderQuranList(json.data);
        }
    } catch (err) {
        console.error("Quran Fetch Error", err);
        listContainer.innerHTML = '<div style="text-align: center; color: var(--text-dim);">Gagal memuat Al-Quran.</div>';
    }
}

function renderQuranList(surahs) {
    const listContainer = document.getElementById('quran-list');
    listContainer.innerHTML = '';

    surahs.forEach(surah => {
        const item = document.createElement('div');
        item.className = 'list-item surah-item';
        item.innerHTML = `
            <div style="display: flex; align-items: center; max-width: 65%;">
                <div class="surah-num">${surah.number}</div>
                <div class="surah-details">
                    <div class="surah-name">${surah.name.transliteration.id}</div>
                    <div class="surah-meta">${surah.name.translation.id} • ${surah.numberOfVerses} ayat</div>
                </div>
            </div>
            <div class="surah-arabic">${surah.name.short}</div>
        `;

        item.addEventListener('click', () => {
            loadQuranDetail(surah.number, surah.name.transliteration.id);
        });

        listContainer.appendChild(item);
    });
}

let isMushafMode = false;

async function loadQuranDetail(surahNumber, surahName) {
    const listContainer = document.getElementById('quran-list');
    const detailContainer = document.getElementById('quran-detail');
    const versesContainer = document.getElementById('quran-verses');
    const backBtn = document.getElementById('quran-back-btn');
    const playSurahBtn = document.getElementById('quran-play-surah');
    const mushafToggleBtn = document.getElementById('quran-mushaf-mode');

    // Save to last read
    localStorage.setItem('nawaetu_quran_lastRead', JSON.stringify({ number: surahNumber, name: surahName }));
    const lastReadBtn = document.getElementById('quran-last-read');
    lastReadBtn.style.display = 'flex';
    lastReadBtn.textContent = `⏱️ Lanjut: ${surahName}`;

    listContainer.style.display = 'none';
    detailContainer.style.display = 'block';

    versesContainer.innerHTML = '<div class="skeleton" style="width: 100%; height: 100px;"></div><div class="skeleton" style="width: 100%; height: 100px;"></div>';

    // Mushaf Mode State Handling
    if (isMushafMode) {
        versesContainer.classList.add('mushaf');
        mushafToggleBtn.textContent = '📖 Standar';
    } else {
        versesContainer.classList.remove('mushaf');
        mushafToggleBtn.textContent = '📖 Mushaf';
    }
    backBtn.onclick = () => {
        detailContainer.style.display = 'none';
        listContainer.style.display = 'flex';
        versesContainer.innerHTML = '';
        if (currentAudio) { currentAudio.pause(); currentAudio = null; if (currentAudioBtn) currentAudioBtn.classList.remove('playing'); currentAudioBtn = null; }

        // Reset Play Surah button
        const playSurahBtnReset = document.getElementById('quran-play-surah');
        if (playSurahBtnReset && playSurahBtnReset.classList.contains('playing')) {
            playSurahBtnReset.classList.remove('playing');
            playSurahBtnReset.textContent = '▶️ Putar';
        }
    };

    mushafToggleBtn.onclick = () => {
        isMushafMode = !isMushafMode;
        if (isMushafMode) {
            versesContainer.classList.add('mushaf');
            mushafToggleBtn.textContent = '📖 Standar';
        } else {
            versesContainer.classList.remove('mushaf');
            mushafToggleBtn.textContent = '📖 Mushaf';
        }
    };

    try {
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?language=id&word_translation_language=id&words=true&word_fields=text_uthmani,text_indopak&translations=33&fields=text_uthmani,text_uthmani_tajweed&audio=7&page=1&per_page=300`);
        const data = await res.json();

        let html = '';
        if (surahNumber !== 1 && surahNumber !== 9) {
            html += `<div class="verse-text" style="text-align: center; margin-bottom: 24px;">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
        }

        const savedBookmarks = JSON.parse(localStorage.getItem('nawaetu_quran_bookmarks') || '[]');
        const verseAudios = [];

        data.verses.forEach(v => {
            const verseKey = `${surahNumber}:${v.verse_number}`;
            const text = v.text_uthmani;
            const transliteration = v.words.map(w => w.transliteration?.text || '').filter(Boolean).join(' ');
            const translation = v.translations && v.translations[0] ? v.translations[0].text : '';
            const audioUrl = v.audio?.url ? (v.audio.url.startsWith('http') ? v.audio.url : `https://verses.quran.com/${v.audio.url}`) : null;
            const isSaved = savedBookmarks.some(b => b.key === verseKey);

            if (audioUrl) {
                verseAudios.push({ key: verseKey, url: audioUrl });
            }

            html += `
                <div class="verse-item" id="verse-${verseKey}">
                    <div class="verse-header">
                        <span style="color: var(--text-dim);">${surahName}</span>
                        <div class="verse-num-badge">${v.verse_number}</div>
                    </div>
                    <div class="verse-text">${text}</div>
                    <div class="verse-transliteration">${transliteration}</div>
                    <div class="verse-translation">${translation}</div>
                    <div class="verse-actions">
                        ${audioUrl ? `<button class="verse-btn btn-audio" data-key="${verseKey}" data-audio="${audioUrl}">🔊 Audio</button>` : ''}
                        <button class="verse-btn btn-save ${isSaved ? 'saved' : ''}" data-key="${verseKey}" data-surah="${surahName}" data-text="${text}" data-trans="${translation}">⭐ ${isSaved ? 'Tersimpan' : 'Simpan'}</button>
                    </div>
                </div>
            `;
        });

        versesContainer.innerHTML = html;
        detailContainer.scrollTo(0, 0);

        // Individual Audio & Bookmarks
        versesContainer.querySelectorAll('.btn-audio').forEach(btn => {
            btn.onclick = (e) => toggleAudio(e.target, btn.getAttribute('data-audio'));
        });
        versesContainer.querySelectorAll('.btn-save').forEach(btn => {
            btn.onclick = (e) => toggleBookmark(e.target);
        });

        // Full Surah Playback Logic
        playSurahBtn.onclick = () => {
            if (playSurahBtn.classList.contains('playing')) {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                }
                playSurahBtn.classList.remove('playing');
                playSurahBtn.textContent = '▶️ Putar';
                return;
            }

            playSurahBtn.classList.add('playing');
            playSurahBtn.textContent = '⏹ Berhenti';
            playSequentially(0);
        };

        function playSequentially(index) {
            if (index >= verseAudios.length || !playSurahBtn.classList.contains('playing')) {
                playSurahBtn.classList.remove('playing');
                playSurahBtn.textContent = '▶️ Putar';
                return;
            }

            const verse = verseAudios[index];
            const btn = versesContainer.querySelector(`.btn-audio[data-key="${verse.key}"]`);

            // Scroll to verse
            const targetEl = document.getElementById(`verse-${verse.key}`);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

            if (currentAudio) {
                currentAudio.pause();
            }

            currentAudio = new Audio(verse.url);
            currentAudio.play();

            if (currentAudioBtn) currentAudioBtn.classList.remove('playing');
            currentAudioBtn = btn;
            if (btn) btn.classList.add('playing');

            currentAudio.onended = () => {
                if (btn) btn.classList.remove('playing');
                playSequentially(index + 1);
            };

            currentAudio.onerror = () => {
                console.error("Sequential play failed at index", index);
                playSequentially(index + 1);
            };
        }

    } catch (error) {
        console.error("Verses load error:", error);
        versesContainer.innerHTML = '<div style="text-align: center; color: var(--text-dim);">Gagal memuat ayat.</div>';
    }
}

// ==========================================
// CATEGORY MAPPING
// ==========================================
const CATEGORY_MAP = {
    spiritualCategoryCharacter: "Akhlak & Karakter",
    spiritualCategoryWorship: "Ibadah",
    spiritualCategorySocial: "Sosial & Muamalah",
    spiritualCategoryDaily: "Doa Harian",
    spiritualCategoryMorningEvening: "Dzikir Pagi & Petang",
    spiritualCategoryProtection: "Perlindungan",
    spiritualCategoryForgiveness: "Ampunan",
    spiritualCategoryGratitude: "Syukur",
    spiritualCategoryFamily: "Keluarga",
    spiritualCategoryTravel: "Safar",
    spiritualCategoryPain: "Saat Sakit",
    spiritualCategoryGrief: "Kesedihan",
    spiritualCategoryKnowledge: "Ilmu & Belajar",
    spiritualCategoryFaith: "Iman & Keyakinan"
};

function getCategoryName(cat) {
    return CATEGORY_MAP[cat] || cat;
}

// ==========================================
// DOA & HADITS FEATURE
// ==========================================
// ==========================================
// UNIFIED SPIRITUAL FEATURE (DOA & HADITS)
// ==========================================
let allSpiritualItems = [];
const SPIRITUAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function loadSpiritualContent() {
    const listCont = document.getElementById('spiritual-category-list');
    if (!allSpiritualItems.length) {
        listCont.innerHTML = '<div class="loading-spinner">Memasukkan hikmah...</div>';
    }

    try {
        const cached = readCache('nawaetu_spiritual_data');
        if (cached) {
            allSpiritualItems = cached;
        } else {
            // Fetch from APIs
            const [doaRes, hadithRes] = await Promise.allSettled([
                fetch('https://doa-doa-harian-api.vercel.app/ads').then(r => r.json()),
                fetch('https://api.hadith.gading.dev/books/bukhari?range=1-50').then(r => r.json())
            ]);

            let apiItems = [];

            if (doaRes.status === 'fulfilled') {
                doaRes.value.forEach(d => apiItems.push({
                    id: `api_doa_${d.id}`,
                    type: 'dua',
                    category: 'spiritualCategoryDaily',
                    content: { title: d.doa, arabic: d.ayat, latin: d.latin, translation: d.artinya, source: 'Doa Harian' }
                }));
            }

            if (hadithRes.status === 'fulfilled') {
                hadithRes.value.data.hadiths.forEach(h => apiItems.push({
                    id: `api_hadith_${h.number}`,
                    type: 'hadith',
                    category: 'spiritualCategoryCharacter',
                    content: { title: `Hadits Bukhari No. ${h.number}`, arabic: h.arab, latin: '', translation: h.id, source: 'HR. Bukhari' }
                }));
            }

            allSpiritualItems = [...(window.SPIRITUAL_CONTENT || []), ...apiItems];
            saveCache('nawaetu_spiritual_data', allSpiritualItems);
        }

        renderSpiritualCategories(allSpiritualItems);
        setupSpiritualSearch();
    } catch (e) {
        console.error("Spiritual error:", e);
        renderSpiritualCategories(window.SPIRITUAL_CONTENT || []);
    }
}

function renderSpiritualCategories(items) {
    const categoryListCont = document.getElementById('spiritual-category-list');
    const detailView = document.getElementById('spiritual-detail-view');
    const backBtn = document.getElementById('spiritual-back-btn');

    const grouped = {};
    items.forEach(item => {
        const cat = item.category || 'spiritualCategoryOther';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    categoryListCont.innerHTML = Object.keys(grouped).map(cat => `
        <div class="category-card" data-category="${cat}">
            <div class="category-title">${getCategoryName(cat)}</div>
            <div class="category-count">${grouped[cat].length} Item</div>
        </div>
    `).join('');

    categoryListCont.querySelectorAll('.category-card').forEach(card => {
        card.onclick = () => {
            const catId = card.getAttribute('data-category');
            renderSpiritualDetail(grouped[catId], getCategoryName(catId));
        };
    });

    backBtn.onclick = () => {
        detailView.style.display = 'none';
        categoryListCont.style.display = 'grid';
        document.querySelector('.spiritual-header-nav h2').textContent = 'Doa & Hadits';
        document.querySelector('.search-box').style.display = 'block';
    };
}

function renderSpiritualDetail(items, title) {
    const categoryListCont = document.getElementById('spiritual-category-list');
    const detailView = document.getElementById('spiritual-detail-view');
    const listCont = document.getElementById('spiritual-list');
    const headerTitle = document.querySelector('.spiritual-header-nav h2');
    const searchBox = document.querySelector('.search-box');

    categoryListCont.style.display = 'none';
    detailView.style.display = 'block';
    headerTitle.textContent = title;
    searchBox.style.display = 'none';

    listCont.innerHTML = items.map(item => `
        <div class="spiritual-item">
            <div class="content-item-type">${item.type === 'dua' ? '🤲 Doa' : '📜 Hadits'}</div>
            <div class="content-item-title">${item.content.title}</div>
            <div class="content-item-arabic">${item.content.arabic}</div>
            ${item.content.latin ? `<div class="content-item-latin">${item.content.latin}</div>` : ''}
            <div class="content-item-trans">"${item.content.translation}"</div>
            <div class="content-item-source">${item.content.source || 'Nawaetu'}</div>
        </div>
    `).join('');
}

function setupSpiritualSearch() {
    const searchInput = document.getElementById('spiritual-search');
    const categoryListCont = document.getElementById('spiritual-category-list');
    const detailView = document.getElementById('spiritual-detail-view');
    const listCont = document.getElementById('spiritual-list');
    const headerTitle = document.querySelector('.spiritual-header-nav h2');

    searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            detailView.style.display = 'none';
            categoryListCont.style.display = 'grid';
            headerTitle.textContent = 'Doa & Hadits';
            return;
        }

        categoryListCont.style.display = 'none';
        detailView.style.display = 'block';
        headerTitle.textContent = 'Hasil Pencarian';

        const filtered = allSpiritualItems.filter(item =>
            item.content.title.toLowerCase().includes(term) ||
            item.content.translation.toLowerCase().includes(term) ||
            (item.content.latin && item.content.latin.toLowerCase().includes(term))
        );

        if (filtered.length === 0) {
            listCont.innerHTML = '<div style="text-align:center; padding: 20px; color: var(--text-dim);">Tidak ditemukan hasil untuk pencarian Anda.</div>';
        } else {
            listCont.innerHTML = filtered.map(item => `
                <div class="spiritual-item">
                    <div class="content-item-type">${item.type === 'dua' ? '🤲 Doa' : '📜 Hadits'}</div>
                    <div class="content-item-title">${item.content.title}</div>
                    <div class="content-item-arabic">${item.content.arabic}</div>
                    ${item.content.latin ? `<div class="content-item-latin">${item.content.latin}</div>` : ''}
                    <div class="content-item-trans">"${item.content.translation}"</div>
                    <div class="content-item-source">${item.content.source || 'Nawaetu'}</div>
                </div>
            `).join('');
        }
    };
}

// ── VERSE ─────────────────────────────────────────────────────────────────────
// ── VERSE (Authentic Source Quotes) ────────────────────────────────────────────────────────
const RAMADAN_QUOTES = [
    { arabic: "شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ", translation: "Bulan Ramadan, bulan yang di dalamnya diturunkan (permulaan) Al-Qur'an sebagai petunjuk bagi manusia...", ref: "Q.S Al-Baqarah: 185" },
    { arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "Barangsiapa berpuasa Ramadan atas dasar iman dan mengharap pahala dari Allah, maka dosanya yang telah lalu akan diampuni.", ref: "H.R. Bukhari & Muslim" },
    { arabic: "مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "Barangsiapa menghidupkan malam Lailatul Qadar karena iman dan mengharap pahala dari Allah, niscaya diampuni dosa-dosanya yang telah lalu.", ref: "H.R. Bukhari & Muslim" },
    { arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ", translation: "Wahai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.", ref: "Q.S Al-Baqarah: 183" },
    { arabic: "الصيام جنة فلما كان يوم صوم أحدكم فلا يرفث ولا يصخب", translation: "Puasa adalah perisai. Maka janganlah seseorang berkata kotor dan berteriak-teriak. Jika seseorang mencelanya, katakanlah: 'Aku sedang berpuasa.'", ref: "H.R. Bukhari & Muslim" },
    { arabic: "إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ وَغُلِّقَتْ أَبْوَابُ النَّارِ وَصُفِّدَتِ الشَّيَاطِينُ", translation: "Apabila datang bulan Ramadan, pintu-pintu surga dibuka, pintu-pintu neraka ditutup, dan setan-setan dibelenggu.", ref: "H.R. Bukhari & Muslim" },
    { arabic: "الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ وَرَمَضَانُ إِلَى رَمَضَانَ مُكَفِّرَاتٌ مَا بَيْنَهُنَّ إِذَا اجْتَنَبَ الْكَبَائِرَ", translation: "Salat lima waktu, Jumat ke Jumat, dan Ramadan ke Ramadan adalah penghapus dosa di antara keduanya, jika dosa-dosa besar dijauhi.", ref: "H.R. Muslim" },
    { arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya.", ref: "H.R. Bukhari" },
    { arabic: "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً", translation: "Bersahurlah kalian, karena sesungguhnya pada sahur itu terdapat keberkahan.", ref: "H.R. Bukhari & Muslim" },
    { translation: "Hitunglah diri kalian sendiri sebelum kalian dihitung (dihisab pada hari kiamat).", ref: "Umar bin Khattab radiyallahu 'anhu" },
    { translation: "Jadikanlah ilmu sebagai sahabat dan akhlak sebagai pedoman hidup.", ref: "Imam Asy-Syafi'i rahimahullah" },
    { translation: "Dunia ini bagaikan bayangan. Kalau kau berusaha menangkapnya, ia akan lari. Tapi kalau kau membelakanginya, ia tak punya pilihan selain mengikutimu.", ref: "Ibnu Qayyim al-Jauziyah" },
    { translation: "Orang yang paling aku sukai adalah dia yang menunjukkan kesalahanku.", ref: "Umar bin Khattab radiyallahu 'anhu" }
];

async function loadVerse() {
    const index = getDayOfYear() % RAMADAN_QUOTES.length;
    const data = RAMADAN_QUOTES[index];
    renderVerse(data);
}

function renderVerse(data) {
    const arabicEl = document.getElementById('verse-arabic');
    if (data.arabic) {
        arabicEl.textContent = data.arabic;
        arabicEl.style.display = 'block';
    } else {
        arabicEl.style.display = 'none';
        arabicEl.textContent = '';
    }
    document.getElementById('verse-translation').textContent = `"${data.translation}"`;
    document.getElementById('verse-ref').textContent = data.ref;
}

// ── TARGET IBADAH CHECKLIST ──────────────────────────────────────────────────
const IBADAH_TASKS = [
    { id: "ibadah_subuh_jamaah", label: "Sholat Subuh Berjamaah" },
    { id: "ibadah_dhuha", label: "Sholat Dhuha" },
    { id: "ibadah_tilawah", label: "Tilawah Al-Quran (1 Juz)" },
    { id: "ibadah_sedekah", label: "Sedekah Harian" },
    { id: "ibadah_tarawih", label: "Sholat Tarawih/Qiyam" },
];

function renderDailyChecklist() {
    const todayStr = getTodayString();
    let history = JSON.parse(localStorage.getItem('nawaetu_ibadah_history') || '{}');
    let streakCount = Number(localStorage.getItem('nawaetu_ibadah_streak') || 0);

    // Initialize today's record if empty
    if (!history[todayStr]) {
        history[todayStr] = {}; // All false by default
    }

    const container = document.getElementById('ibadah-checklist');
    let completedToday = 0;

    const html = IBADAH_TASKS.map(task => {
        const isChecked = history[todayStr][task.id] === true;
        if (isChecked) completedToday++;
        return `
            <label class="checklist-item ${isChecked ? 'checked' : ''}" for="${task.id}">
                <input type="checkbox" id="${task.id}" class="checklist-checkbox" ${isChecked ? 'checked' : ''}>
                <span class="checklist-label">${task.label}</span>
            </label>
        `;
    }).join('');

    container.innerHTML = html;

    // Streak visualization (simplified)
    document.getElementById('ibadah-streak-counter').textContent = `🔥 ${streakCount}`;

    // Attach event listeners
    const checkboxes = container.querySelectorAll('.checklist-checkbox');
    checkboxes.forEach(chk => {
        chk.addEventListener('change', (e) => {
            const taskId = e.target.id;
            const checked = e.target.checked;

            // UI Update
            e.target.closest('.checklist-item').classList.toggle('checked', checked);

            // State Update
            history = JSON.parse(localStorage.getItem('nawaetu_ibadah_history') || '{}');
            if (!history[todayStr]) history[todayStr] = {};
            history[todayStr][taskId] = checked;

            // Check if all completed
            const allChecked = IBADAH_TASKS.every(t => history[todayStr][t.id] === true);
            if (allChecked && completedToday < IBADAH_TASKS.length) {
                // Just turned full
                streakCount++;
                localStorage.setItem('nawaetu_ibadah_streak', streakCount.toString());
                document.getElementById('ibadah-streak-counter').textContent = `🔥 ${streakCount}`;
            } else if (!allChecked && completedToday === IBADAH_TASKS.length) {
                // Was full, now not
                streakCount = Math.max(0, streakCount - 1);
                localStorage.setItem('nawaetu_ibadah_streak', streakCount.toString());
                document.getElementById('ibadah-streak-counter').textContent = `🔥 ${streakCount}`;
            }

            localStorage.setItem('nawaetu_ibadah_history', JSON.stringify(history));
            completedToday = IBADAH_TASKS.filter(t => history[todayStr][t.id] === true).length;
        });
    });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function subtractMinutes(timeStr, mins) {
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m - mins;
    return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}
function getCoords() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('No geolocation'));
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, enableHighAccuracy: true });
    });
}
function getTodayString() {
    const n = new Date();
    return `${pad(n.getDate())}-${pad(n.getMonth() + 1)}-${n.getFullYear()}`;
}
function getDayOfYear() {
    const n = new Date();
    return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000);
}
function pad(n) { return String(n).padStart(2, '0'); }
function readCache(key) {
    try {
        const raw = localStorage.getItem(key); if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(key); return null; }
        return data;
    } catch { return null; }
}
function saveCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch { }
}
