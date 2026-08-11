/* ============================================================
   PAGE 4 — INTERVIEW ROOM
   REAL BACKEND CONNECTED VERSION
============================================================ */

"use strict";

const $ = (id) => document.getElementById(id);

const TOTAL_QUESTIONS = 8;
const API_BASE_URL = "https://ai-interview-agent-un2c.onrender.com";

let backendSessionId = null;
let backendReady = false;

let config = null;
let questions = [];
let currentQuestion = 0;
let answered = false;
let interviewStartedAt = Date.now();
let answers = [];

/* ============================================================
   FALLBACK QUESTIONS
============================================================ */

const fallbackQuestions = [
    {
        topic: "Core Concepts",
        difficulty: "Medium",
        question:
            "Explain one important technical concept from your recent learning and describe where it is used in a real application."
    },
    {
        topic: "Problem Solving",
        difficulty: "Medium",
        question:
            "Suppose you are given a technical problem you have never seen before. How would you break it down and decide on an approach?"
    },
    {
        topic: "Programming",
        difficulty: "Adaptive",
        question:
            "Choose a programming concept you are comfortable with. Explain it clearly and give a small practical example."
    },
    {
        topic: "Systems",
        difficulty: "Medium",
        question:
            "Why is it important to understand the underlying system when developing a reliable software application?"
    },
    {
        topic: "Data & Algorithms",
        difficulty: "Medium",
        question:
            "Describe a data structure or algorithm you have studied recently and explain when you would choose it over an alternative."
    },
    {
        topic: "Application Design",
        difficulty: "Adaptive",
        question:
            "Imagine you need to design a small production-ready application. What factors would you consider before choosing the architecture?"
    },
    {
        topic: "Technical Communication",
        difficulty: "Medium",
        question:
            "How would you explain a difficult technical idea to someone who understands programming but is unfamiliar with that specific topic?"
    },
    {
        topic: "Interview Reflection",
        difficulty: "Adaptive",
        question:
            "What technical area do you currently feel least confident about, and what would you do to improve it?"
    }
];

/* ============================================================
   CONFIG
============================================================ */

function getConfig() {
    try {
        const raw = localStorage.getItem("interviewConfig");
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("Unable to read interviewConfig:", error);
        return null;
    }
}

/* ============================================================
   QUESTIONS
============================================================ */

function getQuestions() {
    try {
        const stored = localStorage.getItem(
            "generatedInterviewQuestions"
        );

        if (stored) {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed) && parsed.length) {
                return parsed
                    .slice(0, TOTAL_QUESTIONS)
                    .map(normalizeQuestion);
            }
        }
    } catch (error) {
        console.warn(
            "Stored generated questions could not be read.",
            error
        );
    }

    return fallbackQuestions.map(normalizeQuestion);
}

function normalizeQuestion(q, index) {
    if (typeof q === "string") {
        return {
            topic:
                config?.curriculum?.currentModule ||
                "Technical Interview",

            difficulty: "Adaptive",

            question: q
        };
    }

    return {
        topic:
            q.topic ||
            q.module ||
            q.subject ||
            config?.curriculum?.currentModule ||
            `Technical Topic ${index + 1}`,

        difficulty:
            q.difficulty ||
            q.level ||
            "Adaptive",

        question:
            q.question ||
            q.text ||
            q.prompt ||
            "Explain this topic and provide a practical example."
    };
}

/* ============================================================
   CANDIDATE
============================================================ */

function getCandidate() {
    return config?.candidate || {};
}

/* ============================================================
   TOAST
============================================================ */

