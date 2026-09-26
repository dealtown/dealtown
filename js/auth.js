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
