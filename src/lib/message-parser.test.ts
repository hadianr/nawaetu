// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { formatMarkdown } from './message-parser';

describe('formatMarkdown', () => {
    it('should format bold text correctly', () => {
        const input = 'This is **bold** text';
        const expected = 'This is <strong>bold</strong> text';
        const actual = formatMarkdown(input);
        expect(actual).toBe(expected);
    });

    it('should format italic text correctly', () => {
        const input = 'This is *italic* text';
        const expected = 'This is <em>italic</em> text';
        const actual = formatMarkdown(input);
        expect(actual).toBe(expected);
    });

    it('should convert newlines to <br/>', () => {
        const input = 'Line 1\nLine 2';
        const expected = 'Line 1<br/>Line 2';
        const actual = formatMarkdown(input);
        expect(actual).toBe(expected);
    });

    it('should sanitize malicious HTML (XSS)', () => {
        const input = 'Hello <script>alert("xss")</script> World';
        const actual = formatMarkdown(input);
        // We expect the script tag to be escaped, not executed
        expect(actual).not.toContain('<script>');
        expect(actual).toContain('&lt;script&gt;');
        expect(actual).toContain('Hello');
        expect(actual).toContain('World');
    });

    it('should sanitize attributes like onmouseover', () => {
        const input = 'Hover <b onmouseover="alert(1)">me</b>';
        const actual = formatMarkdown(input);
        // Attributes should be escaped
        expect(actual).not.toContain('<b onmouseover');
        expect(actual).toContain('&lt;b onmouseover=&quot;alert(1)&quot;&gt;');
        expect(actual).toContain('me');
    });
});
