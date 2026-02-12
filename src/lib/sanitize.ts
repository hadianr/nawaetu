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
