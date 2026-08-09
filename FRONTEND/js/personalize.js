/* ============================================================
   AI INTERVIEW AGENT
   PERSONALIZE PAGE
   NEW CLEAN JAVASCRIPT
   ============================================================ */

"use strict";


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let candidates = [];
let curriculum = {};

let candidateMode = "new";
let selectedCandidate = null;

let selectedGoal = "Placement";

let currentDay = 20;

const TOTAL_DAYS = 31;


/* ============================================================
   SMALL HELPERS
   ============================================================ */

function $(id) {
    return document.getElementById(id);
}


function text(value, fallback = "--") {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    return String(value);
}


function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}


/* ============================================================
   CANDIDATE ELEMENTS
   ============================================================ */

const newCandidateCard =
    $("newCandidateCard");

const existingCandidateCard =
    $("existingCandidateCard");


/*
   IMPORTANT:

   Your current HTML contains the existing candidate
   container twice with the same ID.

   So we select ALL of them instead of relying
   on getElementById().
*/

const existingCandidateBoxes =
    document.querySelectorAll(
        "#existingCandidateBox"
    );


/* Existing candidate ID input */

const candidateIdSearch =
    $("candidateIdSearch");


/* ============================================================
   CANDIDATE FORM
   ============================================================ */

const candidateId =
    $("candidateId");

const candidateName =
    $("candidateName");

const jobRole =
    $("jobRole");

const experience =
    $("experience");

const education =
    $("education");

const candidateStatus =
    $("candidateStatus");


/* ============================================================
   INTERVIEW GOALS
   ============================================================ */

const goalCards =
    document.querySelectorAll(
        ".goal-card"
    );


/* ============================================================
   DAY / CURRICULUM CONTROLS
   ============================================================ */

const minusDay =
    $("minusDay");

const plusDay =
    $("plusDay");

const dayInput =
    $("dayInput");

const daySlider =
    $("daySlider");

const selectedDay =
    $("selectedDay");

const currentModule =
    $("currentModule");

const moduleRange =
    $("moduleRange");

const completedDays =
    $("completedDays");

const remainingDays =
    $("remainingDays");

const progressFill =
    $("progressFill");

const coveredTopics =
    $("coveredTopics");


/* ============================================================
   RIGHT SIDE PREVIEW
   ============================================================ */

const previewId =
    $("previewId");

const previewName =
    $("previewName");

const previewRole =
    $("previewRole");

const previewExperience =
    $("previewExperience");

const previewEducation =
    $("previewEducation");

const previewStatus =
    $("previewStatus");


/* ============================================================
   INTERVIEW SUMMARY
   ============================================================ */

const interviewSummaryCard =
    $("interviewSummaryCard");

const previewGoal =
    $("previewGoal");

const previewCoverage =
    $("previewCoverage");

const previewDays =
    $("previewDays");


/* ============================================================
   GENERATE BUTTON
   ============================================================ */

const generateInterview =
    $("generateInterview");


/* ============================================================
   MOUSE GLOW
   ============================================================ */

const mouseGlow =
    document.querySelector(
        ".mouse-glow"
    );


document.addEventListener(
    "mousemove",
    function (event) {

        if (!mouseGlow) {
            return;
        }

        mouseGlow.style.left =
            event.clientX + "px";

        mouseGlow.style.top =
            event.clientY + "px";

    }
);


/* ============================================================
   LUCIDE ICONS
   ============================================================ */

if (window.lucide) {

    window.lucide.createIcons();

}


/* ============================================================
   CANDIDATE MESSAGE
   ============================================================ */

/*
   Your HTML currently doesn't have a separate
   candidateMessage element.

   So we create one automatically below
   the Candidate ID search box.
*/

let candidateMessage =
    document.getElementById(
        "candidateMessage"
    );


if (
    !candidateMessage &&
    candidateIdSearch
) {

    candidateMessage =
        document.createElement("div");

    candidateMessage.id =
        "candidateMessage";

    candidateMessage.style.marginTop =
        "10px";

    candidateMessage.style.fontSize =
        "0.85rem";

    candidateMessage.style.minHeight =
        "20px";

    candidateIdSearch
        .parentElement
        ?.appendChild(
            candidateMessage
        );

}


/* ============================================================
   MESSAGE FUNCTION
   ============================================================ */

function showCandidateMessage(
    message,
    type = "normal"
) {

    if (!candidateMessage) {
        return;
    }

    candidateMessage.textContent =
        message;


    if (type === "success") {

        candidateMessage.style.color =
            "#3FB950";

    }

    else if (type === "error") {

        candidateMessage.style.color =
            "#F85149";

    }

    else {

        candidateMessage.style.color =
            "#8B949E";

    }

}


/* ============================================================
   LOAD JSON DATA
   ============================================================ */

async function loadInterviewData() {

    try {

        const candidateResponse =
            await fetch("../backend/data/candidates.json");

        const curriculumResponse =
            await fetch("../backend/data/curriculum.json");


        if (!candidateResponse.ok) {

            throw new Error(
                "Unable to load candidates.json"
            );

        }


        if (!curriculumResponse.ok) {

            throw new Error(
                "Unable to load curriculum.json"
            );

        }


        const candidateData =
            await candidateResponse.json();


        curriculum =
            await curriculumResponse.json();


        /*
           candidates.json structure:

           {
               "candidates": [
                   {
                       "member": {
                           "id": "...",
                           "name": "...",
                           "jobRole": "...",
                           ...
                       }
                   }
               ]
           }
        */

        candidates =
            Array.isArray(candidateData)
                ? candidateData
                : candidateData.candidates || [];


        console.log(
            "Candidates loaded:",
            candidates.length
        );


        console.log(
            "Curriculum loaded:",
            curriculum
        );


        initializePersonalizePage();

    }

    catch (error) {

        console.error(
            "Data loading error:",
            error
        );

        showCandidateMessage(
            "Unable to load interview data. Check your data folder.",
            "error"
        );

        initializePersonalizePage();

    }

}


