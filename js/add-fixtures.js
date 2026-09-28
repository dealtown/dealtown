import { db } from "./firebase.js";

import {
    collection,
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
   SAVE FIXTURE
   ========================================================= */

async function saveFixture() {

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

        showError(
            "Please enter the opponent."
        );

        return;

    }


    if (!date) {

        showError(
            "Please select a date."
        );

        return;

    }


    if (!time) {

        showError(
            "Please select a time."
        );

        return;

    }


    if (!homeAway) {

        showError(
            "Please select Home or Away."
        );

        return;

    }


    if (!competition) {

        showError(
            "Please select the competition."
        );

        return;

    }


    if (!status) {

        showError(
            "Please select a status."
        );

        return;

    }


    /* =====================================================
       FIXTURE ID
       ===================================================== */

    const fixtureId =
        Date.now().toString();


    /* =====================================================
       STATUS OVERRIDE
       ===================================================== */

    const statusOverride =
        status !== "SCHEDULED";


    /* =====================================================
       FIXTURE OBJECT
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


        /* =================================================
           SUCCESS
           ================================================= */

        message.style.color =
            "#8ee28e";

        message.textContent =
            "Fixture saved successfully!";


        setTimeout(
            function() {

                window.location.href =
                    "fixtures.html";

            },
            700
        );


    } catch (error) {

        console.error(
            "Could not save fixture:",
            error
        );


        showError(
            "The fixture could not be saved to Firebase."
        );

    }

}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function showError(text) {

    message.style.color =
        "#ff7070";

    message.textContent =
        text;

}


/* =========================================================
   MAKE FUNCTION AVAILABLE TO HTML
   ========================================================= */

window.saveFixture =
    saveFixture;
