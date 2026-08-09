// ======================================================
// AI INTERVIEW SERVICE
// REAL BACKEND VERSION
// ======================================================

const { generateResponse } = require("./geminiService");

const {
    writeMemory,
    searchMemory
} = require("./breethService");

const {
    createSession,
    getSession,
    updateSession
} = require("../sessions/sessionStore");

const candidatesData =
    require("../data/candidates.json");

const curriculumData =
    require("../data/curriculum.json");


// ======================================================
// CONFIGURATION
// ======================================================

const MIN_QUESTIONS = 8;
const MIN_CURRICULUM_DAYS = 4;
const BREETH_MEMORY_LIMIT = 5;


// ======================================================
// CANDIDATE HELPERS
// ======================================================

function findCandidate(candidateId) {
    if (!candidateId) {
        return null;
    }

    const requestedId = String(candidateId).trim();

    // First: try the exact candidate/member ID
    let candidate = candidatesData.candidates.find(
        candidate =>
            String(candidate.member?.id || "").trim() === requestedId
    );

    if (candidate) {
        return candidate;
    }

    // Support numeric candidate IDs used by the frontend.
    // Current frontend candidate 101 corresponds to CAND-003.
    const frontendCandidateMap = {
        "101": "CAND-003"
    };

    const mappedId = frontendCandidateMap[requestedId];

    if (mappedId) {
        candidate = candidatesData.candidates.find(
            candidate =>
                String(candidate.member?.id || "").trim() === mappedId
        );

        if (candidate) {
            return candidate;
        }
    }

    // Also support IDs such as "CAND-003" directly.
    const normalizedId = requestedId.toUpperCase();

    candidate = candidatesData.candidates.find(
        candidate =>
            String(candidate.member?.id || "").trim().toUpperCase() === normalizedId
    );

    return candidate || null;
}

// ======================================================
// CURRICULUM HELPERS
// ======================================================

function getCurriculumDays() {

    if (Array.isArray(curriculumData)) {
        return curriculumData;
    }

    if (Array.isArray(curriculumData.curriculum)) {
        return curriculumData.curriculum;
    }

    if (Array.isArray(curriculumData.days)) {
        return curriculumData.days;
    }

    return [];
}


function getDayNumber(day) {

    if (!day) {
        return null;
    }

    return (
        day.day ||
        day.dayNumber ||
        day.id ||
        null
    );
}


function getDayContent(day) {

    if (!day) {
        return "";
    }

    return (
        day.topic ||
        day.title ||
        day.content ||
        day.description ||
        JSON.stringify(day)
    );
}


// ======================================================
// INTERVIEW CONTROL
// ======================================================

function canFinishInterview(session) {

    const questionCount =
        session.questionCount || 0;

    const askedDays =
        Array.isArray(session.askedDays)
            ? session.askedDays
            : [];

    return (
        questionCount >= MIN_QUESTIONS &&
        askedDays.length >= MIN_CURRICULUM_DAYS
    );
}


// ======================================================
// BREETH MEMORY SEARCH
// ======================================================

async function getRelevantMemory(
    session,
    currentTopic
) {

    try {

        const candidateId =
            session.candidate?.member?.id ||
            session.candidate?.id ||
            "Unknown candidate";


        const recentConversation =
            session.messages
                .slice(-4)
                .map(message => {
                    return `${message.role}: ${message.content}`;
                })
                .join("\n");


        const query = `
Technical interview memory for candidate ${candidateId}.

Current interview topic:
${currentTopic}

Recent interview conversation:
${recentConversation || "No previous conversation."}

Find relevant memories about:
- candidate technical knowledge
- previous answers
- strengths
- weaknesses
- knowledge gaps
- topics that need deeper questioning
- previous interview progress
`;


        const result =
            await searchMemory(
                query,
                BREETH_MEMORY_LIMIT
            );


        console.log(
            "Breeth memory retrieved."
        );


        return formatBreethMemory(result);

    } catch (error) {

        console.error(
            "Breeth memory search failed:",
            error.message
        );

        return "No previous Breeth memory available.";
    }
}


// ======================================================
// FORMAT BREETH MEMORY
// ======================================================