/* ============================================================
   START
   ============================================================ */

loadInterviewData();/* ============================================================
   PART 2
   NEW CANDIDATE / EXISTING CANDIDATE
   ============================================================ */


/* ============================================================
   FORM VISIBILITY
   ============================================================ */

function showFullCandidateForm() {

    const formGrid =
        document.querySelector(".form-grid");

    if (formGrid) {
        formGrid.style.display = "grid";
    }

}


function hideFullCandidateForm() {

    const formGrid =
        document.querySelector(".form-grid");

    if (formGrid) {
        formGrid.style.display = "none";
    }

}


/* ============================================================
   EXISTING CANDIDATE BOX
   ============================================================ */

function showCandidateIdBox() {

    existingCandidateBoxes.forEach(box => {

        box.style.display = "block";

    });

}


function hideCandidateIdBox() {

    existingCandidateBoxes.forEach(box => {

        box.style.display = "none";

    });

}


/* ============================================================
   ENABLE / DISABLE FORM
   ============================================================ */

function enableCandidateForm() {

    [
        candidateId,
        candidateName,
        jobRole,
        experience,
        education,
        candidateStatus
    ].forEach(field => {

        if (field) {
            field.disabled = false;
        }

    });

}


function disableCandidateForm() {

    [
        candidateId,
        candidateName,
        jobRole,
        experience,
        education,
        candidateStatus
    ].forEach(field => {

        if (field) {
            field.disabled = true;
        }

    });

}


/* ============================================================
   CLEAR FORM
   ============================================================ */

function clearCandidateForm() {

    if (candidateId) {
        candidateId.value = "";
    }

    if (candidateName) {
        candidateName.value = "";
    }

    if (jobRole) {
        jobRole.value = "";
    }

    if (experience) {
        experience.value = "0";
    }

    if (education) {
        education.value = "";
    }

    if (candidateStatus) {
        candidateStatus.value = "IN_PROGRESS";
    }

    selectedCandidate = null;

    showCandidateMessage("");

}


/* ============================================================
   NEW CANDIDATE MODE
   ============================================================ */

function activateNewCandidate() {

    candidateMode = "new";

    selectedCandidate = null;


    /* Active card */

    newCandidateCard?.classList.add("active");

    existingCandidateCard?.classList.remove("active");


    /* Show full form */

    showFullCandidateForm();

    enableCandidateForm();


    /* Hide ID lookup */

    hideCandidateIdBox();


    /* Clear previous candidate */

    clearCandidateForm();


    /* Hide old candidate summary */

    if (interviewSummaryCard) {

        interviewSummaryCard.classList.add("hidden");

    }


    /* Update preview */

    if (typeof updatePreview === "function") {
        updatePreview();
    }


    if (typeof updateReadiness === "function") {
        updateReadiness();
    }

}


/* ============================================================
   EXISTING CANDIDATE MODE
   ============================================================ */

function activateExistingCandidate() {

    candidateMode = "existing";

    selectedCandidate = null;


    /* Active card */

    existingCandidateCard?.classList.add("active");

    newCandidateCard?.classList.remove("active");


    /* Show ONLY Candidate ID box */

    showCandidateIdBox();


    /* Hide complete manual form */

    hideFullCandidateForm();


    /*
       Clear old information.
       The candidate details will only appear
       after a valid Candidate ID is entered.
    */

    clearCandidateForm();


    /*
       Make sure the normal form cannot
       accidentally be edited.
    */

    disableCandidateForm();


    /* Hide old interview summary */

    if (interviewSummaryCard) {

        interviewSummaryCard.classList.add("hidden");

    }


    /* Message */

    showCandidateMessage(
        "Enter a Candidate ID such as CAND-002."
    );


    /* Focus ID box */

    if (candidateIdSearch) {

        setTimeout(() => {

            candidateIdSearch.focus();

        }, 100);

    }


    /* Update preview */

    if (typeof updatePreview === "function") {
        updatePreview();
    }


    if (typeof updateReadiness === "function") {
        updateReadiness();
    }

}


/* ============================================================
   CARD CLICK EVENTS
   ============================================================ */

if (newCandidateCard) {

    newCandidateCard.addEventListener(
        "click",
        function () {

            activateNewCandidate();

        }
    );

}


if (existingCandidateCard) {

    existingCandidateCard.addEventListener(
        "click",
        function () {

            activateExistingCandidate();

        }
    );

}


/* ============================================================
   EXISTING CANDIDATE ID INPUT
   ============================================================ */

if (candidateIdSearch) {

    candidateIdSearch.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                const enteredId =
                    candidateIdSearch.value.trim();

                if (!enteredId) {

                    showCandidateMessage(
                        "Please enter a Candidate ID.",
                        "error"
                    );

                    return;

                }


                /*
                   Part 5 will provide the actual
                   loadCandidateById() function.
                */

                if (
                    typeof loadCandidateById ===
                    "function"
                ) {

                    loadCandidateById(
                        enteredId
                    );

                }

            }

        }
    );

}


