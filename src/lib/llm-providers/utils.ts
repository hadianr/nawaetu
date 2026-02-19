/**
 * Sanitizes user context strings to prevent prompt injection.
 * Removes control characters and brackets used in prompt templates.
 * Truncates length to prevent excessive token usage.
 *
 * @param input The raw user input string (e.g., name)
 * @returns The sanitized string safe for LLM context injection
 */
export function sanitizeUserContext(input: string): string {
    if (!input || typeof input !== 'string') {
        return "Hamba Allah";
    }

    // 1. Remove control characters (ASCII 0-31 and 127-159)
    // 2. Remove [ and ] which are used as delimiters in the prompt template
    // 3. Trim whitespace
    const sanitized = input
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/[\[\]]/g, "")
        .trim();

    // 4. Limit length to 50 characters (reasonable for a name)
    return sanitized.slice(0, 50);
}
