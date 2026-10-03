```javascript
import { db } from "./firebase.js";

import {
    doc,
    onSnapshot,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


/* =========================================================
   LOGIN
========================================================= */

requireLogin();


/* =========================================================
   ELEMENTS
========================================================= */

const fixtureDetails =
    document.getElementById("fixtureDetails");

const adminActions =
    document.getElementById("adminActions");

const editFixtureButton =
    document.getElementById("editFixtureButton");

const deleteFixtureButton =
    document.getElementById("deleteFixtureButton");


/* =========================================================
   GET FIXTURE ID
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const fixtureId =
    params.get("id");


/* =========================================================
   CHECK FIXTURE ID
========================================================= */

if (!fixtureId) {

    showError(
        "FIXTURE NOT FOUND",
        "No fixture ID was provided."
    );

} else {

    loadFixture();

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    title,
    message
) {

    if (!fixtureDetails) {
        return;
    }


    fixtureDetails.innerHTML = "";


    const heading =
        document.createElement("h2");

    heading.textContent =
        title;


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        message;


    fixtureDetails.appendChild(
        heading
    );

    fixtureDetails.appendChild(
        paragraph
    );

}


/* =========================================================
   REMOVE OLD NOTE CARDS
========================================================= */

function removeNoteCards() {

    document
        .querySelectorAll(
            ".fixture-note-card"
        )
        .forEach(
            function(card) {

                card.remove();

            }
        );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    fixture
) {

    if (!fixture.date) {

        return "DATE TBC";

    }


    const date =
        new Date(
            fixture.date +
            "T" +
            (
                fixture.time ||
                "00:00"
            )
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "DATE TBC";

    }


    return date.toLocaleDateString(
        "en-GB",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    );

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    fixture
) {

    if (!fixture.time) {

        return "TIME TBC";

    }


    const parts =
        fixture.time.split(":");


    const hours =
        Number(parts[0]);


    const minutes =
        parts[1] || "00";


    if (
        !Number.isFinite(hours) ||
        hours < 0 ||
        hours > 23
    ) {

        return "TIME TBC";

    }


    const suffix =
        hours >= 12
            ? "PM"
            : "AM";


    let displayHour =
        hours % 12;


    if (
        displayHour === 0
    ) {

        displayHour = 12;

    }


    return (
        displayHour +
        ":" +
        minutes +
        " " +
        suffix
    );

}


/* =========================================================
   GET FIXTURE STATUS
========================================================= */

function getFixtureStatus(
    fixture
) {

    /*
       Manual status override.
    */

    if (
        fixture.statusOverride === true &&
        fixture.status
    ) {

        return fixture.status;

    }


    /*
       Postponed and cancelled
       always remain manual.
    */

    if (
        fixture.status === "POSTPONED" ||
        fixture.status === "CANCELLED"
    ) {

        return fixture.status;

    }


    /*
       No date means the fixture
       cannot automatically complete.
    */

    if (!fixture.date) {

        return "SCHEDULED";

    }


    const fixtureDate =
        new Date(
            fixture.date +
            "T" +
            (
                fixture.time ||
                "00:00"
            )
        );


    if (
        isNaN(
            fixtureDate.getTime()
        )
    ) {

        return "SCHEDULED";

    }


    /*
       Automatically mark the fixture
       as completed once its scheduled
       date/time has passed.
    */

    if (
        fixtureDate.getTime() <=
        Date.now()
    ) {

        return "COMPLETED";

    }


    return "SCHEDULED";

}


/* =========================================================
   CREATE NOTE CARD
========================================================= */

function createNoteCard(
    title,
    text
) {

    if (!text) {

        return null;

    }


    const card =
        document.createElement("div");


    card.className =
        "stat-card fixture-note-card";


    const heading =
        document.createElement("h2");


    heading.textContent =
        title;


    const paragraph =
        document.createElement("p");


    /*
       Use textContent so notes are
       displayed as text rather than
       being interpreted as HTML.
    */

    paragraph.textContent =
        text;


    card.appendChild(
        heading
    );

    card.appendChild(
        paragraph
    );


    return card;

}


/* =========================================================
   DISPLAY FIXTURE
========================================================= */

function displayFixture(
    fixture
) {

    if (!fixtureDetails) {

        return;

    }


    /*
       Firebase can update the fixture
       multiple times.

       Remove old note cards first so
       they do not duplicate.
    */

    removeNoteCards();


    const status =
        getFixtureStatus(
            fixture
        );


    let title;


    if (
        fixture.homeAway === "Away"
    ) {

        title =
            (
                fixture.opponent ||
                "OPPONENT"
            ) +
            " vs DEAL TOWN";

    } else {

        title =
            "DEAL TOWN vs " +
            (
                fixture.opponent ||
                "OPPONENT"
            );

    }


    /* =====================================================
       MAIN FIXTURE INFORMATION
    ===================================================== */

    fixtureDetails.innerHTML = "";


    const heading =
        document.createElement("h1");


    heading.textContent =
        title;


    const dateTime =
        document.createElement("p");


    dateTime.textContent =
        formatDate(fixture) +
        " • " +
        formatTime(fixture);


    const statGrid =
        document.createElement("div");


    statGrid.className =
        "player-stat-grid";


    /*
       HOME / AWAY
    */

    const homeAwayBox =
        document.createElement("div");


    const homeAwayStrong =
        document.createElement("strong");


    homeAwayStrong.textContent =
        fixture.homeAway || "—";


    const homeAwaySpan =
        document.createElement("span");


    homeAwaySpan.textContent =
        "HOME / AWAY";


    homeAwayBox.appendChild(
        homeAwayStrong
    );

    homeAwayBox.appendChild(
        homeAwaySpan
    );


    /*
       COMPETITION
    */

    const competitionBox =
        document.createElement("div");


    const competitionStrong =
        document.createElement("strong");


    competitionStrong.textContent =
        fixture.competition || "—";


    const competitionSpan =
        document.createElement("span");


    competitionSpan.textContent =
        "COMPETITION";


    competitionBox.appendChild(
        competitionStrong
    );

    competitionBox.appendChild(
        competitionSpan
    );


    /*
       STATUS
    */

    const statusBox =
        document.createElement("div");


    const statusStrong =
        document.createElement("strong");


    statusStrong.textContent =
        status;


    const statusSpan =
        document.createElement("span");


    statusSpan.textContent =
        "STATUS";


    statusBox.appendChild(
        statusStrong
    );

    statusBox.appendChild(
        statusSpan
    );


    statGrid.appendChild(
        homeAwayBox
    );

    statGrid.appendChild(
        competitionBox
    );

    statGrid.appendChild(
        statusBox
    );


    fixtureDetails.appendChild(
        heading
    );

    fixtureDetails.appendChild(
        dateTime
    );

    fixtureDetails.appendChild(
        statGrid
    );


    /* =====================================================
       PRE-MATCH NOTES
    ===================================================== */

    const preMatchCard =
        createNoteCard(
            "PRE-MATCH NOTES",
            fixture.preMatchNotes
        );


    if (preMatchCard) {

        fixtureDetails
            .parentNode
            .insertBefore(
                preMatchCard,
                fixtureDetails.nextSibling
            );

    }


    /* =====================================================
       GENERAL NOTES
    ===================================================== */

    const generalCard =
        createNoteCard(
            "GENERAL NOTES",
            fixture.generalNotes
        );


    if (generalCard) {

        const allNoteCards =
            fixtureDetails
                .parentNode
                .querySelectorAll(
                    ".fixture-note-card"
                );


        const lastNoteCard =
            allNoteCards[
                allNoteCards.length - 1
            ];


        if (lastNoteCard) {

            lastNoteCard.parentNode
                .insertBefore(
                    generalCard,
                    lastNoteCard.nextSibling
                );

        } else {

            fixtureDetails
                .parentNode
                .insertBefore(
                    generalCard,
                    fixtureDetails.nextSibling
                );

        }

    }


    /* =====================================================
       ADMIN CONTROLS
    ===================================================== */

    if (
        isAdmin()
    ) {

        if (adminActions) {

            adminActions.style.display =
                "grid";

        }


        /* =================================================
           EDIT BUTTON
        ================================================= */

        if (editFixtureButton) {

            editFixtureButton.onclick =
                function() {

                    window.location.href =
                        "edit-fixture.html?id=" +
                        encodeURIComponent(
                            fixture.id
                        );

                };

        }


        /* =================================================
           DELETE BUTTON
        ================================================= */

        if (deleteFixtureButton) {

            deleteFixtureButton.onclick =
                async function() {

                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this fixture?"
                        );


                    if (!confirmed) {

                        return;

                    }


                    deleteFixtureButton.disabled =
                        true;


                    deleteFixtureButton.textContent =
                        "DELETING...";


                    try {

                        await deleteDoc(
                            doc(
                                db,
                                "fixtures",
                                fixture.id
                            )
                        );


                        window.location.href =
                            "fixtures.html";


                    } catch (error) {

                        console.error(
                            "Delete fixture error:",
                            error
                        );


                        alert(
                            "Could not delete the fixture."
                        );


                        deleteFixtureButton.disabled =
                            false;


                        deleteFixtureButton.textContent =
                            "DELETE FIXTURE";

                    }

                };

        }

    }

}


/* =========================================================
   LOAD FIXTURE FROM FIRESTORE
========================================================= */

function loadFixture() {

    if (!fixtureId) {

        return;

    }


    console.log(
        "Loading fixture:",
        fixtureId
    );


    const fixtureReference =
        doc(
            db,
            "fixtures",
            fixtureId
        );


    onSnapshot(

        fixtureReference,

        function(snapshot) {

            console.log(
                "Fixture received:",
                snapshot.id
            );


            if (
                !snapshot.exists()
            ) {

                showError(
                    "FIXTURE NOT FOUND",
                    "This fixture could not be found in Firestore."
                );

                removeNoteCards();

                return;

            }


            const fixture = {

                id:
                    snapshot.id,

                ...snapshot.data()

            };


            displayFixture(
                fixture
            );

        },


        function(error) {

            console.error(
                "Firebase fixture error:",
                error
            );


            showError(
                "COULD NOT LOAD FIXTURE",
                "Firebase error: " +
                error.code +
                " — " +
                error.message
            );


            removeNoteCards();

        }

    );

}
```

This version specifically fixes the **duplicate notes after Firestore `onSnapshot()` updates**, safely handles the notes as text, and keeps your admin edit/delete functionality intact.