/* ============================================================
   DEFAULT PAGE STATE
   ============================================================ */

/*
   New Candidate is selected when
   the page first opens.
*/

/* ============================================================
   PART 3
   EXISTING CANDIDATE AUTO FETCH
   ============================================================ */


/* ============================================================
   FIND CANDIDATE BY ID
   ============================================================ */

function findCandidateById(id) {

    const searchId =
        String(id || "")
            .trim()
            .toUpperCase();

    if (!searchId) {
        return null;
    }


    return candidates.find(candidate => {

        const member =
            candidate.member || {};

        return String(member.id || "")
            .trim()
            .toUpperCase() === searchId;

    }) || null;

}


/* ============================================================
   SET SELECT VALUE
   ============================================================ */

/*
   Some existing candidates may have education/job-role
   values which are not currently present in your <select>.

   If that happens, we temporarily add the value so
   the candidate can still be displayed correctly.
*/

function setSelectValue(select, value) {

    if (!select) {
        return;
    }


    const newValue =
        String(value || "").trim();


    if (!newValue) {
        select.value = "";
        return;
    }


    const optionExists =
        [...select.options].some(option =>
            option.value === newValue ||
            option.textContent.trim() === newValue
        );


    if (!optionExists) {

        const option =
            document.createElement("option");

        option.value = newValue;

        option.textContent = newValue;

        select.appendChild(option);

    }


    select.value = newValue;

}


/* ============================================================
   FILL CANDIDATE FORM
   ============================================================ */

function fillCandidateDetails(candidate) {

    if (!candidate) {
        return;
    }


    const member =
        candidate.member || {};


    /*
       Candidate ID
    */

    if (candidateId) {

        candidateId.value =
            member.id || "";

    }


    /*
       Name
    */

    if (candidateName) {

        candidateName.value =
            member.name || "";

    }


    /*
       Job Role
    */

    setSelectValue(
        jobRole,
        member.jobRole
    );


    /*
       Experience
    */

    if (experience) {

        experience.value =
            member.yearsExperience ?? 0;

    }


    /*
       Education
    */

    setSelectValue(
        education,
        member.education
    );


    /*
       Status
    */

    setSelectValue(
        candidateStatus,
        member.status || "IN_PROGRESS"
    );


    /*
       Save the complete candidate object.
       This includes missions and signals too.
    */

    selectedCandidate =
        candidate;


    /*
       Update everything on the page.
    */

    if (typeof updatePreview === "function") {
        updatePreview();
    }


    if (typeof updateReadiness === "function") {
        updateReadiness();
    }


    if (
        typeof updateInterviewSummary ===
        "function"
    ) {

        updateInterviewSummary();

    }

}


/* ============================================================
   LOAD CANDIDATE BY ID
   ============================================================ */

function loadCandidateById(id) {

    if (candidateMode !== "existing") {

        return;

    }


    const searchId =
        String(id || "").trim();


    if (!searchId) {

        showCandidateMessage(
            "Please enter a Candidate ID.",
            "error"
        );

        return;

    }


    /*
       Search candidates.json
    */

    const candidate =
        findCandidateById(searchId);


    /* --------------------------------------------------------
       NOT FOUND
    -------------------------------------------------------- */

    if (!candidate) {

        selectedCandidate = null;


        showCandidateMessage(
            `❌ Candidate "${searchId}" not found.`,
            "error"
        );


        /*
           Keep the form hidden.
           Existing candidate must have a valid ID.
        */

        hideFullCandidateForm();


        if (interviewSummaryCard) {

            interviewSummaryCard.classList.add(
                "hidden"
            );

        }


        return;

    }





    /* --------------------------------------------------------
       FOUND
    -------------------------------------------------------- */

    fillCandidateDetails(
        candidate
    );


    showCandidateMessage(
        `✓ ${candidate.member.name} loaded successfully.`,
        "success"
    );


    /*
       Show the candidate information
       after successful lookup.
    */

    showFullCandidateForm();


    /*
       Keep the automatically loaded
       information locked.
    */

    disableCandidateForm();


    /*
       Show old candidate interview summary.
    */

    if (interviewSummaryCard) {

        interviewSummaryCard.classList.remove(
            "hidden"
        );

    }


    /*
       Update preview again after showing
       the loaded candidate.
    */

    if (typeof updatePreview === "function") {
        updatePreview();
    }


    if (typeof updateReadiness === "function") {
        updateReadiness();
    }


    if (
        typeof updateInterviewSummary ===
        "function"
    ) {

        updateInterviewSummary();

    }

}


/* ============================================================
   ALLOW ENTER KEY AGAIN
   ============================================================ */

/*
   Part 2 already attached the Enter event.
   This also supports typing the ID and then
   clicking outside the box.
*/

if (candidateIdSearch) {

    candidateIdSearch.addEventListener(
        "change",
        function () {

            const value =
                candidateIdSearch.value.trim();

            if (value) {

                loadCandidateById(
                    value
                );

            }

        }
    );

}


/* ============================================================
   OPTIONAL: LOAD ON INPUT AFTER PAUSE
   ============================================================ */

/*
   We DON'T automatically search on every keystroke.
   The candidate is loaded only when the user presses
   Enter or leaves the field.

   This prevents unnecessary searching while typing.
*/