function formatBreethMemory(result) {

    if (!result) {
        return "No previous Breeth memory available.";
    }


    const data =
        result.data || result;


    const memoryParts = [];


    // --------------------------------------------------
    // Director profile
    // --------------------------------------------------

    if (data.director_profile) {

        memoryParts.push(
            `Profile:\n${JSON.stringify(
                data.director_profile,
                null,
                2
            )}`
        );
    }


    // --------------------------------------------------
    // Breeth edges
    // --------------------------------------------------

    if (Array.isArray(data.edges)) {

        data.edges.forEach(
            (edge, index) => {

                memoryParts.push(`
Memory ${index + 1}:

Fact:
${edge.fact || "N/A"}

Source:
${edge.source_node || "N/A"}

Target:
${edge.target_node || "N/A"}

Connected Context:
${edge.why_connected || "N/A"}

Cognitive Pattern:
${edge.cognitive_pattern || "N/A"}

Tier:
${edge._tier || "N/A"}
`);
            }
        );
    }


    // --------------------------------------------------
    // Other result structures
    // --------------------------------------------------

    if (Array.isArray(data.results)) {

        data.results.forEach(
            (item, index) => {

                memoryParts.push(`
Memory ${index + 1}:

${JSON.stringify(
    item,
    null,
    2
)}
`);
            }
        );
    }


    // --------------------------------------------------
    // Fallback
    // --------------------------------------------------

    if (memoryParts.length === 0) {

        return `
Breeth returned memory, but no structured edges were found.

Raw memory:
${JSON.stringify(
    data,
    null,
    2
)}
`;
    }


    return memoryParts.join("\n");
}


// ======================================================
// SAVE INTERVIEW MEMORY
// ======================================================

async function saveInterviewMemory(
    session,
    candidateAnswer
) {

    try {

        const assistantMessages =
            session.messages.filter(
                message =>
                    message.role === "assistant"
            );


        const lastQuestion =
            assistantMessages.length > 0
                ? assistantMessages[
                    assistantMessages.length - 1
                ].content
                : "Technical interview question";


        const candidateId =
            session.candidate?.member?.id ||
            session.candidate?.id ||
            "Unknown candidate";


        const memory = `
AI Interview Session Memory

Candidate ID:
${candidateId}

Interview Question:
${lastQuestion}

Candidate Answer:
${candidateAnswer}

Question Number:
${session.questionCount}

Curriculum Days Covered:
${JSON.stringify(
    session.askedDays || []
)}

Purpose:
This memory belongs to an ongoing technical interview.

Important information to remember:
- Candidate's technical understanding
- Candidate's reasoning ability
- Strengths demonstrated in the answer
- Weaknesses or knowledge gaps
- Topics that may require deeper questioning
- Overall interview progress
`;


        await writeMemory(memory);


        console.log(
            `Breeth memory saved for question ${session.questionCount}.`
        );

    } catch (error) {

        console.error(
            "Breeth memory save failed:",
            error.message
        );
    }
}


// ======================================================
// GENERATE INTERVIEW QUESTION
// ======================================================

