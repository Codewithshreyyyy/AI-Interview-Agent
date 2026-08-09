// Main backend server

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { generateResponse } = require("./services/geminiService");
const { writeMemory } = require("./services/breethService");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Interview Agent backend is running."
    });
});

// Gemini test endpoint
app.get("/api/test-gemini", async (req, res) => {
    try {
        const response = await generateResponse(
            "You are a technical interviewer. Ask me one simple question about Retrieval-Augmented Generation (RAG)."
        );

        res.json({
            success: true,
            response: response
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Breeth test endpoint
app.get("/api/test-breeth", async (req, res) => {
    try {
        const result = await writeMemory(
            "AI Interview Agent test memory. Candidate demonstrated understanding of Retrieval-Augmented Generation and vector embeddings."
        );

        res.json({
            success: true,
            message: "Breeth connection is working.",
            result: result
        });

    } catch (error) {
        console.error("Breeth Test Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Breeth search test endpoint
app.get("/api/test-breeth-search", async (req, res) => {
    try {
        const { searchMemory } = require("./services/breethService");

        const result = await searchMemory(
            "What does the candidate know about RAG and vector embeddings?",
            5
        );

        res.json({
            success: true,
            message: "Breeth search is working.",
            data: result
        });

    } catch (error) {
        console.error(
            "Breeth Search Test Error:",
            error
        );

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Main AI Interview endpoint
app.use(
    "/api/interview",
    require("./routes/interviewRoutes")
);

// Start server
app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});