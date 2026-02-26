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

// Utility to parse AI response and extract follow-up questions

export interface ParsedResponse {
    mainMessage: string;
    followUpQuestions: string[];
}

/**
 * Parse AI response to separate main message and follow-up questions
 */
export function parseAIResponse(response: string): ParsedResponse {
    // Split by follow-up marker
    const lines = response.split('\n');
    const mainLines: string[] = [];
    const followUpQuestions: string[] = [];

    let inFollowUpSection = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Check if this is a follow-up question
        if (trimmed.startsWith('🔹')) {
            inFollowUpSection = true;
            const question = trimmed.replace(/^🔹\s*/, '').trim();
            if (question) {
                followUpQuestions.push(question);
            }
        } else if (trimmed.startsWith('🔸') || trimmed.startsWith('•') || trimmed.startsWith('-') && inFollowUpSection) {
            // Alternative markers
            const question = trimmed.replace(/^[🔸•-]\s*/, '').trim();
            if (question) {
                followUpQuestions.push(question);
            }
        } else {
            // Main message content
            if (!inFollowUpSection && trimmed) {
                mainLines.push(line);
            }
        }
    }

    return {
        mainMessage: mainLines.join('\n').trim(),
        followUpQuestions
    };
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Format text with simple markdown-like formatting
 * Converts **bold** and *italic* to HTML
 */
export function formatMarkdown(text: string): string {
    // Escape HTML first to prevent XSS
    const sanitizedText = escapeHtml(text);

    let formatted = sanitizedText;

    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Preserve line breaks
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
}
