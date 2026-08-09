const axios = require("axios");

const BREETH_API_KEY = process.env.BREETH_API_KEY;

const BREETH_BASE_URL = "https://api.thebreeth.com/v1";


// ======================================================
// WRITE MEMORY
// ======================================================

async function writeMemory(content) {
    try {
        const response = await axios.post(
            `${BREETH_BASE_URL}/episodes`,
            {
                content: content,
                group_id: "default",
                extract_intent: true
            },
            {
                headers: {
                    Authorization: `Bearer ${BREETH_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Breeth Write Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Failed to write memory to Breeth."
        );
    }
}


// ======================================================
// SEARCH MEMORY
// ======================================================

async function searchMemory(query, limit = 5) {
    try {
        const response = await axios.post(
            `${BREETH_BASE_URL}/search`,
            {
                query: query,
                group_id: "default",
                limit: limit
            },
            {
                headers: {
                    Authorization: `Bearer ${BREETH_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Breeth Search Error:",
            error.response?.data || error.message
        );

        throw new Error(
            "Failed to search memory in Breeth."
        );
    }
}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    writeMemory,
    searchMemory
};