function showToast(message) {
    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/* ============================================================
   START REAL BACKEND SESSION
============================================================ */

async function startBackendInterview() {
    try {
        let sessionId =
            localStorage.getItem("interviewSessionId") ||
            localStorage.getItem("sessionId");

        if (!sessionId) {
            sessionId =
                `INT-${Date.now()
                    .toString(36)
                    .toUpperCase()}`;
        }

        /*
         * Backend currently has CAND-003 available
         * for our integration testing.
         *
         * We use the configured candidate ID first,
         * but fall back to CAND-003 for testing.
         */

        const candidate = getCandidate();

        const candidateId =
            candidate.id ||
            candidate.candidateId ||
            "CAND-003";

        console.log(
            "Starting backend interview with candidate:",
            candidateId
        );

        const response = await fetch(
            `${API_BASE_URL}/api/interview`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    sessionId,

                    candidate: {
                        member: {
                            id: candidateId
                        }
                    }
                })
            }
        );

        const data = await response.json();

        console.log(
            "Backend interview start response:",
            data
        );

        if (!response.ok) {
            /*
             * If the configured candidate does not exist,
             * retry once using our known backend test candidate.
             */

            if (
                response.status === 400 &&
                candidateId !== "CAND-003" &&
                String(data.error || "")
                    .toLowerCase()
                    .includes("candidate not found")
            ) {
                console.warn(
                    "Configured candidate not found. Retrying with CAND-003..."
                );

                const retryResponse =
                    await fetch(
                        `${API_BASE_URL}/api/interview`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                sessionId,

                                candidate: {
                                    member: {
                                        id: "CAND-003"
                                    }
                                }
                            })
                        }
                    );

                const retryData =
                    await retryResponse.json();

                console.log(
                    "Backend retry response:",
                    retryData
                );

                if (!retryResponse.ok) {
                    throw new Error(
                        retryData.error ||
                        "Backend could not start interview."
                    );
                }

                backendSessionId =
                    retryData.sessionId ||
                    retryData.session?.sessionId ||
                    sessionId;

                backendReady = true;

                localStorage.setItem(
                    "interviewSessionId",
                    backendSessionId
                );

                localStorage.setItem(
                    "sessionId",
                    backendSessionId
                );

                console.log(
                    "REAL BACKEND SESSION STARTED:",
                    backendSessionId
                );

                return retryData;
            }

            throw new Error(
                data.error ||
                "Unable to start interview session."
            );
        }

        backendSessionId =
            data.sessionId ||
            data.session?.sessionId ||
            sessionId;

        backendReady = true;

        localStorage.setItem(
            "interviewSessionId",
            backendSessionId
        );

        localStorage.setItem(
            "sessionId",
            backendSessionId
        );

        console.log(
            "REAL BACKEND SESSION STARTED:",
            backendSessionId
        );

        return data;

    } catch (error) {
        console.error(
            "Backend interview start failed:",
            error
        );

        backendReady = false;

        showToast(
            "Backend interview session could not be started."
        );

        return null;
    }
}


/* ============================================================
   CANDIDATE UI
============================================================ */

function updateCandidateUI() {
    const candidate = getCandidate();

    $("candidateName").textContent =
        candidate.name || "Candidate";

    $("candidateRole").textContent =
        candidate.jobRole ||
        "Interview Candidate";

    $("candidateId").textContent =
        candidate.id ||
        candidate.candidateId ||
        "--";

    $("candidateEducation").textContent =
        candidate.education ||
        "--";

    const day =
        config?.curriculum?.currentDay;

    $("candidateDay").textContent =
        day
            ? `Day ${day} / ${config?.curriculum?.totalDays || 31
            }`
            : "Day -- / 31";

    $("candidateGoal").textContent =
        config?.goal ||
        "Placement";

    $("candidateMode").textContent =
        config?.candidateMode === "existing"
            ? "Existing Candidate"
            : "New Candidate";

    $("configDifficulty").textContent =
        config?.difficulty ||
        "Adaptive";

    const session =
        backendSessionId ||
        localStorage.getItem(
            "interviewSessionId"
        ) ||
        localStorage.getItem(
            "sessionId"
        ) ||
        `INT-${Date.now()
            .toString(36)
            .toUpperCase()}`;

    localStorage.setItem(
        "interviewSessionId",
        session
    );

    localStorage.setItem(
        "sessionId",
        session
    );

    $("sessionId").textContent =
        session;
}

