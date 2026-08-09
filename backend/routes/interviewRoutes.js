const express = require("express");

const {
    processInterviewRequest,
    getInterviewResult
} = require("../services/interviewService");

const router = express.Router();


// ======================================================
// MAIN INTERVIEW ENDPOINT
// ======================================================

router.post("/", async (req, res) => {

    try {

        const result =
            await processInterviewRequest(req.body);

        res.json(result);

    } catch (error) {

        console.error(
            "Interview API Error:",
            error
        );

        res.status(400).json({
            error: error.message
        });
    }
});


// ======================================================
// INTERVIEW RESULT ENDPOINT
// ======================================================

router.get("/result/:sessionId", (req, res) => {

    try {

        const result =
            getInterviewResult(
                req.params.sessionId
            );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "Interview Result API Error:",
            error
        );

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});


module.exports = router;