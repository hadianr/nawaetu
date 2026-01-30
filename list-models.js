const { GoogleGenerativeAI } = require("@google/generative-ai");

// Manually pass key since we might not have dotenv set up for this standalone script, 
// or simpler: just read from process.env if I run with inline env var.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Please provide GEMINI_API_KEY env var");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Unfortunately standard SDK doesn't always expose listModels directly on the client instance in some versions?
        // Let's try getting a specific model first to see if it works, or check list if available.
        // Actually, for @google/generative-ai, listModels is not on the main class usually, but let's try to access it if possible or just test specific known models.

        // Alternative: Use fetch directly for listModels to be sure.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