/* ============================================================
   PROGRESS
============================================================ */

function updateProgressUI() {
    const total =
        questions.length ||
        TOTAL_QUESTIONS;

    const displayedTotal =
        Math.max(total, 1);

    const questionNumber =
        Math.min(
            currentQuestion + 1,
            displayedTotal
        );

    const percent =
        Math.round(
            (questionNumber /
                displayedTotal) *
            100
        );

    $("questionNumber").textContent =
        questionNumber;

    $("questionTotal").textContent =
        displayedTotal;

    $("questionPercent").textContent =
        `${percent}%`;

    $("questionProgress").style.width =
        `${percent}%`;

    $("insightQuestions").textContent =
        `${Math.min(
            answers.length,
            displayedTotal
        )} / ${displayedTotal}`;

    $("completedCount").textContent =
        answers.length;

    $("remainingCount").textContent =
        Math.max(
            displayedTotal -
            answers.length,
            0
        );

    $("donutValue").textContent =
        `${Math.round(
            (answers.length /
                displayedTotal) *
            100
        )}%`;

    $("progressDonut").style.setProperty(
        "--progress",
        `${Math.round(
            (answers.length /
                displayedTotal) *
            100
        )}%`
    );
}

/* ============================================================
   RENDER QUESTION
============================================================ */

function renderQuestion() {
    if (!questions.length) return;

    const q =
        questions[currentQuestion];

    $("currentTopic").textContent =
        q.topic;

    $("insightTopic").textContent =
        q.topic;

    $("currentDifficulty").textContent =
        q.difficulty;

    $("insightDifficulty").textContent =
        q.difficulty;

    $("questionText").textContent =
        q.question;

    $("questionTime").textContent =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    $("answerInput").value = "";

    $("answerCounter").textContent =
        "0 characters";

    answered = false;

    $("submitAnswer").disabled =
        false;

    $("nextButton").disabled =
        true;

    setAIStatus(
        "Waiting for answer",
        "The AI will evaluate your response after submission.",
        12
    );

    updateProgressUI();
}

/* ============================================================
   AI STATUS
============================================================ */

function setAIStatus(
    title,
    detail,
    progress
) {
    $("aiStatus").textContent =
        title;

    $("aiStatusDetail").textContent =
        detail;

    $("aiStatusBar").style.width =
        `${progress}%`;
}

/* ============================================================
   USER MESSAGE
============================================================ */

function appendUserMessage(text) {
    const article =
        document.createElement(
            "article"
        );

    article.className =
        "message user-message";

    const safe =
        escapeHtml(text);

    article.innerHTML = `
        <div class="message-avatar">
            <i data-lucide="user-round"></i>
        </div>

        <div class="message-body">

            <div class="message-meta">
                <strong>You</strong>

                <span>
                    ${new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    )}
                </span>
            </div>

            <div class="message-bubble">

                ${safe}

                <div class="message-time">
                    Delivered ✓✓
                </div>

            </div>

        </div>
    `;

    $("chatMessages")
        .appendChild(article);

    if (window.lucide) {
        lucide.createIcons();
    }

    $("chatMessages").scrollTop =
        $("chatMessages")
            .scrollHeight;
}

/* ============================================================
   REAL AI MESSAGE
============================================================ */

function appendAIMessage(text) {
    if (!text) return;

    const article =
        document.createElement(
            "article"
        );

    article.className =
        "message ai-message";

    article.innerHTML = `
        <div class="message-avatar ai-avatar">
            <i data-lucide="bot"></i>
        </div>

        <div class="message-body">

            <div class="message-meta">
                <strong>AI Interviewer</strong>

                <span>
                    ${new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    )}
                </span>
            </div>

            <div class="message-bubble">
                ${escapeHtml(text)}
            </div>

        </div>
    `;

    $("chatMessages")
        .appendChild(article);

    if (window.lucide) {
        lucide.createIcons();
    }

    $("chatMessages").scrollTop =
        $("chatMessages")
            .scrollHeight;
}

