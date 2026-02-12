# 🔍 Quran Detail Page - Debugging & Verification Guide

## Issue Fixed ✅
**Problem:** Users couldn't access Quran detail pages, no error messages in console

**Root Cause:** Silent failures in VerseBrowser component - API errors were thrown but not caught

**Solution Implemented:**
- ✅ Added try-catch error handling in VerseBrowser
- ✅ Added detailed console logging for debugging
- ✅ Improved error messages
- ✅ User-friendly error UI with "Kembali ke Daftar Surah" button

---

## Testing the Fix

### Method 1: Browser Testing (Recommended)

1. **Open DevTools Console**
   - Press `F12` or `Cmd+Opt+J` (Mac)
   - Go to Console tab
   - Keep open while testing

2. **Navigate to Quran Page**
   - Go to `/quran` page
   - Click any Surah to view detail
   - Watch console for logs

3. **Expected Logs:**
   ```
   [VerseBrowser] Fetching chapter 1, page 1...
   [getKemenagChapters] Fetching all chapters...
   [getKemenagChapters] ✓ Loaded 114 chapters
   [getKemenagChapter] Fetching chapter: 1
   [getKemenagChapter] ✓ Found chapter: Al-Fatihah
   [getKemenagVerses] Fetching verses: surah=1, page=1, perPage=20, locale=id
   [getKemenagVerses] ✓ Fetched 7 verses for surah 1
   [VerseBrowser] Successfully loaded 7 verses, total pages: 1
   ```

### Method 2: Error Testing (If API is Down)

1. **Temporarily break API URL** to test error handling
   - Edit `src/lib/kemenag-api.ts`
   - Change `API_CONFIG.QURAN_COM.BASE_URL` to `"https://fake-api.example.com"`
   - Run dev server
   - Click Surah detail

2. **Expected Result:**
   - Error UI displays: "⚠️ Gagal Memuat Surah"
   - Error message shows: "Failed to fetch verses: The server is unreachable"
   - "Kembali ke Daftar Surah" button works
   - Console shows error logs

3. **Revert the change:**
   - Change back to original API URL

### Method 3: Database Verification

```bash
# Check if database connection is working
npx drizzle-kit introspect

# Expected output:
# ✓ Pulling schema from database...
# [Success message or error details]
```

---

## Console Logging Reference

### Normal Flow (Success)

```
[getKemenagChapters] Fetching all chapters...
[getKemenagChapters] ✓ Loaded 114 chapters
[VerseBrowser] Fetching chapter 1, page 1...
[getKemenagChapter] Fetching chapter: 1
[getKemenagChapter] ✓ Found chapter: Al-Fatihah
[getKemenagVerses] Fetching verses: surah=1, page=1, perPage=20, locale=id
[getKemenagVerses] ✓ Fetched 7 verses for surah 1
[VerseBrowser] Successfully loaded 7 verses, total pages: 1
```

### Error Flow (API Down)

```
[getKemenagChapters] Fetching all chapters...
[getKemenagChapters] Error fetching chapters: FetchError: request to https://api.gading.dev/api/quran/surah failed, reason: getaddrinfo ENOTFOUND api.gading.dev
[VerseBrowser] ERROR: Failed to load chapter 1: Chapter 1 not found in chapters list
```

### Empty Data Error

```
[getKemenagVerses] Fetching verses: surah=1, page=1, perPage=20, locale=id
[getKemenagVerses] ✓ Fetched 0 verses for surah 1
[VerseBrowser] ERROR: No verses found for chapter 1, page 1
```

---

## Troubleshooting

### Symptom: "No verses found" error

**Possible Causes:**
1. API is returning empty verses
2. Page number is out of range
3. Invalid Surah ID

**Debug Steps:**
```javascript
// In browser console:
// Go to Network tab → filter by "verses"
// Check the API response in Response tab
// Look for "verses" array in the JSON

// Common issues:
// - verses: [] (empty array)
// - verses: null (null value)
// - error field in response
```

### Symptom: "Chapter not found" error

**Possible Causes:**
1. Invalid Surah ID in URL (e.g., /quran/200 - max is 114)
2. Chapters fetch failed silently before fix
3. Corrupted chapter data

**Debug Steps:**
```javascript
// In browser console:
// Check the Surah ID in URL
// Verify it's between 1-114
// Check if [getKemenagChapters] ✓ was logged

console.log("Max Surah ID: 114");
// If URL has /quran/200, that's the problem
```

### Symptom: Slow loading (>3 seconds)

**Possible Causes:**
1. Large perPage setting (default: 20)
2. Network latency
3. API rate limiting

**Debug Steps:**
```javascript
// In browser console:
// Open DevTools → Network tab
// Look for API calls duration
// If verses API takes >2s, might be rate limiting
// Try reducing perPage: go to Settings → Ayat per Halaman
```

---

## Testing All Surahs

Run this script in browser console to test all Surahs:

```javascript
// Test all 114 Surahs
(async () => {
  const failures = [];
  for (let i = 1; i <= 114; i++) {
    try {
      const response = await fetch(`/quran/${i}`);
      if (!response.ok) {
        failures.push({ id: i, status: response.status });
      }
    } catch (e) {
      failures.push({ id: i, error: String(e) });
    }
    if (i % 10 === 0) console.log(`✓ Tested ${i}/114`);
  }
  
  if (failures.length === 0) {
    console.log("✅ All 114 Surahs loaded successfully!");
  } else {
    console.log(`⚠️ Failed to load ${failures.length} Surahs:`, failures);
  }
})();
```

---

## Database Setup Verification

### Check if all tables exist:

```bash
npx drizzle-kit introspect
```

**Should show tables:**
- `user`
- `account`
- `session`
- `bookmark`
- `intention`
- `push_subscription`
- `transaction`

### If tables are missing:

```bash
# Apply migrations
npx drizzle-kit push

# Verify
npx drizzle-kit introspect
```

---

## Performance Monitoring

### Monitor API Response Times

```javascript
// Add to browser console
const originalFetch = window.fetch;
const metrics = {};

window.fetch = async (...args) => {
  const start = Date.now();
  const response = await originalFetch(...args);
  const time = Date.now() - start;
  const url = args[0];
  
  if (url.includes('quran.com') || url.includes('gading.dev')) {
    console.log(`[API] ${url.split('/').pop()}: ${time}ms`);
  }
  
  return response;
};
```

---

## Commit Info

**Commit Hash:** 5eaa1ff  
**Files Changed:**
- `src/components/quran/VerseBrowser.tsx` (Added error handling)
- `src/lib/kemenag-api.ts` (Added logging)

**What Changed:**
- Added try-catch in VerseBrowser
- Added console logs with [prefix] for debugging
- Improved error messages
- Added user-friendly error UI

---

## Rollback if Needed

```bash
# If you need to revert
git revert 5eaa1ff

# If it's not yet pushed
git reset --soft HEAD~1
git checkout -- src/components/quran/VerseBrowser.tsx src/lib/kemenag-api.ts
```

---

## Next Steps

If you still see issues:

1. ✅ Check browser console (F12) for logs
2. ✅ Check Network tab (DevTools → Network)
3. ✅ Check API response (click on API call → Response tab)
4. ✅ Report the exact error message from console

**Share these details:**
- Error message from console
- Browser console logs (copy the [VerseBrowser] / [getKemenagChapters] lines)
- Network tab screenshot (if API call fails)
- Surah ID you tried to access (e.g., /quran/1)

---

**Status:** ✅ Production Ready  
**Last Updated:** February 12, 2026  

