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