async function generateInterviewQuestion(session) {

    const days =
        getCurriculumDays();


    if (days.length === 0) {

        throw new Error(
            "Curriculum data is empty."
        );
    }


    const questionNumber =
        (session.questionCount || 0) + 1;


    // --------------------------------------------------
    // Select curriculum day
    // --------------------------------------------------

    const dayIndex =
        Math.min(
            Math.floor(
                (questionNumber - 1) / 2
            ),
            days.length - 1
        );


    const currentDay =
        days[dayIndex];


    const dayNumber =
        getDayNumber(currentDay);


    const dayContent =
        getDayContent(currentDay);


    // --------------------------------------------------
    // Track curriculum days
    // --------------------------------------------------

    const askedDays =
        Array.isArray(session.askedDays)
            ? [...session.askedDays]
            : [];


    if (
        dayNumber !== null &&
        !askedDays.includes(dayNumber)
    ) {

        askedDays.push(dayNumber);
    }


    updateSession(
        session.sessionId,
        {
            askedDays
        }
    );


    // --------------------------------------------------
    // Previous conversation
    // --------------------------------------------------

    const previousMessages =
        session.messages
            .slice(-6)
            .map(message => {
                return `${message.role}: ${message.content}`;
            })
            .join("\n");


    // --------------------------------------------------
    // Breeth memory
    // --------------------------------------------------

    const breethMemory =
        await getRelevantMemory(
            session,
            dayContent
        );


    // --------------------------------------------------
    // Gemini prompt
    // --------------------------------------------------

    const prompt = `
You are an expert technical interviewer conducting
a structured AI engineering interview.

Interview question number:
${questionNumber}

Curriculum day:
${dayNumber}

Curriculum topic:
${dayContent}


==================================================
CANDIDATE PROFILE
==================================================

${JSON.stringify(
    session.candidate,
    null,
    2
)}


==================================================
RECENT INTERVIEW CONVERSATION
==================================================

${previousMessages || "No previous conversation."}


==================================================
RELEVANT BREETH MEMORY
==================================================

${breethMemory}


==================================================
INTERVIEW INSTRUCTIONS
==================================================

1. Ask exactly ONE technical interview question.

2. Keep the question related to the current
   curriculum topic.

3. Use relevant Breeth memory when deciding
   what to ask next.

4. If the candidate previously demonstrated
   strong knowledge, ask a deeper question.

5. If the candidate previously struggled,
   ask a simpler diagnostic question.

6. If Breeth memory shows a knowledge gap,
   investigate that gap naturally.

7. Do not repeat questions that have already
   been asked.

8. Increase difficulty gradually.

9. Do not provide the answer.

10. Do not ask multiple questions at once.

11. Do not evaluate the candidate.

12. Do not generate a candidate review.

13. Do not generate scores.

14. Do not mention the final interview evaluation.

15. Return ONLY ONE interview question.

The response must be only the question text.
`;


    // --------------------------------------------------
    // Gemini
    // --------------------------------------------------

    const question =
        await generateResponse(prompt);


    const cleanQuestion =
        String(question)
            .replace(
                /^["']|["']$/g,
                ""
            )
            .trim();


    if (!cleanQuestion) {

        throw new Error(
            "AI returned an empty interview question."
        );
    }


    // --------------------------------------------------
    // Save question
    // --------------------------------------------------

    session.questionCount =
        questionNumber;


    session.messages.push({
        role: "assistant",
        content: cleanQuestion
    });


    updateSession(
        session.sessionId,
        {
            messages:
                session.messages,

            questionCount:
                session.questionCount,

            askedDays
        }
    );


    return cleanQuestion;
}


// ======================================================
// START INTERVIEW
// ======================================================

async function startInterview(
    sessionId,
    candidateInput
) {

    const candidateId =
        candidateInput?.member?.id ||
        candidateInput?.id;


    if (!candidateId) {

        throw new Error(
            "Candidate member.id is required."
        );
    }


    const candidate =
        findCandidate(candidateId);


    if (!candidate) {

        throw new Error(
            `Candidate not found: ${candidateId}`
        );
    }


    let session =
        getSession(sessionId);


    if (!session) {

        session =
            createSession(
                sessionId,
                candidate
            );
    }


    // --------------------------------------------------
    // Prevent restarting completed session
    // --------------------------------------------------

    if (session.done) {

        return {

            reply:
                "This interview has already been completed.",

            done:
                true,

            sessionId:
                session.sessionId,

            questionCount:
                session.questionCount
        };
    }


    // --------------------------------------------------
    // Generate first question
    // --------------------------------------------------

    const question =
        await generateInterviewQuestion(
            session
        );


    return {

        reply:
            question,

        done:
            false,

        sessionId:
            session.sessionId,

        questionCount:
            session.questionCount,

        askedDays:
            session.askedDays || []
    };
}


// ======================================================
// CONTINUE INTERVIEW
// ======================================================

async function continueInterview(
    sessionId,
    message
) {

    const session =
        getSession(sessionId);


    if (!session) {

        throw new Error(
            `Interview session not found: ${sessionId}`
        );
    }


    // --------------------------------------------------
    // Already completed
    // --------------------------------------------------

    if (session.done) {

        return {

            reply:
                "This interview has already been completed.",

            done:
                true,

            sessionId:
                sessionId
        };
    }


    // --------------------------------------------------
    // Validate answer
    // --------------------------------------------------

    if (
        !message ||
        !message.trim()
    ) {

        throw new Error(
            "Candidate answer cannot be empty."
        );
    }


    const candidateAnswer =
        message.trim();


    // --------------------------------------------------
    // Save candidate answer
    // --------------------------------------------------

    session.messages.push({

        role:
            "candidate",

        content:
            candidateAnswer
    });


    updateSession(
        sessionId,
        {
            messages:
                session.messages
        }
    );


    // --------------------------------------------------
    // Save Breeth memory in background
    // --------------------------------------------------

    saveInterviewMemory(
        session,
        candidateAnswer
    ).catch(error => {

        console.error(
            "Background Breeth memory save failed:",
            error.message
        );
    });


    // --------------------------------------------------
    // Check completion
    // --------------------------------------------------

    if (
        canFinishInterview(session)
    ) {

        return await finishInterview(
            session
        );
    }


    // --------------------------------------------------
    // Generate next question
    // --------------------------------------------------

    const nextQuestion =
        await generateInterviewQuestion(
            session
        );


    return {

        reply:
            nextQuestion,

        done:
            false,

        sessionId:
            session.sessionId,

        questionCount:
            session.questionCount,

        askedDays:
            session.askedDays || []
    };
}


// ======================================================
// FINISH INTERVIEW
// ======================================================

async function finishInterview(session) {

    // --------------------------------------------------
    // Build interview conversation
    // --------------------------------------------------

    const conversation =
        session.messages
            .filter(
                message =>
                    message.role === "assistant" ||
                    message.role === "candidate"
            )
            .map(message => {
                return `${message.role}: ${message.content}`;
            })
            .join("\n");


    // --------------------------------------------------
    // STRUCTURED GEMINI EVALUATION
    // --------------------------------------------------

    const evaluationPrompt = `
You are an expert technical interviewer.

Evaluate this completed technical interview.

IMPORTANT:

- Evaluate ONLY the candidate's actual answers.
- Do NOT invent skills or achievements.
- Do NOT use candidate information that was not demonstrated.
- Do NOT generate another interview question.
- Do NOT write the evaluation as a conversational reply.
- Return ONLY valid JSON.
- All scores must be numbers from 0 to 100.

Completed interview:

${conversation}


==================================================
RETURN EXACTLY THIS JSON STRUCTURE
==================================================

{
  "overallScore": 0,
  "technicalKnowledge": 0,
  "problemSolving": 0,
  "communication": 0,
  "confidence": 0,
  "accuracy": 0,
  "performanceLabel": "Good Performance",
  "performanceSubtext": "Short explanation of the overall performance.",
  "evaluation": "Concise overall evaluation.",
  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "weaknesses": [
    "Weakness 1",
    "Weakness 2",
    "Weakness 3"
  ],
  "improvements": [
    "Improvement 1",
    "Improvement 2",
    "Improvement 3"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
}


==================================================
SCORING RULES
==================================================

overallScore:
Overall interview performance.

technicalKnowledge:
Understanding of technical concepts.

problemSolving:
Reasoning and ability to approach technical problems.

communication:
Clarity and completeness of answers.

confidence:
Confidence demonstrated through answers.

accuracy:
Correctness and relevance of technical answers.

All scores must be integers between 0 and 100.

performanceLabel must be one of:

"Poor"
"Needs Improvement"
"Average"
"Good"
"Excellent"


==================================================
CONTENT RULES
==================================================

strengths:
Only include strengths actually demonstrated.

weaknesses:
Include actual knowledge gaps demonstrated
during the interview.

improvements:
Give practical areas the candidate should study.

recommendations:
Give practical next steps.

Keep all arrays concise.

Do not include the evaluation inside
the interview conversation.

This JSON is ONLY for the final result page.

Do not use markdown.
Do not use code fences.
Return JSON only.
`;


    // --------------------------------------------------
    // Generate evaluation
    // --------------------------------------------------

    let aiText =
        await generateResponse(
            evaluationPrompt
        );


    // --------------------------------------------------
    // Clean Gemini response
    // --------------------------------------------------

    aiText =
        String(aiText)
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();


    let evaluationData;


    // --------------------------------------------------
    // Parse JSON
    // --------------------------------------------------

    try {

        evaluationData =
            JSON.parse(aiText);

    } catch (error) {

        console.error(
            "Failed to parse AI evaluation JSON:",
            error
        );


        evaluationData = {

            overallScore:
                null,

            technicalKnowledge:
                null,

            problemSolving:
                null,

            communication:
                null,

            confidence:
                null,

            accuracy:
                null,

            performanceLabel:
                "Evaluation Available",

            performanceSubtext:
                "The interview was completed, but structured scoring could not be generated.",

            evaluation:
                aiText ||
                "Evaluation unavailable.",

            strengths:
                [],

            weaknesses:
                [],

            improvements:
                [],

            recommendations:
                []
        };
    }


    // --------------------------------------------------
    // Normalize scores
    // --------------------------------------------------

    function normalizeScore(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return null;
        }


        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {
            return null;
        }


        return Math.max(
            0,
            Math.min(
                100,
                Math.round(number)
            )
        );
    }


    evaluationData.overallScore =
        normalizeScore(
            evaluationData.overallScore
        );


    evaluationData.technicalKnowledge =
        normalizeScore(
            evaluationData.technicalKnowledge
        );


    evaluationData.problemSolving =
        normalizeScore(
            evaluationData.problemSolving
        );


    evaluationData.communication =
        normalizeScore(
            evaluationData.communication
        );


    evaluationData.confidence =
        normalizeScore(
            evaluationData.confidence
        );


    evaluationData.accuracy =
        normalizeScore(
            evaluationData.accuracy
        );


    // --------------------------------------------------
    // Normalize arrays
    // --------------------------------------------------

    evaluationData.strengths =
        Array.isArray(
            evaluationData.strengths
        )
            ? evaluationData.strengths
            : [];


    evaluationData.weaknesses =
        Array.isArray(
            evaluationData.weaknesses
        )
            ? evaluationData.weaknesses
            : [];


    evaluationData.improvements =
        Array.isArray(
            evaluationData.improvements
        )
            ? evaluationData.improvements
            : [];


    evaluationData.recommendations =
        Array.isArray(
            evaluationData.recommendations
        )
            ? evaluationData.recommendations
            : [];


    // --------------------------------------------------
    // Save REAL result
    // --------------------------------------------------

    session.result = {

        overallScore:
            evaluationData.overallScore,

        technicalKnowledge:
            evaluationData.technicalKnowledge,

        problemSolving:
            evaluationData.problemSolving,

        communication:
            evaluationData.communication,

        confidence:
            evaluationData.confidence,

        accuracy:
            evaluationData.accuracy,

        performanceLabel:
            evaluationData.performanceLabel ||
            "Evaluation Complete",

        performanceSubtext:
            evaluationData.performanceSubtext ||
            "",

        evaluation:
            evaluationData.evaluation ||
            "Interview completed successfully.",

        strengths:
            evaluationData.strengths,

        weaknesses:
            evaluationData.weaknesses,

        improvements:
            evaluationData.improvements,

        recommendations:
            evaluationData.recommendations
    };


    session.done =
        true;


    session.finishedAt =
        new Date().toISOString();


    // --------------------------------------------------
    // IMPORTANT
    //
    // Do NOT add evaluation to session.messages.
    // It must remain separate from interview questions.
    // --------------------------------------------------

    updateSession(
        session.sessionId,
        {

            messages:
                session.messages,

            done:
                true,

            finishedAt:
                session.finishedAt,

            result:
                session.result
        }
    );


    // --------------------------------------------------
    // Save final result to Breeth
    // --------------------------------------------------

    try {

        const candidateId =
            session.candidate?.member?.id ||
            session.candidate?.id ||
            "Unknown candidate";


        await writeMemory(`
Completed AI Interview

Candidate:
${candidateId}

Questions Asked:
${session.questionCount}

Curriculum Days Covered:
${JSON.stringify(
    session.askedDays || []
)}

Overall Score:
${session.result.overallScore}

Performance:
${session.result.performanceLabel}

Technical Knowledge:
${session.result.technicalKnowledge}

Problem Solving:
${session.result.problemSolving}

Communication:
${session.result.communication}

Confidence:
${session.result.confidence}

Accuracy:
${session.result.accuracy}

Strengths:
${JSON.stringify(
    session.result.strengths
)}

Weaknesses:
${JSON.stringify(
    session.result.weaknesses
)}

Improvements:
${JSON.stringify(
    session.result.improvements
)}

Recommendations:
${JSON.stringify(
    session.result.recommendations
)}
`);


        console.log(
            "Final interview evaluation saved to Breeth."
        );

    } catch (error) {

        console.error(
            "Failed to save final evaluation to Breeth:",
            error.message
        );
    }


    // --------------------------------------------------
    // Return ONLY completion status
    //
    // Do NOT return the evaluation as reply.
    // Otherwise frontend may display it as Question 9.
    // --------------------------------------------------

    return {

        reply:
            "Interview completed. Your results are ready.",

        done:
            true,

        sessionId:
            session.sessionId,

        questionCount:
            session.questionCount,

        askedDays:
            session.askedDays || []
    };
}


