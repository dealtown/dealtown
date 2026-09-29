import { db } from "./firebase.js";

import {
    setDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


/* =========================================================
   ADMIN ACCESS
   ========================================================= */

requireAdmin();


/* =========================================================
   ELEMENTS
   ========================================================= */

const opponentInput =
    document.getElementById("opponent");

const dateInput =
    document.getElementById("date");

const timeInput =
    document.getElementById("time");

const homeAwayInput =
    document.getElementById("homeAway");

const competitionInput =
    document.getElementById("competition");

const statusInput =
    document.getElementById("status");

const preMatchNotesInput =
    document.getElementById("preMatchNotes");

const generalNotesInput =
    document.getElementById("generalNotes");

const message =
    document.getElementById("message");

const saveButton =
    document.getElementById("saveFixtureButton");


/* =========================================================
   CURRENT SEASON
   ========================================================= */

function getCurrentSeason() {

    return (
        localStorage.getItem("selectedSeason") ||
        "2026/27"
    );

}


/* =========================================================
   SHOW MESSAGE
   ========================================================= */

function showMessage(text, success) {

    if (!message) {
        return;
    }

    message.textContent =
        text;

    message.style.color =
        success
            ? "#8ee28e"
            : "#ff7070";

}


/* =========================================================
   SAVE FIXTURE
   ========================================================= */

async function saveFixture() {

    if (!isAdmin()) {

        showMessage(
            "Admin access is required.",
            false
        );

        return;

    }


    const opponent =
        opponentInput.value.trim();

    const date =
        dateInput.value;

    const time =
        timeInput.value;

    const homeAway =
        homeAwayInput.value;

    const competition =
        competitionInput.value;

    const status =
        statusInput.value;

    const preMatchNotes =
        preMatchNotesInput.value.trim();

    const generalNotes =
        generalNotesInput.value.trim();


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!opponent) {

        showMessage(
            "Please enter the opponent.",
            false
        );

        opponentInput.focus();

        return;

    }


    if (!date) {

        showMessage(
            "Please select a date.",
            false
        );

        dateInput.focus();

        return;

    }


    if (!time) {

        showMessage(
            "Please select a time.",
            false
        );

        timeInput.focus();

        return;

    }


    if (!homeAway) {

        showMessage(
            "Please select Home or Away.",
            false
        );

        homeAwayInput.focus();

        return;

    }


    if (!competition) {

        showMessage(
            "Please select a competition.",
            false
        );

        competitionInput.focus();

        return;

    }


    if (!status) {

        showMessage(
            "Please select a status.",
            false
        );

        statusInput.focus();

        return;

    }


    /* =====================================================
       DISABLE BUTTON
       ===================================================== */

    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "SAVING...";

    }


    /* =====================================================
       CREATE ID
       ===================================================== */

    const fixtureId =
        Date.now().toString();


    /* =====================================================
       STATUS OVERRIDE
       ===================================================== */

    const statusOverride =
        status !== "SCHEDULED";


    /* =====================================================
       CREATE FIXTURE
       ===================================================== */

    const fixture = {

        id:
            fixtureId,

        season:
            getCurrentSeason(),

        opponent:
            opponent,

        date:
            date,

        time:
            time,

        homeAway:
            homeAway,

        competition:
            competition,

        status:
            status,

        statusOverride:
            statusOverride,

        preMatchNotes:
            preMatchNotes,

        generalNotes:
            generalNotes,

        createdAt:
            new Date().toISOString()

    };


    /* =====================================================
       SAVE TO FIRESTORE
       ===================================================== */

    try {

        await setDoc(

            doc(
                db,
                "fixtures",
                fixtureId
            ),

            fixture

        );


        showMessage(
            "Fixture saved successfully!",
            true
        );


        if (saveButton) {

            saveButton.textContent =
                "SAVED";

        }


        setTimeout(
            function() {

                window.location.href =
                    "fixtures.html";

            },
            700
        );


    } catch (error) {

        console.error(
            "Firebase fixture error:",
            error
        );


        showMessage(
            "Could not save fixture. Check your Firebase connection and Firestore rules.",
            false
        );


        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "SAVE FIXTURE";

        }

    }

}


/* =========================================================
   SAVE BUTTON
   ========================================================= */

if (saveButton) {

    saveButton.addEventListener(
        "click",
        saveFixture
    );

}
