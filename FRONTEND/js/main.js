// Mouse Glow

const glow = document.querySelector(".mouse-glow");

document.addEventListener("mousemove",(e)=>{

    glow.style.left=e.clientX+"px";

    glow.style.top=e.clientY+"px";

});



// Navbar Blur

window.addEventListener("scroll",()=>{

    const header=document.querySelector("header");

    if(window.scrollY>40){

        header.style.background="rgba(13,17,23,.95)";

    }else{

        header.style.background="rgba(13,17,23,.82)";

    }

});



// Smooth Reveal Animation

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0px)";

}

});

});

document.querySelectorAll(".feature-card,.workflow-step,.stat").forEach(el=>{

el.style.opacity="0";

el.style.transform="translateY(50px)";

el.style.transition=".8s";

observer.observe(el);

});