// ======================================================
// AI INTERVIEW RESULT - REAL BACKEND VERSION
// ======================================================

const API_BASE_URL = "https://ai-interview-agent-un2c.onrender.com";


// ======================================================
// GET CURRENT INTERVIEW SESSION
// ======================================================

function getSession() {

    try {

        return JSON.parse(
            localStorage.getItem("interviewSession")
        ) || null;

    } catch (error) {

        console.error(
            "Session read error:",
            error
        );

        return null;
    }
}


// ======================================================
// GET SESSION ID
// ======================================================

function getSessionId() {

    const session = getSession();

    return (
        session?.sessionId ||
        session?.id ||
        localStorage.getItem("sessionId") ||
        new URLSearchParams(
            window.location.search
        ).get("sessionId")
    );
}


// ======================================================
// FETCH REAL RESULT FROM BACKEND
// ======================================================

async function fetchInterviewResult() {

    const sessionId =
        getSessionId();

    if (!sessionId) {

        console.error(
            "No session ID found."
        );

        showToast(
            "Interview session not found."
        );

        return null;
    }

    console.log(
        "Fetching result for session:",
        sessionId
    );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/interview/result/${encodeURIComponent(sessionId)}`
            );

        const data =
            await response.json();

        console.log(
            "Backend result:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Failed to load interview result."
            );
        }

        return data.data;

    } catch (error) {

        console.error(
            "Result API Error:",
            error
        );

        showToast(
            error.message
        );

        return null;
    }
}


// ======================================================
// RENDER QUESTIONS
// ======================================================

function renderQuestions(result) {

    const list =
        document.getElementById(
            "questionList"
        );

    if (!list) return;

    list.innerHTML = "";

    const questions =
        result?.questions || [];

    if (!questions.length) {

        list.innerHTML = `
            <div class="empty-result">
                No interview questions were found.
            </div>
        `;

        return;
    }

    questions.forEach(
        (q, index) => {

            const questionText =
                q.question ||
                q.text ||
                q.content ||
                `Question ${index + 1}`;

            const answer =
                q.answer ||
                q.candidateAnswer ||
                "No answer recorded.";

            const topic =
                q.topic ||
                "Technical";

            const difficulty =
                q.difficulty ||
                "Medium";

            const score =
                q.score ??
                q.overallScore ??
                "--";

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "question-row";

            row.innerHTML = `
                <span class="question-number">
                    ${index + 1}
                </span>

                <span class="question-text">
                    ${escapeHtml(
                        questionText
                    )}
                </span>

                <span class="tag">
                    ${escapeHtml(
                        topic
                    )}
                </span>

                <span class="diff ${String(
                    difficulty
                ).toLowerCase()}">
                    ${escapeHtml(
                        difficulty
                    )}
                </span>

                <span class="question-score">
                    ${escapeHtml(
                        score
                    )}
                </span>

                <button
                    class="detail-btn"
                    data-index="${index}"
                >
                    View Detail
                    <i data-lucide="chevron-right"></i>
                </button>
            `;

            list.appendChild(
                row
            );
        }
    );

    list
        .querySelectorAll(
            ".detail-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openDetail(
                            Number(
                                button.dataset.index
                            ),
                            result
                        );

                    }
                );

            }
        );

    if (window.lucide) {
        lucide.createIcons();
    }
}


// ======================================================
// OPEN QUESTION DETAIL
// ======================================================

function openDetail(
    index,
    result
) {

    const questions =
        result?.questions || [];

    const q =
        questions[index];

    if (!q) return;

    const questionText =
        q.question ||
        q.text ||
        q.content ||
        `Question ${index + 1}`;

    const answer =
        q.answer ||
        q.candidateAnswer ||
        "No answer recorded.";

    const evaluation =
        q.evaluation ||
        q.feedback ||
        result?.evaluation ||
        "Evaluation not available.";

    const howTo =
        q.howToAnswer ||
        q.howTo ||
        "Review the question requirements and explain your reasoning clearly.";

    const suggested =
        q.suggestedAnswer ||
        q.suggested ||
        "A stronger answer should provide a clear explanation and a practical example.";

    const questionNo =
        document.getElementById(
            "detailQuestionNo"
        );

    const question =
        document.getElementById(
            "detailQuestion"
        );

    const detailAnswer =
        document.getElementById(
            "detailAnswer"
        );

    const detailEvaluation =
        document.getElementById(
            "detailEvaluation"
        );

    const detailHowTo =
        document.getElementById(
            "detailHowTo"
        );

    const detailSuggested =
        document.getElementById(
            "detailSuggested"
        );

    if (questionNo) {

        questionNo.textContent =
            `QUESTION ${index + 1}`;
    }

    if (question) {

        question.textContent =
            questionText;
    }

    if (detailAnswer) {

        detailAnswer.textContent =
            answer;
    }

    if (detailEvaluation) {

        detailEvaluation.textContent =
            evaluation;
    }

    if (detailHowTo) {

        detailHowTo.textContent =
            howTo;
    }

    if (detailSuggested) {

        detailSuggested.textContent =
            suggested;
    }

    const overlay =
        document.getElementById(
            "detailOverlay"
        );

    if (overlay) {

        overlay.classList.add(
            "open"
        );
    }
}


// ======================================================
// CANDIDATE INFORMATION
// ======================================================

function loadCandidate(result) {

    const candidate =
        result?.candidate || null;

    if (!candidate) return;

    const candidateName =
        document.getElementById(
            "candidateName"
        );

    const candidateId =
        document.getElementById(
            "candidateId"
        );

    if (candidateName) {

        candidateName.textContent =
            candidate.fullName ||
            candidate.name ||
            candidate.member?.name ||
            "Candidate";
    }

    if (candidateId) {

        candidateId.textContent =
            candidate.candidateId ||
            candidate.id ||
            candidate.member?.id ||
            "--";
    }
}


// ======================================================
// RESULT SUMMARY
// ======================================================

function loadSummary(result) {

    console.log(
        "Loading result summary:",
        result
    );


    // --------------------------------------------------
    // Overall score
    // --------------------------------------------------

    const scoreElement =
        document.getElementById(
            "overallScore"
        );

    if (scoreElement) {

        scoreElement.textContent =
            result?.overallScore ??
            "--";
    }


    // --------------------------------------------------
    // Overall evaluation
    // --------------------------------------------------

    const evaluationElement =
        document.getElementById(
            "overallEvaluation"
        );

    if (evaluationElement) {

        evaluationElement.textContent =
            result?.evaluation ||
            "Evaluation not available.";
    }


    // --------------------------------------------------
    // Performance
    // --------------------------------------------------

    const performanceElement =
        document.getElementById(
            "performance"
        );

    if (performanceElement) {

        performanceElement.textContent =
            result?.performanceLabel ||
            result?.performance ||
            "--";
    }


    // --------------------------------------------------
    // Performance subtext
    // --------------------------------------------------

    const performanceSubtext =
        document.getElementById(
            "performanceSubtext"
        );

    if (performanceSubtext) {

        performanceSubtext.textContent =
            result?.performanceSubtext ||
            "";
    }


    // --------------------------------------------------
    // Questions answered
    // --------------------------------------------------

    const answeredElement =
        document.getElementById(
            "answeredCount"
        );

    if (answeredElement) {

        const answered =
            result?.questions?.length || 0;

        const total =
            result?.questionCount ||
            answered;

        answeredElement.textContent =
            `${answered} / ${total}`;
    }


    // --------------------------------------------------
    // Accuracy
    // --------------------------------------------------

    const accuracyElement =
        document.getElementById(
            "accuracy"
        );

    if (accuracyElement) {

        accuracyElement.textContent =
            result?.accuracy !== null &&
            result?.accuracy !== undefined
                ? `${Math.round(
                    Number(result.accuracy)
                )}%`
                : "--";
    }


    // --------------------------------------------------
    // Total interview time
    // --------------------------------------------------

    const totalTimeElement =
        document.getElementById(
            "totalTime"
        );

    if (
        totalTimeElement &&
        result?.startedAt &&
        result?.finishedAt
    ) {

        const start =
            new Date(
                result.startedAt
            ).getTime();

        const finish =
            new Date(
                result.finishedAt
            ).getTime();

        if (
            Number.isFinite(start) &&
            Number.isFinite(finish) &&
            finish >= start
        ) {

            const totalSeconds =
                Math.floor(
                    (finish - start) / 1000
                );

            const minutes =
                Math.floor(
                    totalSeconds / 60
                );

            const seconds =
                totalSeconds % 60;

            totalTimeElement.textContent =
                `${minutes}:${String(
                    seconds
                ).padStart(2, "0")}`;
        }
    }
}


// ======================================================
// PERFORMANCE BREAKDOWN
// ======================================================

function loadPerformance(result) {

    const cards =
        document.querySelectorAll(
            ".breakdown-card"
        );

    if (!cards.length) return;

    const scores = [

        result?.technicalKnowledge,

        result?.problemSolving,

        result?.communication,

        result?.confidence,

        result?.accuracy

    ];

    cards.forEach(
        (card, index) => {

            const score =
                scores[index];

            const scoreElement =
                card.querySelector(
                    ".breakdown-info strong"
                );

            if (scoreElement) {

                if (
                    score === null ||
                    score === undefined
                ) {

                    scoreElement.innerHTML =
                        `-- <span>/ 100</span>`;

                } else {

                    scoreElement.innerHTML =
                        `${Math.round(
                            Number(score)
                        )} <span>/ 100</span>`;
                }
            }

            const meter =
                card.querySelector(
                    ".meter i"
                );

            if (meter) {

                meter.style.width =
                    score !== null &&
                    score !== undefined
                        ? `${Math.max(
                            0,
                            Math.min(
                                100,
                                Number(score)
                            )
                        )}%`
                        : "0%";
            }
        }
    );
}


// ======================================================
// AI REVIEW
// ======================================================

function loadReview(result) {

    const review =
        document.getElementById(
            "aiReview"
        );

    if (review) {

        review.textContent =
            result?.evaluation ||
            "No AI evaluation available.";
    }


    renderList(
        ".review-card.strengths ul",
        result?.strengths,
        "No specific strengths were recorded."
    );


    renderList(
        ".review-card.improvements ul",
        result?.improvements,
        "No specific improvement areas were recorded."
    );


    renderList(
        ".review-card.weaknesses ul",
        result?.weaknesses,
        "No specific weaknesses were recorded."
    );
}


// ======================================================
// RENDER LIST
// ======================================================

function renderList(
    selector,
    items,
    emptyText
) {

    const list =
        document.querySelector(
            selector
        );

    if (!list) return;

    list.innerHTML = "";

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            emptyText;

        list.appendChild(
            li
        );

        return;
    }

    items.forEach(
        item => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                String(item);

            list.appendChild(
                li
            );
        }
    );
}


// ======================================================
// TOAST
// ======================================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        showToast.timer
    );

    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        char => ({

            "&":
                "&amp;",

            "<":
                "&lt;",

            ">":
                "&gt;",

            '"':
                "&quot;",

            "'":
                "&#039;"

        }[char])
    );
}


// ======================================================
// INITIALIZE RESULT PAGE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Loading real interview result..."
        );


        const result =
            await fetchInterviewResult();


        if (!result) {

            return;
        }


        console.log(
            "Real interview result loaded:",
            result
        );


        // --------------------------------------------------
        // Load real backend data
        // --------------------------------------------------

        loadCandidate(
            result
        );

        loadSummary(
            result
        );

        loadPerformance(
            result
        );

        loadReview(
            result
        );

        renderQuestions(
            result
        );


        // --------------------------------------------------
        // Close detail
        // --------------------------------------------------

        const closeDetail =
            document.getElementById(
                "closeDetail"
            );

        if (closeDetail) {

            closeDetail.onclick =
                () => {

                    document
                        .getElementById(
                            "detailOverlay"
                        )
                        ?.classList.remove(
                            "open"
                        );

                };
        }


        // --------------------------------------------------
        // Close overlay
        // --------------------------------------------------

        const overlay =
            document.getElementById(
                "detailOverlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target.id ===
                        "detailOverlay"
                    ) {

                        overlay.classList.remove(
                            "open"
                        );
                    }

                }
            );
        }


        // --------------------------------------------------
        // Navigation
        // --------------------------------------------------

        document
            .getElementById(
                "backInterview"
            )
            ?.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "interview.html";
                }
            );


        document
            .getElementById(
                "practiceAgain"
            )
            ?.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "personalize.html";
                }
            );


        document
            .getElementById(
                "dashboardBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "index.html";
                }
            );


        document
            .getElementById(
                "nextInterviewBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "personalize.html";
                }
            );


        document
            .getElementById(
                "practiceBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "personalize.html";
                }
            );


        // --------------------------------------------------
        // Learning
        // --------------------------------------------------

        document
            .getElementById(
                "learningBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    showToast(
                        "Learning module coming soon."
                    );
                }
            );


        // --------------------------------------------------
        // Share
        // --------------------------------------------------

        document
            .getElementById(
                "shareBtn"
            )
            ?.addEventListener(
                "click",
                async () => {

                    const text =
                        "My AI Interview result is ready.";

                    try {

                        if (
                            navigator.share
                        ) {

                            await navigator.share({
                                title:
                                    "AI Interview Result",
                                text
                            });

                        } else {

                            await navigator.clipboard
                                .writeText(
                                    window.location.href
                                );

                            showToast(
                                "Result link copied."
                            );
                        }

                    } catch (error) {

                        console.log(
                            "Share cancelled."
                        );
                    }
                }
            );


        // --------------------------------------------------
        // Download
        // --------------------------------------------------

        document
            .getElementById(
                "downloadBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    showToast(
                        "PDF report will be connected later."
                    );
                }
            );


        // --------------------------------------------------
        // Theme
        // --------------------------------------------------

        document
            .getElementById(
                "themeButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    document.body.classList.toggle(
                        "light-result"
                    );
                }
            );


        // --------------------------------------------------
        // Icons
        // --------------------------------------------------

        if (window.lucide) {

            lucide.createIcons();

        }

    }
);