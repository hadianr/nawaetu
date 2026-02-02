"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

export interface DetailedError {
    part: string;      // The part of the verse where the error occurred
    issue: string;     // What was wrong (e.g. "Harakat salah", "Kurang panjang")
    correct: string;   // How it should be read
    rule?: string;     // Tajweed rule if applicable
}

export interface MurojaahResponse {
    correct: boolean;
    feedback: string;
    correction?: string;
    details?: DetailedError[];
}

export async function verifyRecitation(
    audioBase64: string,
    verseText: string,
    verseKey: string
): Promise<MurojaahResponse> {
    if (!apiKey) {
        console.error("Server Action: GOOGLE_API_KEY is missing");
        return {
            correct: false,
            feedback: "Sistem belum dikonfigurasi (API Key hilang). Harap hubungi developer.",
            correction: undefined
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // User requested this specific model name
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Clean Base64 header if present (e.g., "data:audio/webm;base64,...")
        const audioData = audioBase64.replace(/^data:audio\/\w+;base64,/, "");

        const prompt = `
        You are a supportive and professional Quran Teacher (Ustadz). 
        Listen carefully to the user's audio recitation.
        
        Target Verse: "${verseText}" (Verse Key: ${verseKey})

        Evaluation Rules:
        1. **Strictly Word-for-Word**: If the user says all the words in the correct order, mark "correct": true.
        2. **Tolerance**: Be tolerant of background noise, slight hesitations, or non-perfect pronunciation (minor Tajweed errors). 
        3. **Major Errors**: Only mark "correct": false if they miss a word, change a word significantly, skip a line, or recite the wrong verse entirely.
        4. **Feedback**: If "correct" is true but they have minor tajweed notes (e.g. "ikhfa kurang panjang"), mention it in "feedback" but KEEP "correct": true.
        5. **Detailed Breakdown**: For EVERY mistake or improvement, provide a structured entry in "details". This is critical for the user to learn.

        Return JSON format:
        {
            "correct": boolean, 
            "feedback": "Pesan semangat dan ringkasan unum (Bahasa Indonesia).",
            "correction": "Teks ayat lengkap yang benar (untuk ditampilkan sebagai referensi)",
            "details": [
                {
                    "part": "Potongan teks Arab yang salah",
                    "issue": "Penjelasan salahnya apa (misal: Kurang panjang 2 harakat, Huruf 'Ain dibaca Hamzah)",
                    "correct": "Cara baca yang benar (Transliterasi atau penjelasan)",
                    "rule": "Nama Hukum Tajwid (misal: Mad Jaiz Munfasil, Idgham Bighunnah) jika relevan"
                }
            ]
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "audio/webm", // Assuming recording is valid webm/mp4
                    data: audioData
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        try {
            return JSON.parse(text) as MurojaahResponse;
        } catch (e) {
            console.error("JSON Parse Error:", text);
            return {
                correct: false,
                feedback: "Maaf, Ustadz AI sedang bingung. Coba ulangi lagi ya.",
                correction: undefined
            };
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            correct: false,
            feedback: "Terjadi kesalahan sistem saat menghubungi Ustadz AI.",
            correction: undefined
        };
    }
}
