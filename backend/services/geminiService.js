
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// --------------------------------------------------
// Generate Gemini response
// --------------------------------------------------

async function generateResponse(prompt) {

    const maxRetries = 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {

        try {

            console.log(
                `Gemini request attempt ${attempt + 1}/${maxRetries + 1}`
            );

            const response =
                await ai.models.generateContent({

                    // Stable Flash model
                    model: "gemini-3.5-flash-lite",

                    contents: prompt,

                    config: {
                        
                        maxOutputTokens: 1500
                    }
                });


            const text =
                response?.text;


            if (!text) {

                throw new Error(
                    "Gemini returned an empty response."
                );
            }


            console.log(
                "Gemini response received successfully."
            );


            return text;


        } catch (error) {

            console.error(
                "========== GEMINI ERROR =========="
            );

            console.error(error);

            console.error(
                "=================================="
            );


            const status =
                error?.status ||
                error?.code;


            const message =
                String(
                    error?.message ||
                    error
                );


            const isRateLimit =
                status === 429 ||
                message.includes("429") ||
                message.includes("RESOURCE_EXHAUSTED") ||
                message.includes("quota");


            // ------------------------------------------
            // Don't retry non-rate-limit errors
            // ------------------------------------------

            if (!isRateLimit) {

                throw error;
            }


            // ------------------------------------------
            // Last attempt
            // ------------------------------------------

            if (attempt === maxRetries) {

                throw new Error(
                    "Gemini API quota/rate limit exceeded. " +
                    "Please wait and try again."
                );
            }


            // ------------------------------------------
            // Exponential backoff
            // 2s → 4s → 8s
            // ------------------------------------------

            const delay =
                Math.pow(2, attempt + 1) * 1000;

            console.log(
                `Gemini rate limit reached. Retrying in ${delay / 1000}s...`
            );


            await new Promise(
                resolve =>
                    setTimeout(resolve, delay)
            );
        }
    }
}


// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports = {
    generateResponse
};