/* ============================================================
   TEST FUNCTION
   ============================================================ */

/*
   You can test from browser console with:

   loadCandidateById("CAND-002");

   It should load Alex Turner.
*//* ============================================================
   PART 4
   CANDIDATE PREVIEW + INTERVIEW SUMMARY
   ============================================================ */


/* ============================================================
   UPDATE CANDIDATE SUMMARY
   ============================================================ */

function updatePreview() {

    /*
       --------------------------------------------------------
       EXISTING CANDIDATE
       --------------------------------------------------------
    */

    if (
        candidateMode === "existing" &&
        selectedCandidate
    ) {

        const member =
            selectedCandidate.member || {};


        if (previewId) {

            previewId.textContent =
                text(member.id);

        }


        if (previewName) {

            previewName.textContent =
                text(member.name);

        }


        if (previewRole) {

            previewRole.textContent =
                text(member.jobRole);

        }


        if (previewExperience) {

            previewExperience.textContent =
                `${member.yearsExperience ?? 0} Years`;

        }


        if (previewEducation) {

            previewEducation.textContent =
                text(member.education);

        }


        if (previewStatus) {

            previewStatus.textContent =
                text(
                    member.status,
                    "IN_PROGRESS"
                );

        }

    }


    /*
       --------------------------------------------------------
       NEW CANDIDATE
       --------------------------------------------------------
    */

    else if (candidateMode === "new") {

        if (previewId) {

            previewId.textContent =
                text(
                    candidateId?.value,
                    "--"
                );

        }


        if (previewName) {

            previewName.textContent =
                text(
                    candidateName?.value,
                    "--"
                );

        }


        if (previewRole) {

            previewRole.textContent =
                text(
                    jobRole?.value,
                    "--"
                );

        }


        if (previewExperience) {

            previewExperience.textContent =
                `${experience?.value || 0} Years`;

        }


        if (previewEducation) {

            previewEducation.textContent =
                text(
                    education?.value,
                    "--"
                );

        }


        if (previewStatus) {

            previewStatus.textContent =
                text(
                    candidateStatus?.value,
                    "IN_PROGRESS"
                );

        }

    }


    /*
       --------------------------------------------------------
       NO CANDIDATE LOADED
       --------------------------------------------------------
    */

    else {

        if (previewId) {
            previewId.textContent = "--";
        }

        if (previewName) {
            previewName.textContent = "--";
        }

        if (previewRole) {
            previewRole.textContent = "--";
        }

        if (previewExperience) {
            previewExperience.textContent =
                "0 Years";
        }

        if (previewEducation) {
            previewEducation.textContent = "--";
        }

        if (previewStatus) {
            previewStatus.textContent =
                "IN_PROGRESS";
        }

    }


    /*
       --------------------------------------------------------
       UPDATE INTERVIEW INFORMATION
       --------------------------------------------------------
    */

    if (previewGoal) {

        previewGoal.textContent =
            selectedGoal;

    }


    if (previewCoverage) {

        previewCoverage.textContent =
            `Day 1 – Day ${currentDay}`;

    }


    if (previewDays) {

        previewDays.textContent =
            `${currentDay} / ${TOTAL_DAYS}`;

    }


    updateStatusStyle();

}


/* ============================================================
   STATUS STYLE
   ============================================================ */

function updateStatusStyle() {

    if (!previewStatus) {
        return;
    }


    previewStatus.classList.remove(
        "ready",
        "warning",
        "danger"
    );


    const status =
        previewStatus.textContent
            .trim()
            .toUpperCase();


    if (status === "COMPLETED") {

        previewStatus.classList.add(
            "ready"
        );

    }

    else if (
        status === "IN_PROGRESS"
    ) {

        previewStatus.classList.add(
            "warning"
        );

    }

    else {

        previewStatus.classList.add(
            "warning"
        );

    }

}


/* ============================================================
   INTERVIEW SUMMARY
   ============================================================ */

function updateInterviewSummary() {

    if (!interviewSummaryCard) {
        return;
    }


    /*
       Interview Summary should ONLY exist
       for an existing candidate that has
       successfully been loaded.
    */

    if (
        candidateMode !== "existing" ||
        !selectedCandidate
    ) {

        interviewSummaryCard.classList.add(
            "hidden"
        );

        return;

    }


    interviewSummaryCard.classList.remove(
        "hidden"
    );


    /*
       Remove old dynamically generated
       report rows before creating new ones.
    */

    interviewSummaryCard
        .querySelectorAll(
            ".dynamic-report-row"
        )
        .forEach(row => {

            row.remove();

        });


    const missions =
        Array.isArray(
            selectedCandidate.missions
        )
            ? selectedCandidate.missions
            : [];


    const signals =
        selectedCandidate.signals || {};


    /*
       Calculate mission information.
    */

    const completedMissions =
        missions.filter(
            mission =>
                mission.passed === true
        ).length;


    const skippedMissions =
        missions.filter(
            mission =>
                mission.skipped === true
        ).length;


    const firstTry =
        signals.missionsFirstTry ??
        "—";


    const commitDays =
        signals.commitDays ??
        "—";


    const missionsCompleted =
        signals.missionsCompleted ??
        completedMissions;


    /*
       --------------------------------------------------------
       EXISTING SUMMARY VALUES
       --------------------------------------------------------
    */

    if (previewGoal) {

        previewGoal.textContent =
            selectedGoal;

    }


    if (previewCoverage) {

        previewCoverage.textContent =
            `Day 1 – Day ${currentDay}`;

    }


    if (previewDays) {

        previewDays.textContent =
            `${currentDay} / ${TOTAL_DAYS}`;

    }


    /*
       --------------------------------------------------------
       ADD CANDIDATE REPORT
       --------------------------------------------------------
    */

    const report = [

        {
            label: "Missions Completed",
            value: missionsCompleted
        },

        {
            label: "First-Try Missions",
            value: firstTry
        },

        {
            label: "Commit Days",
            value: commitDays
        },

        {
            label: "Passed Records",
            value: completedMissions
        },

        {
            label: "Skipped Records",
            value: skippedMissions
        }

    ];


    report.forEach(item => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "preview-row dynamic-report-row";


        row.innerHTML = `

            <span>
                ${item.label}
            </span>

            <strong>
                ${text(item.value)}
            </strong>

        `;


        interviewSummaryCard.appendChild(
            row
        );

    });

}


