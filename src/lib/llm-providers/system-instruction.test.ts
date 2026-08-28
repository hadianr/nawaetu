import { describe, expect, it } from 'vitest';
import { SYSTEM_INSTRUCTION } from './system-instruction';

describe('Tanya Nawaetu guardrail', () => {
    it('keeps programming outside the assistant scope', () => {
        expect(SYSTEM_INSTRUCTION).toMatch(/Jangan membuat, menampilkan, memperbaiki, atau menjelaskan kode/i);
        expect(SYSTEM_INSTRUCTION).toMatch(/pertanyaan tentang Islam dan fitur aplikasi Nawaetu/i);
    });

    it('requires source-grounded and unbiased religious answers', () => {
        expect(SYSTEM_INSTRUCTION).toMatch(/Al-Quran, Sunnah, hadits/i);
        expect(SYSTEM_INSTRUCTION).toMatch(/sarankan konsultasi ulama/i);
        expect(SYSTEM_INSTRUCTION).toMatch(/perbedaan pendapat ulama secara adil/i);
    });
});