/* ============================================================
   SUBMIT ANSWER — REAL BACKEND
============================================================ */

async function submitAnswer() {
    if (answered) return;

    const input =
        $("answerInput");

    const answer =
        input.value.trim();

    if (!answer) {
        showToast(
            "Please enter an answer first."
        );

        input.focus();

        return;
    }

    /*
       Make sure backend session exists.
       This also protects against refreshing the page.
    */

    if (
        !backendReady ||
        !backendSessionId
    ) {
        const started =
            await startBackendInterview();

        if (!started) {
            showToast(
                "Interview backend is unavailable."
            );

            return;
        }
    }

    answered = true;

    $("submitAnswer").disabled =
        true;

    $("nextButton").disabled =
        true;

    appendUserMessage(answer);

    answers.push({
        questionIndex:
            currentQuestion,

        question:
            questions[currentQuestion],

        answer,

        submittedAt:
            new Date().toISOString()
    });

    updateProgressUI();

    setAIStatus(
        "Analyzing Answer",
        "Sending your answer to the AI interviewer...",
        60
    );

    try {

        /*
         * Send answer to REAL backend.
         *
         * We send both "message" and "answer"
         * so the backend can use whichever
         * field its current route expects.
         */

        const response =
            await fetch(
                `${API_BASE_URL}/api/interview`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        sessionId:
                            backendSessionId,

                        message:
                            answer,

                        answer:
                            answer,

                        question:
                            questions[
                            currentQuestion
                            ],

                        questionIndex:
                            currentQuestion,

                        candidate: {
                            member: {
                                id:
                                    getCandidate()
                                        .id ||
                                    getCandidate()
                                        .candidateId ||
                                    "CAND-003"
                            }
                        }
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "REAL BACKEND ANSWER RESPONSE:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Backend failed to process answer."
            );
        }

        /*
         * Keep session ID synchronized.
         */

        if (
            data.sessionId ||
            data.session?.sessionId
        ) {
            backendSessionId =
                data.sessionId ||
                data.session.sessionId;

            localStorage.setItem(
                "interviewSessionId",
                backendSessionId
            );

            localStorage.setItem(
                "sessionId",
                backendSessionId
            );

            $("sessionId").textContent =
                backendSessionId;
        }

        /*
         * REAL AI RESPONSE
         */
        // Only display an AI reply when the interview is continuing.
        // NEVER display the final evaluation inside the interview chat.

        if (!data.done) {

            const aiReply =
                data.reply ||
                data.response ||
                data.nextQuestion ||
                data.question;

            if (aiReply) {
                appendAIMessage(aiReply);
            }
        }

        /*
         * If backend returns a new question,
         * use it for the next question.
         */

        const backendQuestion =
            data.nextQuestion &&
                typeof data.nextQuestion ===
                "object"
                ? data.nextQuestion
                : null;

        if (backendQuestion) {
            questions[
                currentQuestion + 1
            ] = normalizeQuestion(
                backendQuestion,
                currentQuestion + 1
            );
        }

        /*
         * Backend says interview is complete.
         */

        if (
            data.done === true ||
            data.completed === true
        ) {
            localStorage.setItem(
                "interviewCompleted",
                "true"
            );

            setAIStatus(
                "Interview Complete",
                "The backend has completed your interview evaluation.",
                100
            );

            $("nextButton").disabled =
                false;

            $("nextButton").innerHTML =
                `View Results
                 <i data-lucide="arrow-right"></i>`;

            if (window.lucide) {
                lucide.createIcons();
            }

            saveSession();

            showToast(
                "Interview completed!"
            );

            return;
        }

        /*
         * Normal answer processed.
         */

        setAIStatus(
            "Answer Evaluated",
            "Your response was processed by the AI interviewer.",
            100
        );

        $("nextButton").disabled =
            false;

        saveSession();

    } catch (error) {

        console.error(
            "REAL INTERVIEW API ERROR:",
            error
        );

        /*
         * Remove the answer from local
         * answer array if backend failed.
         */

        answers =
            answers.filter(
                (_, index) =>
                    index !==
                    answers.length - 1
            );

        answered = false;

        $("submitAnswer").disabled =
            false;

        $("nextButton").disabled =
            true;

        setAIStatus(
            "Connection Error",
            "The backend could not process your answer. Please try again.",
            20
        );

        showToast(
            "Could not connect to interview backend."
        );
    }
}