/* ============================================================
   LIVE UPDATE FOR NEW CANDIDATE
   ============================================================ */

[
    candidateId,
    candidateName,
    jobRole,
    experience,
    education,
    candidateStatus

].forEach(field => {

    if (!field) {
        return;
    }


    field.addEventListener(
        "input",
        function () {

            if (
                candidateMode === "new"
            ) {

                updatePreview();

            }

        }
    );


    field.addEventListener(
        "change",
        function () {

            if (
                candidateMode === "new"
            ) {

                updatePreview();

            }

        }
    );

});


/* ============================================================
   INITIAL PREVIEW
   ============================================================ */

updatePreview();

updateInterviewSummary();/* ============================================================
/* ============================================================
   GOALS + DAY CONTROLS
   FINAL FIX
============================================================ */


/* ============================================================
   GOAL CARDS
============================================================ */

function setupGoalCards() {

    const cards =
        document.querySelectorAll(".goal-card");

    if (!cards.length) {
        console.error("Goal cards not found");
        return;
    }

    cards.forEach(card => {

        card.onclick = function (event) {

            event.preventDefault();
            event.stopPropagation();

            /* Remove active from ALL cards */
            cards.forEach(item => {
                item.classList.remove("active");
            });

            /* Activate clicked card */
            this.classList.add("active");

            /* Save selected goal */
            selectedGoal =
                this.dataset.goal ||
                this.querySelector("h3")?.textContent.trim() ||
                "Placement";

            console.log(
                "Selected goal:",
                selectedGoal
            );

            /* Update preview */
            if (typeof updatePreview === "function") {
                updatePreview();
            }

            if (typeof updateInterviewSummary === "function") {
                updateInterviewSummary();
            }

            if (typeof updateReadiness === "function") {
                updateReadiness();
            }

        };

    });


    /* Set initial active goal */

    let active =
        [...cards].find(card =>
            card.classList.contains("active")
        );

    if (!active) {

        active =
            [...cards].find(card =>
                card.dataset.goal === "Placement"
            );

    }

    if (active) {

        cards.forEach(card =>
            card.classList.remove("active")
        );

        active.classList.add("active");

        selectedGoal =
            active.dataset.goal ||
            "Placement";

    }

}


/* ============================================================
   CURRICULUM
============================================================ */

function getCurriculumModules() {

    if (
        curriculum &&
        Array.isArray(curriculum.modules)
    ) {
        return curriculum.modules;
    }

    return [];

}


function getCurrentModule(day) {

    const modules =
        getCurriculumModules();

    return modules.find(module => {

        const range =
            module.days || [];

        const start =
            Number(range[0]);

        const end =
            Number(range[1]);

        return (
            day >= start &&
            day <= end
        );

    }) || null;

}


function getCompletedModules(day) {

    return getCurriculumModules()
        .filter(module => {

            const range =
                module.days || [];

            return Number(range[1]) <= day;

        });

}


/* ============================================================
   UPDATE DAY
============================================================ */

function updateDay(value) {

    let day =
        parseInt(value, 10);


    if (Number.isNaN(day)) {
        day = currentDay || 20;
    }


    day =
        Math.max(
            1,
            Math.min(
                TOTAL_DAYS,
                day
            )
        );


    currentDay = day;


    /* Number input */

    if (dayInput) {
        dayInput.value = day;
    }


    /* Slider */

    if (daySlider) {
        daySlider.value = day;
    }


    /* Day number */

    if (selectedDay) {
        selectedDay.textContent = day;
    }


    /* Completed */

    if (completedDays) {

        completedDays.textContent =
            `${day} / ${TOTAL_DAYS} Days`;

    }


    /* Remaining */

    if (remainingDays) {

        const remaining =
            TOTAL_DAYS - day;

        remainingDays.textContent =
            `${remaining} ${remaining === 1
                ? "Day"
                : "Days"
            } Remaining`;

    }


    /* Progress */

    if (progressFill) {

        const percentage =
            (day / TOTAL_DAYS) * 100;

        progressFill.style.width =
            `${percentage}%`;

    }


    /* Current module */

    updateCurrentModule();


    /* Covered topics */

    renderCoveredTopics();


    /* Preview */

    if (typeof updatePreview === "function") {
        updatePreview();
    }


    if (
        typeof updateInterviewSummary ===
        "function"
    ) {
        updateInterviewSummary();
    }


    if (
        typeof updateReadiness ===
        "function"
    ) {
        updateReadiness();
    }


    console.log(
        "Current curriculum day:",
        currentDay
    );

}


