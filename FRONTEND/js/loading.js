/* ==========================================
            LOADING.JS
========================================== */

lucide.createIcons();

/* ==========================================
            Mouse Glow
========================================== */

const glow = document.querySelector(".mouse-glow");

document.addEventListener("mousemove", (e) => {

    if (!glow) return;

    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";

});


/* ==========================================
            Elements
========================================== */

const progressText = document.getElementById("progressText");
const progressCircle = document.getElementById("progressCircle");
const progressTitle = document.getElementById("progressTitle");
const progressSubtitle = document.getElementById("progressSubtitle");

const statusFill = document.getElementById("statusFill");
const statusText = document.getElementById("statusText");
const headerStatus = document.getElementById("headerStatus");

const thought = document.getElementById("aiThought");

const readyCard = document.getElementById("readyCard");

const timeline = document.querySelectorAll(".timeline-item");


/* ==========================================
            Thoughts
========================================== */

const thoughts = [

    "Analyzing your profile...",

    "Understanding your background...",

    "Selecting interview topics...",

    "Generating personalized questions...",

    "Preparing intelligent follow-up questions...",

    "Configuring evaluation engine...",

    "Optimizing interview experience...",

    "Almost done..."

];


/* ==========================================
            Quotes
========================================== */

const quotes = [

    "Confidence comes from preparation.",

    "Great interviews begin with great thinking.",

    "The best engineers explain their reasoning.",

    "Preparation beats memorization."

];

let quoteIndex = 0;

const quoteText = document.getElementById("quoteText");

if (quoteText) {

    setInterval(() => {

        quoteIndex++;

        quoteText.style.opacity = "0";

        setTimeout(() => {

            quoteText.textContent =
                quotes[quoteIndex % quotes.length];

            quoteText.style.opacity = "1";

        },300);

    },5000);

}


/* ==========================================
            Thought Animation
========================================== */

function changeThought(text){

    thought.style.opacity="0";

    setTimeout(()=>{

        thought.textContent=text;

        thought.style.opacity="1";

    },250);

}


/* ==========================================
            SVG Progress Ring
========================================== */

const radius = 105;

const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = circumference;

progressCircle.style.strokeDashoffset = circumference;


/* ==========================================
            Loading Variables
========================================== */

let progress = 0;

let step = 0;

let thoughtStep = 0;


/* ==========================================
            Loading Loop
========================================== */

const loader = setInterval(()=>{

    progress++;

    progressText.textContent = progress + "%";

    statusFill.style.width = progress + "%";

    const offset = circumference - (progress / 100) * circumference;

    progressCircle.style.strokeDashoffset = offset;


    /* Thoughts */

    if(progress % 14 === 0 && thoughtStep < thoughts.length){

        changeThought(thoughts[thoughtStep]);

        thoughtStep++;

    }


    /* Timeline */

    if(progress % 20 === 0 && step < timeline.length){

        if(step > 0){

            timeline[step-1].classList.remove("active");

            timeline[step-1].classList.add("completed");

        }

        timeline[step].classList.add("active");

        step++;

    }


    if(progress >= 100){

        clearInterval(loader);

        finishLoading();

    }

},55);


/* ==========================================
            Finish
========================================== */

function finishLoading(){

    timeline.forEach(item=>{

        item.classList.remove("active");

        item.classList.add("completed");

    });

    progressText.textContent = "100%";

    progressTitle.textContent = "Interview Ready";

    progressSubtitle.textContent =
        "Your personalized interview has been generated successfully.";

    changeThought(
        "Everything is ready. Click Start Interview whenever you're ready."
    );

    progressCircle.style.stroke = "#3FB950";

    statusFill.style.width = "100%";

    statusText.textContent = "Interview Ready";

    if(headerStatus){

        headerStatus.textContent = "Interview Ready";

    }

    setTimeout(()=>{

        readyCard.classList.add("show");

    },500);

}


/* ==========================================
            Card Hover
========================================== */

document.querySelectorAll(".card").forEach(card=>{

    card.addEventListener("mousemove",(e)=>{

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;

        const y = e.clientY - rect.top;

        card.style.background =
        `radial-gradient(circle at ${x}px ${y}px,
        rgba(88,166,255,.08),
        #161B22 70%)`;

    });

    card.addEventListener("mouseleave",()=>{

        card.style.background="#161B22";

    });

});