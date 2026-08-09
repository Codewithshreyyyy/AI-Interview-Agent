// Main backend server

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { generateResponse } = require("./services/geminiService");
const { writeMemory } = require("./services/breethService");

const app = express();
const PORT = process.env.PORT || 5001;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// SERVE BACKEND DATA FILES
// =====================================================

// This makes these files publicly accessible:
//
// /data/candidates.json
// /data/curriculum.json
//
// They are stored inside:
//
// backend/data/

app.use(
    "/data",
    express.static(path.join(__dirname, "data"))
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Interview Agent backend is running."
    });
});

// =====================================================
// GEMINI TEST ENDPOINT
// =====================================================

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

// =====================================================
// BREETH TEST ENDPOINT
// =====================================================

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

// =====================================================
// BREETH SEARCH TEST ENDPOINT
// =====================================================

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

// =====================================================
// MAIN AI INTERVIEW ENDPOINT
// =====================================================

app.use(
    "/api/interview",
    require("./routes/interviewRoutes")
);

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );

    console.log(
        `Data directory: ${path.join(__dirname, "data")}`
    );
});