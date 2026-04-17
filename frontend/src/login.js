const API = "http://localhost:5000/api/auth";
// const API = "http://localhost:5600/api/v1/user"
function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");

    alertBox.innerText = message;

    if (type === "success") {
        alertBox.className = "fixed top-5 right-5 px-4 py-3 rounded-lg text-sm font-medium shadow-lg bg-green-600 text-white z-20";
    } else {
        alertBox.className = "fixed top-5 right-5 px-4 py-3 rounded-lg text-sm font-medium shadow-lg bg-red-600 text-white z-20";
    }

    alertBox.classList.remove("hidden");

    setTimeout(() => {
        alertBox.classList.add("hidden");
    }, 3000);
}
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showAlert("Fill all fields", "error");
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });

        if (res.status === 429) {
            showAlert("Too many requests 🚫 Please wait and try again later.", "error");
            return;
        }

        if (res.ok) {
            showAlert("Login successful 🚀", "success");

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            const data = await res.json();
            showAlert(data.message || "Invalid credentials", "error");
        }

    } catch (err) {
        showAlert("Server error", "error");
    }
}

// ✨ Particle generator
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

setInterval(createParticle, 120);
document.getElementById('loginBtn').addEventListener('click', login)
