// ✨ Typing effect
const words = [
    "Upload Images.",
    "Process at Scale.",
    "Deliver Instantly."
];

let i = 0;
let j = 0;
let currentWord = "";
let isDeleting = false;

const typingElement = document.getElementById("typing");

function type() {
    currentWord = words[i];

    if (isDeleting) {
        typingElement.innerText = currentWord.substring(0, j--);
    } else {
        typingElement.innerText = currentWord.substring(0, j++);
    }

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && j === currentWord.length) {
        speed = 1000;
        isDeleting = true;
    } else if (isDeleting && j === 0) {
        isDeleting = false;
        i = (i + 1) % words.length;
        speed = 300;
    }

    setTimeout(type, speed);
}

type();

// ✨ Generate particles
const particlesContainer = document.getElementById("particles");

function createParticle() {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    particle.style.left = Math.random() * 100 + "vw";
    particle.style.animationDuration = (Math.random() * 5 + 3) + "s";

    particlesContainer.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 8000);
}

setInterval(createParticle, 100);