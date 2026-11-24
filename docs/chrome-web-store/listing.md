# Chrome Web Store listing: Nawaetu 1.10.0

Package: `nawaetu-extension.zip` (repo root, built with `npm run build:extension`).
Assets: this folder.

## Store listing tab

### Description (Bahasa Indonesia, the listing language)

```
Nawaetu menemani ibadah harian langsung dari side panel browser: jadwal sholat sesuai lokasi, hitung mundur ke sholat berikutnya, notifikasi adzan, dan bacaan Al-Qur'an, doa, serta hadits.

Fitur
• Jadwal sholat harian (Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya) berdasarkan lokasi Anda
• Hitung mundur ke sholat berikutnya dan notifikasi adzan (bisa dinyalakan atau dimatikan)
• Tanggal Hijriah dengan koreksi tanggal
• Target ibadah harian yang bisa dicentang
• Ayat hari ini
• Al-Qur'an: daftar 114 surah, terjemahan, audio, mode mushaf, dan penanda bacaan
• Doa, dzikir, dan hadits per kategori, beserta sumbernya
• Tampilan Bahasa Indonesia dan English

Gratis, tanpa iklan, dan tanpa akun. Ekstensi ini tidak mengirim data ke server Nawaetu. Jika Anda mengizinkan lokasi, koordinat dikirim ke Aladhan untuk menghitung waktu sholat dan ke BigDataCloud untuk menampilkan nama kota. Pengaturan dan bookmark hanya tersimpan di browser Anda.

Versi lengkap dengan jurnal niat, misi, statistik, dan Sirah tersedia di https://nawaetu.com

---

Nawaetu brings daily worship to your browser side panel: prayer times for your location, a countdown to the next prayer, adzan notifications, and the Quran, duas, and hadith.

Free, no ads, no account. Nothing is sent to Nawaetu servers; if you allow location, coordinates go to Aladhan (prayer times) and BigDataCloud (city name). Settings and bookmarks stay in your browser.
```

### Other fields

| Field | Value |
| --- | --- |
| Category | Lifestyle, then **Well-being** if a subcategory is offered |
| Language | **Indonesian** (Bahasa Indonesia) |
| Store icon | `store-icon-128.png` |
| Global promo video | leave empty |
| Screenshots | `screenshot-1-jadwal.jpg`, `screenshot-2-quran.jpg`, `screenshot-3-doa.jpg` (1280×800) |
| Small promo tile | `small-promo-tile.jpg` (440×280) |
| Marquee promo tile | leave empty (optional) |
| Official URL | `nawaetu.com`, only if it is listed. It appears once the domain is verified in Google Search Console with the same Google account. Otherwise leave it. |
| Homepage URL | `https://nawaetu.com` |
| Support URL | `https://github.com/hadianr/nawaetu/issues` |
| Mature content | Off |

## Privacy tab

**Single purpose**

```
Show daily prayer times with a countdown and adzan notifications, and let the user read the Quran, duas, and hadith in the browser side panel.
```

**Permission justifications**

| Permission | Justification |
| --- | --- |
| `geolocation` | Prayer times depend on the user's location. The location is read only after the user allows it, and is used to request prayer times and the city name. |
| `notifications` | Shows the adzan notification and a reminder before each prayer, only after the user turns notifications on. |
| `alarms` | Schedules the adzan and reminder notifications at each day's prayer times. |
| `sidePanel` | The extension's interface opens in Chrome's side panel when the toolbar icon is clicked. |

**Remote code:** No, I am not using remote code. All scripts are in the package; the extension only fetches JSON data (prayer times, Quran, dua, and hadith text).

**Data usage:** check **Location** only. Then check all three certifications:

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** `https://nawaetu.com/privacy`

The policy section that covers the extension ships with this branch. Deploy it before you submit for review, because reviewers open the link.

## Distribution tab

| Field | Value |
| --- | --- |
| Payments | Free of charge |
| Visibility | Public |
| Regions | All regions |

## Test instructions tab

No account or login is needed. Leave empty, or write:

```
No login required. Open the side panel from the toolbar icon. Allow location to see local prayer times (without it, Jakarta is used). Turn on notifications with the "Off/On" button in the header.
```