/* ============================================================
   CURRENT MODULE
============================================================ */

function updateCurrentModule() {

    const module =
        getCurrentModule(
            currentDay
        );


    if (!module) {

        if (currentModule) {
            currentModule.textContent =
                "Curriculum";
        }

        if (moduleRange) {
            moduleRange.textContent =
                `Day 1 – Day ${currentDay}`;
        }

        return;

    }


    if (currentModule) {

        currentModule.textContent =
            module.title ||
            "Current Module";

    }


    if (moduleRange) {

        const range =
            module.days || [];

        moduleRange.textContent =
            `Day ${range[0]} – Day ${range[1]}`;

    }

}


/* ============================================================
   COVERED TOPICS
============================================================ */

function renderCoveredTopics() {

    if (!coveredTopics) {
        return;
    }


    coveredTopics.innerHTML = "";


    const modules =
        getCompletedModules(
            currentDay
        );


    if (!modules.length) {

        coveredTopics.innerHTML = `
            <div class="topic-item">

                <div class="topic-check">
                    —
                </div>

                <div>
                    <strong>
                        No complete module yet
                    </strong>

                    <p>
                        Continue your curriculum
                        to unlock completed topics.
                    </p>
                </div>

            </div>
        `;

        return;
    }


    modules.forEach(module => {

        const range =
            module.days || [];


        const item =
            document.createElement("div");


        item.className =
            "topic-item";


        item.innerHTML = `

            <div class="topic-check">
                ✓
            </div>

            <div>

                <strong>
                    ${module.title || "Module"}
                </strong>

                <p>
                    Day ${range[0]}
                    –
                    Day ${range[1]}
                </p>

            </div>

        `;


        coveredTopics.appendChild(
            item
        );

    });

}


/* ============================================================
   PLUS / MINUS — FINAL FIX
============================================================ */

if (plusDay) {

    plusDay.type = "button";

    plusDay.onclick = function (event) {

        event.preventDefault();
        event.stopImmediatePropagation();

        console.log("PLUS CLICKED");

        let day = Number(currentDay) || 1;

        if (day < TOTAL_DAYS) {
            updateDay(day + 1);
        }

    };

}


if (minusDay) {

    minusDay.type = "button";

    minusDay.onclick = function (event) {

        event.preventDefault();
        event.stopImmediatePropagation();

        console.log("MINUS CLICKED");

        let day = Number(currentDay) || 1;

        if (day > 1) {
            updateDay(day - 1);
        }

    };

}


/* ============================================================
   NUMBER INPUT
============================================================ */

if (dayInput) {

    dayInput.oninput = function () {

        updateDay(
            this.value
        );

    };

}


/* ============================================================
   SLIDER
============================================================ */

if (daySlider) {

    daySlider.oninput = function () {

        updateDay(
            this.value
        );

    };

}


/* ============================================================
   INITIALIZE
============================================================ */

/* ============================================================
   PART 7
   AI READINESS + LIVE FORM STATUS
   ============================================================ */


/* ============================================================
   READINESS ELEMENTS
   ============================================================ */

const readinessCircle =
    document.querySelector(
        ".experience-circle"
    );


/*
   Find the AI Readiness preview card
   without depending on a fragile nth-child selector.
*/

const readinessCard =
    [...document.querySelectorAll(
        ".preview-card"
    )].find(card => {

        const heading =
            card.querySelector("h3");

        return heading &&
            heading.textContent
                .toLowerCase()
                .includes("ai readiness");

    });


const readinessTitle =
    readinessCard?.querySelector("h3");


const readinessDescription =
    readinessCard?.querySelector("p");


const readinessFlow =
    readinessCard?.querySelectorAll(
        ".flow div"
    ) || [];


/* ============================================================
   CALCULATE READINESS
   ============================================================ */

function calculateReadiness() {

    let score = 0;


    /* --------------------------------------------------------
       EXISTING CANDIDATE
       -------------------------------------------------------- */

    if (
        candidateMode === "existing"
    ) {

        /*
           Existing candidate gets a large
           portion of the score once successfully
           loaded from JSON.
        */

        if (selectedCandidate) {

            score += 60;

        }

    }


    /* --------------------------------------------------------
       NEW CANDIDATE
       -------------------------------------------------------- */

    else {

        /*
           Candidate ID
        */

        if (
            candidateId &&
            candidateId.value.trim()
        ) {

            score += 15;

        }


        /*
           Candidate Name
        */

        if (
            candidateName &&
            candidateName.value.trim()
        ) {

            score += 15;

        }


        /*
           Job Role
        */

        if (
            jobRole &&
            jobRole.value
        ) {

            score += 15;

        }


        /*
           Education
        */

        if (
            education &&
            education.value
        ) {

            score += 15;

        }

    }


    /* --------------------------------------------------------
       INTERVIEW GOAL
       -------------------------------------------------------- */

    if (selectedGoal) {

        score += 10;

    }


    /* --------------------------------------------------------
       CURRICULUM
       -------------------------------------------------------- */

    if (
        currentDay >= 1 &&
        currentDay <= TOTAL_DAYS
    ) {

        score += 10;

    }


    /*
       Make sure the value stays between
       0 and 100.
    */

    return clamp(
        score,
        0,
        100
    );

}


/* ============================================================
   UPDATE READINESS
   ============================================================ */

