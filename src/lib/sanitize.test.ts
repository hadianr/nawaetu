import { describe, it, expect } from 'vitest';
import { cleanTajweedText } from './sanitize';

describe('cleanTajweedText', () => {
    it('should allow safe tajweed HTML', () => {
        const input = '<tajweed class="ghunnah">بِسْمِ</tajweed> <span class="waqf">۞</span>';
        // Note: DOMPurify might reorder attributes or change spacing, but for this simple case it should match.
        // Actually, DOMPurify might not change anything if it's already clean.
        expect(cleanTajweedText(input)).toBe(input);
    });

    it('should remove malicious scripts', () => {
        const input = '<script>alert(1)</script><tajweed>Safe</tajweed>';
        const expected = '<tajweed>Safe</tajweed>';
        expect(cleanTajweedText(input)).toBe(expected);
    });

    it('should remove disallowed tags like img', () => {
        const input = '<img src=x onerror=alert(1) />';
        expect(cleanTajweedText(input)).toBe('');
    });

    it('should remove event handlers even if tag is allowed (though span is allowed)', () => {
        const input = '<span onclick="alert(1)">Safe</span>';
        // 'onclick' is not in ALLOWED_ATTR (only 'class' is).
        const expected = '<span>Safe</span>';
        expect(cleanTajweedText(input)).toBe(expected);
    });

    it('should remove verse numbers at the end (regex logic)', () => {
        const input = 'Some text <span class="end">١٢٣</span>';
        expect(cleanTajweedText(input)).toBe('Some text');
    });

    it('should preserve waqf marks', () => {
         const input = 'Some text <waqf>۞</waqf>';
         expect(cleanTajweedText(input)).toBe('Some text <waqf>۞</waqf>');
    });

    it('should preserve span with waqf class if used that way', () => {
         // Assuming waqf can be a span class too based on tajweedStyles
         // .waqf { color: ... }
         const input = 'Some text <span class="waqf">۞</span>';
         expect(cleanTajweedText(input)).toBe('Some text <span class="waqf">۞</span>');
    });
});
