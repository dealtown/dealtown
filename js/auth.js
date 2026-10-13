var ADMIN_CODE = "DEALADMIN";
var VIEWER_CODE = "DEALHOOPS";

function login() {
    var input = document.getElementById("accessCode");
    var error = document.getElementById("errorMessage");

    var code = input.value.trim();

    if (code === ADMIN_CODE) {
        sessionStorage.setItem("accessLevel", "admin");
        window.location.href = "dashboard.html";
        return;
    }

    if (code === VIEWER_CODE) {
        sessionStorage.setItem("accessLevel", "viewer");
        window.location.href = "dashboard.html";
        return;
    }

    error.textContent = "Invalid access code.";
}

function getAccessLevel() {
    return sessionStorage.getItem("accessLevel");
}

function isAdmin() {
    return getAccessLevel() === "admin";
}

function isViewer() {
    return getAccessLevel() === "viewer";
}

function requireLogin() {
    var accessLevel = getAccessLevel();

    if (
        accessLevel !== "admin" &&
        accessLevel !== "viewer"
    ) {
        window.location.href = "index.html";
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        window.location.href = "dashboard.html";
    }
}

function applyViewerRestrictions() {
    if (!isViewer()) {
        return;
    }

    var adminElements =
        document.querySelectorAll(".admin-only");

    adminElements.forEach(function(element) {
        element.style.display = "none";
    });
}

function logout() {
    sessionStorage.removeItem("accessLevel");
    window.location.href = "index.html";
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        var path = window.location.pathname;

        if (
            !path.endsWith("index.html") &&
            !path.endsWith("/")
        ) {
            requireLogin();
        }

        applyViewerRestrictions();
    }
);


const music = document.getElementById("background-music");
const volumeSlider = document.getElementById("music-volume");
const volumeValue = document.getElementById("volume-value");

if (music && volumeSlider) {
    // Set the starting volume to 30%.
    music.volume = Number(volumeSlider.value) / 100;

    volumeSlider.addEventListener("input", () => {
        const volume = Number(volumeSlider.value);

        music.volume = volume / 100;

        if (volumeValue) {
            volumeValue.textContent = `${volume}%`;
        }
    });
}