function updateReadiness() {

    const score =
        calculateReadiness();


    /* --------------------------------------------------------
       CIRCULAR PROGRESS
       -------------------------------------------------------- */

    if (readinessCircle) {

        const degrees =
            score * 3.6;


        readinessCircle.style.background =
            `conic-gradient(
                #58A6FF ${degrees}deg,
                #21262D ${degrees}deg
            )`;


        /*
           Don't destroy an existing inner
           structure if your HTML already has
           one. Only update the percentage.
        */

        let percentage =
            readinessCircle.querySelector(
                ".readiness-percent"
            );


        if (!percentage) {

            percentage =
                document.createElement(
                    "span"
                );

            percentage.className =
                "readiness-percent";

            readinessCircle.appendChild(
                percentage
            );

        }


        percentage.textContent =
            `${score}%`;

    }


    /* --------------------------------------------------------
       TITLE
       -------------------------------------------------------- */

    if (readinessTitle) {

        if (score >= 90) {

            readinessTitle.textContent =
                "Ready To Begin";

        }

        else if (score >= 70) {

            readinessTitle.textContent =
                "Almost Ready";

        }

        else if (score >= 40) {

            readinessTitle.textContent =
                "Profile In Progress";

        }

        else {

            readinessTitle.textContent =
                "Profile Incomplete";

        }

    }


    /* --------------------------------------------------------
       DESCRIPTION
       -------------------------------------------------------- */

    if (readinessDescription) {

        if (score >= 90) {

            readinessDescription.textContent =
                "Your profile is complete and the AI has enough information to generate a personalized interview.";

        }

        else if (score >= 70) {

            readinessDescription.textContent =
                "Your interview configuration is almost ready. Complete the remaining details.";

        }

        else if (score >= 40) {

            readinessDescription.textContent =
                "Your profile is being configured. Complete the required information to continue.";

        }

        else {

            readinessDescription.textContent =
                "Complete the candidate information and interview settings to get started.";

        }

    }


    /* --------------------------------------------------------
       READINESS CHECKLIST
       -------------------------------------------------------- */

    if (
        readinessFlow &&
        readinessFlow.length
    ) {

        /*
           Candidate profile
        */

        let profileReady = false;


        if (
            candidateMode ===
            "existing"
        ) {

            profileReady =
                !!selectedCandidate;

        }

        else {

            profileReady =
                !!(
                    candidateId?.value.trim() &&
                    candidateName?.value.trim() &&
                    jobRole?.value &&
                    education?.value
                );

        }


        /*
           Profile
        */

        if (readinessFlow[0]) {

            readinessFlow[0].style.opacity =
                profileReady
                    ? "1"
                    : ".4";

        }


        /*
           Curriculum
        */

        if (readinessFlow[1]) {

            readinessFlow[1].style.opacity =
                currentDay >= 1
                    ? "1"
                    : ".4";

        }


        /*
           Interview goal
        */

        if (readinessFlow[2]) {

            readinessFlow[2].style.opacity =
                selectedGoal
                    ? "1"
                    : ".4";

        }


        /*
           Final readiness
        */

        if (readinessFlow[3]) {

            readinessFlow[3].style.opacity =
                score >= 90
                    ? "1"
                    : ".4";

        }

    }

}


/* ============================================================
   LIVE NEW-CANDIDATE FORM
   ============================================================ */

function refreshNewCandidateReadiness() {

    if (
        candidateMode !== "new"
    ) {

        return;

    }


    updatePreview();

    updateReadiness();

}


/* ============================================================
   FORM EVENTS
   ============================================================ */

[
    candidateId,
    candidateName,
    jobRole,
    experience,
    education,
    candidateStatus

].forEach(field => {

    if (!field) {
        return;
    }


    field.addEventListener(
        "input",
        refreshNewCandidateReadiness
    );


    field.addEventListener(
        "change",
        refreshNewCandidateReadiness
    );

});


/* ============================================================
   INITIAL READINESS
   ============================================================ */

/* ============================================================
   PART 8
   GENERATE INTERVIEW + SAVE CONFIGURATION
   ============================================================ */


/* ============================================================
   VALIDATE NEW CANDIDATE
   ============================================================ */

function validateNewCandidate() {

    const missing = [];


    if (
        !candidateId ||
        !candidateId.value.trim()
    ) {

        missing.push(
            "Candidate ID"
        );

    }


    if (
        !candidateName ||
        !candidateName.value.trim()
    ) {

        missing.push(
            "Full Name"
        );

    }


    if (
        !jobRole ||
        !jobRole.value
    ) {

        missing.push(
            "Job Role"
        );

    }


    if (
        !education ||
        !education.value
    ) {

        missing.push(
            "Education"
        );

    }


    return missing;

}


/* ============================================================
   BUILD NEW CANDIDATE OBJECT
   ============================================================ */

function createNewCandidateObject() {

    return {

        id:
            candidateId.value.trim(),

        name:
            candidateName.value.trim(),

        jobRole:
            jobRole.value,

        yearsExperience:
            Number(
                experience.value || 0
            ),

        education:
            education.value,

        status:
            candidateStatus.value ||
            "IN_PROGRESS"

    };

}


/* ============================================================
   BUILD INTERVIEW CONFIGURATION
   ============================================================ */