// ======================================================
// MAIN REQUEST HANDLER
// ======================================================

async function processInterviewRequest(data) {

    const {
        sessionId,
        candidate,
        message
    } = data;


    if (!sessionId) {

        throw new Error(
            "sessionId is required."
        );
    }


    // --------------------------------------------------
    // Start interview
    // --------------------------------------------------

    if (
        candidate &&
        !message
    ) {

        return await startInterview(
            sessionId,
            candidate
        );
    }


    // --------------------------------------------------
    // Candidate answer
    // --------------------------------------------------

    if (message) {

        return await continueInterview(
            sessionId,
            message
        );
    }


    throw new Error(
        "Request must contain either candidate or message."
    );
}


// ======================================================
// GET INTERVIEW RESULT
// ======================================================

function getInterviewResult(sessionId) {

    const session =
        getSession(sessionId);


    if (!session) {

        throw new Error(
            `Interview session not found: ${sessionId}`
        );
    }


    if (!session.done) {

        throw new Error(
            "Interview is not completed yet."
        );
    }


    // --------------------------------------------------
    // Build question / answer pairs
    // --------------------------------------------------

    const questionAnswers = [];

    let currentQuestion = null;


    session.messages.forEach(
        message => {

            // ------------------------------------------
            // Ignore system messages
            // ------------------------------------------

            if (
                message.role === "system"
            ) {
                return;
            }


            // ------------------------------------------
            // Interviewer question
            // ------------------------------------------

            if (
                message.role === "assistant"
            ) {

                currentQuestion =
                    message.content;

                return;
            }


            // ------------------------------------------
            // Candidate answer
            // ------------------------------------------

            if (
                message.role === "candidate" &&
                currentQuestion
            ) {

                questionAnswers.push({

                    question:
                        currentQuestion,

                    answer:
                        message.content
                });


                currentQuestion =
                    null;
            }
        }
    );


    // --------------------------------------------------
    // Real result
    // --------------------------------------------------

    const result =
        session.result || {};


    return {

        sessionId:
            session.sessionId,

        candidate:
            session.candidate,

        questionCount:
            session.questionCount,

        askedDays:
            session.askedDays || [],

        startedAt:
            session.startedAt,

        finishedAt:
            session.finishedAt,

        questions:
            questionAnswers,


        // ----------------------------------------------
        // REAL SCORES
        // ----------------------------------------------

        overallScore:
            result.overallScore ?? null,

        technicalKnowledge:
            result.technicalKnowledge ?? null,

        problemSolving:
            result.problemSolving ?? null,

        communication:
            result.communication ?? null,

        confidence:
            result.confidence ?? null,

        accuracy:
            result.accuracy ?? null,


        // ----------------------------------------------
        // PERFORMANCE
        // ----------------------------------------------

        performanceLabel:
            result.performanceLabel ||
            "Evaluation Complete",

        performanceSubtext:
            result.performanceSubtext ||
            "",


        // ----------------------------------------------
        // AI EVALUATION
        // ----------------------------------------------

        evaluation:
            result.evaluation ||
            "",


        // ----------------------------------------------
        // FEEDBACK
        // ----------------------------------------------

        strengths:
            Array.isArray(result.strengths)
                ? result.strengths
                : [],

        weaknesses:
            Array.isArray(result.weaknesses)
                ? result.weaknesses
                : [],

        improvements:
            Array.isArray(result.improvements)
                ? result.improvements
                : [],

        recommendations:
            Array.isArray(result.recommendations)
                ? result.recommendations
                : []
    };
}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    processInterviewRequest,

    startInterview,

    continueInterview,

    getInterviewResult
};