/* ============================================================
   NEXT QUESTION
============================================================ */

function nextQuestion() {
    if (!answered) {
        showToast(
            "Submit your answer before continuing."
        );

        return;
    }

    if (
        currentQuestion >=
        questions.length - 1
    ) {
        finishInterview();

        return;

    }

    currentQuestion++;

    renderQuestion();

    $("answerInput").focus();
}

/* ============================================================
   FINISH INTERVIEW
============================================================ */

function finishInterview() {

    saveSession();

    /*
     * Keep backend session ID available
     * for result.js.
     */

    if (backendSessionId) {

        localStorage.setItem(
            "sessionId",
            backendSessionId
        );

        localStorage.setItem(
            "interviewSessionId",
            backendSessionId
        );
    }

    localStorage.setItem(
        "interviewCompleted",
        "true"
    );

    setAIStatus(
        "Interview Complete",
        "All interview questions have been answered.",
        100
    );

    $("headerStatus").textContent =
        "Interview Complete";

    $("nextButton").innerHTML =
        `View Results
         <i data-lucide="arrow-right"></i>`;

    if (window.lucide) {
        lucide.createIcons();
    }

    showToast(
        "Interview complete!"
    );

    setTimeout(() => {

        window.location.href =
            "result.html";

    }, 1000);
}

/* ============================================================
   SAVE FRONTEND SESSION
============================================================ */

function saveSession() {

    const session = {

        sessionId:
            backendSessionId ||
            localStorage.getItem(
                "interviewSessionId"
            ) ||
            localStorage.getItem(
                "sessionId"
            ),

        config,

        questions,

        currentQuestion,

        answers,

        startedAt:
            interviewStartedAt,

        updatedAt:
            new Date().toISOString(),

        backendConnected:
            backendReady
    };

    localStorage.setItem(
        "interviewSession",
        JSON.stringify(session)
    );
}

/* ============================================================
   TIMER
============================================================ */

function updateTimer() {

    const elapsed =
        Math.max(
            0,
            Math.floor(
                (Date.now() -
                    interviewStartedAt) /
                1000
            )
        );

    const minutes =
        String(
            Math.floor(
                elapsed / 60
            )
        ).padStart(2, "0");

    const seconds =
        String(
            elapsed % 60
        ).padStart(2, "0");

    $("interviewTimer").textContent =
        `${minutes}:${seconds}`;
}

/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

    return String(value).replace(
        /[&<>"']/g,
        (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char])
    );
}

/* ============================================================
   COPY QUESTION
============================================================ */

function copyQuestion() {

    const text =
        $("questionText")
            .innerText;

    if (navigator.clipboard) {

        navigator.clipboard
            .writeText(text)
            .then(() =>
                showToast(
                    "Question copied."
                )
            )
            .catch(() =>
                showToast(
                    "Copy unavailable."
                )
            );

    } else {

        showToast(
            "Copy unavailable in this browser."
        );
    }
}