function buildInterviewConfig() {

    let candidate;


    /*
       --------------------------------------------------------
       EXISTING CANDIDATE
       --------------------------------------------------------
    */

    if (
        candidateMode ===
        "existing"
    ) {

        if (!selectedCandidate) {

            return null;

        }


        candidate =
            selectedCandidate.member ||
            {};

    }


    /*
       --------------------------------------------------------
       NEW CANDIDATE
       --------------------------------------------------------
    */

    else {

        candidate =
            createNewCandidateObject();

    }


    /*
       Find current curriculum module.
    */

    const module =
        getCurrentModule(
            currentDay
        );


    /*
       Get completed modules.
    */

    const completedModules =
        getCompletedModules(
            currentDay
        );


    /*
       Complete configuration object.
    */

    return {

        candidateMode:

            candidateMode,


        candidate:

            candidate,


        /*
           Keep complete existing candidate
           record available for the next page.
        */

        candidateRecord:

            candidateMode === "existing"
                ? selectedCandidate
                : null,


        /*
           Interview goal.
        */

        goal:

            selectedGoal,


        /*
           Curriculum progress.
        */

        curriculum: {

            currentDay:

                currentDay,


            totalDays:

                TOTAL_DAYS,


            currentModule:

                module
                    ? module.title
                    : "",


            currentModuleDays:

                module
                    ? module.days
                    : [],


            completedModules:

                completedModules.map(
                    item =>
                        item.title
                )

        },


        /*
           Creation timestamp.
        */

        createdAt:

            new Date().toISOString()

    };

}


/* ============================================================
   GENERATE INTERVIEW
   ============================================================ */

function generatePersonalizedInterview() {

    /*
       --------------------------------------------------------
       EXISTING CANDIDATE VALIDATION
       --------------------------------------------------------
    */

    if (
        candidateMode ===
        "existing"
    ) {

        if (!selectedCandidate) {

            showCandidateMessage(
                "Please enter a valid Candidate ID first.",
                "error"
            );


            if (candidateIdSearch) {

                candidateIdSearch.focus();

            }


            return;

        }

    }


    /*
       --------------------------------------------------------
       NEW CANDIDATE VALIDATION
       --------------------------------------------------------
    */

    if (
        candidateMode ===
        "new"
    ) {

        const missing =
            validateNewCandidate();


        if (missing.length > 0) {

            alert(
                "Please complete the following:\n\n" +
                missing
                    .map(
                        item =>
                            `• ${item}`
                    )
                    .join("\n")
            );


            return;

        }

    }


    /*
       --------------------------------------------------------
       GOAL VALIDATION
       --------------------------------------------------------
    */

    if (!selectedGoal) {

        alert(
            "Please select an Interview Goal."
        );


        return;

    }


    /*
       --------------------------------------------------------
       BUILD CONFIG
       --------------------------------------------------------
    */

    const config =
        buildInterviewConfig();


    if (!config) {

        alert(
            "Unable to create interview configuration."
        );


        return;

    }


    /*
       --------------------------------------------------------
       SAVE CONFIGURATION
       --------------------------------------------------------
    */

    localStorage.setItem(
        "interviewConfig",
        JSON.stringify(config)
    );


    /*
       Also save candidate separately.
       This makes it easier for the next page
       to access the candidate.
    */

    localStorage.setItem(
        "selectedCandidate",
        JSON.stringify(
            config.candidate
        )
    );


    /*
       Save the complete candidate record
       when it is an existing candidate.
    */

    if (
        candidateMode ===
        "existing"
    ) {

        localStorage.setItem(
            "selectedCandidateRecord",
            JSON.stringify(
                selectedCandidate
            )
        );

    }


    /*
       Save selected goal separately.
    */

    localStorage.setItem(
        "selectedInterviewGoal",
        selectedGoal
    );


    /*
       Save curriculum day separately.
    */

    localStorage.setItem(
        "selectedCurriculumDay",
        String(currentDay)
    );


    console.log(
        "Interview configuration saved:",
        config
    );


    /*
       --------------------------------------------------------
       GO TO LOADING PAGE
       --------------------------------------------------------
    */

    window.location.href =
        "loading.html";

}




/* ============================================================
   GENERATE INTERVIEW — DIRECT BUTTON FIX
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    const button =
        document.getElementById("generateInterview");

    if (!button) {
        console.error(
            "Generate Interview button not found."
        );
        return;
    }

    button.addEventListener("click", function (event) {

        event.preventDefault();

        console.log(
            "Generate Personalized Interview clicked"
        );

        /*
         * Use the existing interview-generation
         * workflow.
         */
        if (
            typeof generatePersonalizedInterview ===
            "function"
        ) {
            generatePersonalizedInterview();
        } else {

            console.error(
                "generatePersonalizedInterview() not found."
            );

            /*
             * Emergency navigation so the button
             * still reaches the loading page.
             */
            window.location.href =
                "loading.html";
        }

    });

});

/* ============================================================
   FINAL PAGE INITIALIZATION
============================================================ */

function initializePersonalizePage() {

    /* Default day */

    currentDay =
        clamp(
            Number(
                dayInput?.value ||
                20
            ),
            1,
            TOTAL_DAYS
        );


    /* Setup goal cards */

    setupGoalCards();


    /* Update curriculum */

    updateDay(
        currentDay
    );


    /* Update preview */

    updatePreview();


    /* Update readiness */

    updateReadiness();


    /* New Candidate is default */

    activateNewCandidate();


    /* Recreate Lucide icons */

    if (window.lucide) {

        window.lucide.createIcons();

    }

}


/* ============================================================
   START FINAL INITIALIZATION
============================================================ */

initializePersonalizePage();