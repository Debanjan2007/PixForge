const API = "http://localhost:5000/api/auth";
const IMAGEAPI = "http://localhost:5000/api/images";

let currentUser = null;
let currentImageId = null;

function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");

    alertBox.innerText = message;
    alertBox.className = `fixed top-5 right-5 px-4 py-3 rounded-lg text-sm font-medium shadow-lg z-20 ${type === "success" ? "bg-green-600" : "bg-red-600"} text-white`;

    alertBox.classList.remove("hidden");
    setTimeout(() => alertBox.classList.add("hidden"), 3000);
}

function openProfileModal() {
    if (!currentUser) return;

    document.getElementById("profileUsername").innerText =
        "Username: " + currentUser.data.username;

    document.getElementById("profileModal").classList.remove("hidden");
}

document.getElementById("profileModal").onclick = () => {
    document.getElementById("profileModal").classList.add("hidden");
};

async function logoutUser() {
    try {
        await fetch(`${API}/logout`, {
            method: "POST",
            credentials: "include"
        });

        showAlert("Logged out", "success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 800);
    } catch {
        showAlert("Logout failed", "error");
    }
}

async function deleteAccount() {
    try {
        await fetch(`${API}/delete-account`, {
            method: "DELETE",
            credentials: "include"
        });

        showAlert("Account deleted", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);
    } catch {
        showAlert("Delete failed", "error");
    }
}

async function uploadFile(presignedUrl, file) {
    try {
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
        });

        if (response.ok) {
            console.log('Upload successful!');
        } else {
            console.error('Upload failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error during upload:', error);
    }
}

async function uploadImage() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return showAlert("Select a file", "error");

    const res = await fetch(`${IMAGEAPI}/upload?filetype=${file.type}`, {
        method: "PUT",
        credentials: "include",
    });
    console.log(res)
    if (res.ok) {
        const resdata = await res.json();
        console.log(resdata.data.presignedUrl)
        const { presignedUrl } = resdata.data;
        uploadFile(presignedUrl, file).then( (res) => {
            console.log(res)
            showAlert("Uploaded 🚀")
        }).catch( (err) => {
            console.log(err)
        })
        setTimeout(fetchImages, 800);
    } else {
        showAlert("Upload failed", "error");
    }
}

async function fetchImages() {
    const grid = document.getElementById("imageGrid");

    const res = await fetch(`${IMAGEAPI}/?page=1&limit=12`, {
        credentials: "include"
    });

    const data = await res.json();
    grid.innerHTML = "";

    data.data.forEach(img => {
        const url = img.processedUrl || img.rawFileSignedUrl;

        const wrapper = document.createElement("div");
        wrapper.className = "image-card cursor-pointer";

        const el = document.createElement("img");
        el.src = url;

        wrapper.onclick = () => openModal(img.imageId);
        wrapper.appendChild(el);

        grid.appendChild(wrapper);
    });
}

async function openModal(id) {
    currentImageId = id; // ✅ store ID

    const res = await fetch(`${IMAGEAPI}/${id}`, {
        credentials: "include"
    });

    const raw = await res.json();
    const data = typeof raw.data === "string" ? JSON.parse(raw.data) : raw.data;
    document.getElementById("modalImage").src = data.url;
    document.getElementById("imageModal").classList.remove("hidden");
}

document.getElementById("imageModal").onclick = () => {
    document.getElementById("imageModal").classList.add("hidden");
};

async function checkAuth() {
    const res = await fetch(`${API}/me`, {
        credentials: "include"
    });

    if (!res.ok) return window.location.href = "login.html";

    const user = await res.json();
    currentUser = user;

    document.getElementById("welcomeText").innerText =
        "Welcome " + user.data.username;
}

const particlesContainer = document.getElementById("particles");

async function deleteImage() {
    if (!currentImageId) return;

    try {
        const res = await fetch(`${IMAGEAPI}/${currentImageId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (res.ok) {
            showAlert("Deleted 🗑️");
            document.getElementById("imageModal").classList.add("hidden");
            fetchImages(); // refresh grid
        } else {
            showAlert("Delete failed", "error");
        }
    } catch {
        showAlert("Error deleting", "error");
    }
}

function createParticle() {
    const p = document.createElement("div");
    p.classList.add("particle");
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = (Math.random() * 5 + 3) + "s";

    particlesContainer.appendChild(p);
    setTimeout(() => p.remove(), 8000);
}

setInterval(createParticle, 120);

async function init() {
    await checkAuth();
    await fetchImages();
}

await init();
// event listeners
document.getElementById("deleteBtn").addEventListener('click', deleteImage)
document.getElementById('logOutUser').addEventListener('click' , logoutUser)
document.getElementById('deleteAcc').addEventListener('click', deleteAccount)
document.getElementById('OpenProfileModal').addEventListener('click', openProfileModal)
document.getElementById('uploader').addEventListener('click', uploadImage)
document.getElementById('fetchImages').addEventListener('click', fetchImages)