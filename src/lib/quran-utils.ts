export const toArabicNumber = (n: number) => n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

export const formatFootnotes = (htmlText: string) => {
    if (!htmlText) return '';
    let formatted = htmlText;
    // Convert inline footnote numbers to superscript (e.g., contracts.1 -> contracts.<sup>1</sup>)
    formatted = formatted
        .replace(/([\.,;:!?\]])\s*(\d{1,2})(?=\s|$)/g, '$1<sup>$2</sup>')
        .replace(/\s(\d{1,2})(?=\s|$)/g, ' <sup>$1</sup>');
    return formatted;
};

export const cleanTranslation = (text: string) => {
    if (!text) return '';
    let cleaned = text;
    // Remove stray leading "0" or "O" from some translations
    cleaned = cleaned.replace(/^\s*[0O]\s+/, '').replace(/^\s*[0O]\./, '');
    // Remove trailing isolated verse numbers only
    cleaned = cleaned.replace(/\s*[\(\[]?\d{1,3}[\)\]]?\s*$/g, '');
    return formatFootnotes(cleaned.trim());
};

export const cleanIndopakText = (text: string) => {
    if (!text) return '';
    return text
        .replace(/[\uE000-\uF8FF]/g, '') // Remove PUA characters
        .replace(/\u2002/g, ' ') // Replace EN SPACE with standard space
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
};

export const getVerseFontClass = (script: string, size: string) => {
    if (script === 'indopak') {
        const base = 'font-lateef tracking-wide';
        // Lateef requires significantly larger sizes to match Amiri's visual weight
        if (size === 'large') return `${base} text-6xl leading-[2.6]`;
        if (size === 'small') return `${base} text-4xl leading-[2.3]`;
        return `${base} text-5xl leading-[2.4]`; // Medium
    }
    // Tajweed (Amiri)
    const base = 'font-amiri';
    if (size === 'large') return `${base} text-4xl leading-[2.5]`;
    if (size === 'small') return `${base} text-2xl leading-[2.2]`;
    return `${base} text-3xl leading-[2.3]`; // Medium
};