/* ============================================================
   VOICE INPUT
============================================================ */

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        showToast(
            "Voice input is not supported by this browser."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang =
        "en-IN";

    recognition.interimResults =
        false;

    $("micButton")
        .classList
        .add("recording");

    showToast(
        "Listening..."
    );

    recognition.onresult =
        (event) => {

            const spoken =
                event.results[0][0]
                    .transcript;

            const input =
                $("answerInput");

            input.value =
                `${input.value}${input.value
                    ? " "
                    : ""
                }${spoken}`;

            input.dispatchEvent(
                new Event("input")
            );
        };

    recognition.onerror =
        () => {

            showToast(
                "Voice input could not be started."
            );
        };

    recognition.onend =
        () => {

            $("micButton")
                .classList
                .remove("recording");
        };

    recognition.start();
}

/* ============================================================
   INITIALIZE
============================================================ */

async function init() {

    config =
        getConfig();

    questions =
        getQuestions();

    if (!config) {

        showToast(
            "Interview configuration was not found. Using demo mode."
        );
    }

    /*
     * Start REAL backend session
     * before rendering the interview.
     */

    await startBackendInterview();

    updateCandidateUI();

    renderQuestion();

    updateTimer();

    setInterval(
        updateTimer,
        1000
    );

    const input =
        $("answerInput");

    /* -----------------------------------------
       CHARACTER COUNTER
    ----------------------------------------- */

    input.addEventListener(
        "input",
        () => {

            $("answerCounter")
                .textContent =
                `${input.value.length} characters`;
        }
    );

    /* -----------------------------------------
       ENTER TO SUBMIT
    ----------------------------------------- */

    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                submitAnswer();
            }
        }
    );

    /* -----------------------------------------
       SUBMIT
    ----------------------------------------- */

    $("submitAnswer")
        .addEventListener(
            "click",
            submitAnswer
        );

    /* -----------------------------------------
       NEXT
    ----------------------------------------- */

    $("nextButton")
        .addEventListener(
            "click",
            nextQuestion
        );

    /* -----------------------------------------
       COPY
    ----------------------------------------- */

    $("copyQuestion")
        .addEventListener(
            "click",
            copyQuestion
        );

    /* -----------------------------------------
       MIC
    ----------------------------------------- */

    $("micButton")
        .addEventListener(
            "click",
            startVoiceInput
        );

    /* -----------------------------------------
       CLEAR ANSWER
    ----------------------------------------- */

    $("clearAnswer")
        .addEventListener(
            "click",
            () => {

                input.value = "";

                input.dispatchEvent(
                    new Event("input")
                );

                input.focus();
            }
        );

    /* -----------------------------------------
       HINT
    ----------------------------------------- */

    $("hintButton")
        .addEventListener(
            "click",
            () => {

                showToast(
                    "Hint: Define the concept first, then explain how it is used with a practical example."
                );
            }
        );

    /* -----------------------------------------
       REPORT
    ----------------------------------------- */

    $("reportButton")
        .addEventListener(
            "click",
            () => {

                showToast(
                    "Issue report option selected."
                );
            }
        );

    /* -----------------------------------------
       BACK
    ----------------------------------------- */

    $("backButton")
        .addEventListener(
            "click",
            () => {

                if (
                    confirm(
                        "Go back to personalization? Your current interview answers will remain saved locally."
                    )
                ) {

                    saveSession();

                    window.location.href =
                        "personalize.html";
                }
            }
        );

    /* -----------------------------------------
       END INTERVIEW
    ----------------------------------------- */

    $("endInterview")
        .addEventListener(
            "click",
            () => {

                if (
                    confirm(
                        "End this interview now?"
                    )
                ) {

                    finishInterview();
                }
            }
        );

    /* -----------------------------------------
       THEME
    ----------------------------------------- */

    $("themeButton")
        .addEventListener(
            "click",
            () => {

                document.body
                    .classList
                    .toggle(
                        "light-interview"
                    );
            }
        );

    /* -----------------------------------------
       LUCIDE
    ----------------------------------------- */

    if (window.lucide) {
        lucide.createIcons();
    }
}

/* ============================================================
   START
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    init
);