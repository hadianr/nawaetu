/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import DOMPurify from 'isomorphic-dompurify';

export const cleanTajweedText = (htmlText: string) => {
    if (!htmlText) return '';

    // Sanitize HTML
    // We allow 'span' for verse markers, 'tajweed' for tajweed rules, and 'waqf' for pause marks.
    // We allow 'class' attribute for styling.
    const sanitized = DOMPurify.sanitize(htmlText, {
        ALLOWED_TAGS: ['span', 'tajweed', 'waqf'],
        ALLOWED_ATTR: ['class']
    });

    let cleaned = sanitized;

    // Remove verse number spans at the end only
    // Do NOT remove waqof marks - preserve all Arabic characters and diacritics
    cleaned = cleaned.replace(/<span\s+class="end"[^>]*>[\u0660-\u0669\s]+<\/span>\s*$/u, '');
    cleaned = cleaned.replace(/<span[^>]*class="end"[^>]*>[\u0660-\u0669\s]+<\/span>\s*$/u, '');

    // Remove only trailing verse numbers (1-3 digits)
    cleaned = cleaned.replace(/[\u0660-\u0669]{1,3}\s*$/u, '');

    return cleaned.trim();
};
