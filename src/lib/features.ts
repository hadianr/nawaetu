/**
 * Switches for features that are built but not shown yet. Flip a value to bring the feature back; the code,
 * its sync and its server routes stay in place while it is off.
 */

/**
 * The Ramadan hub (/ramadhan). Off until the month: the page answers 404, leaves the sitemap and llms.txt,
 * and the seasonal bottom-navigation tab falls back to the normal one so it never points at a missing page.
 */
export const RAMADHAN_PAGE_ENABLED = false;
