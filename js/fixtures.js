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

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const fixtureId =
    urlParams.get("id");


/* =========================================================
   CHECK FIXTURE ID
========================================================= */

if (!fixtureId) {

    showError(
        "NO FIXTURE ID",
        "No fixture ID was provided in the page address."
    );

} else {

    loadFixture();

}


/* =========================================================
   ERROR DISPLAY
========================================================= */

function showError(title, message) {

    if (!fixtureDetails) {
        return;
    }

    fixtureDetails.innerHTML = `

        <h2>
            ${title}
        </h2>

        <p>
            ${message}
        </p>

    `;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(fixture) {

    if (!fixture.date) {
        return "DATE TBC";
    }


    const date =
        new Date(
            fixture.date +
            "T" +
            (fixture.time || "00:00")
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

function formatTime(fixture) {

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
        !Number.isFinite(hours)
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
   GET STATUS
========================================================= */

function getFixtureStatus(fixture) {

    /*
       Admin status override.
    */

    if (
        fixture.statusOverride === true &&
        fixture.status
    ) {

        return fixture.status;

    }


    /*
       These statuses always remain
       manually controlled.
    */

    if (
        fixture.status === "POSTPONED" ||
        fixture.status === "CANCELLED"
    ) {

        return fixture.status;

    }


    /*
       Automatic completion.
    */

    if (!fixture.date) {
        return "SCHEDULED";
    }


    const fixtureDate =
        new Date(
            fixture.date +
            "T" +
            (fixture.time || "00:00")
        );


    if (
        isNaN(
            fixtureDate.getTime()
        )
    ) {

        return "SCHEDULED";

    }


    if (
        fixtureDate.getTime() <=
        Date.now()
    ) {

        return "COMPLETED";

    }


    return "SCHEDULED";

}


/* =========================================================
   DISPLAY FIXTURE
========================================================= */

function displayFixture(fixture) {

    if (!fixtureDetails) {
        return;
    }


    const status =
        getFixtureStatus(
            fixture
        );


    let title;


    if (
        fixture.homeAway ===
        "Away"
    ) {

        title =
            fixture.opponent +
            " vs DEAL TOWN";

    } else {

        title =
            "DEAL TOWN vs " +
            fixture.opponent;

    }


    const preMatchNotes =
        fixture.preMatchNotes ||
        "";


    const generalNotes =
        fixture.generalNotes ||
        "";


    fixtureDetails.innerHTML = `

        <h1>
            ${title}
        </h1>


        <p>
            ${formatDate(fixture)}
            •
            ${formatTime(fixture)}
        </p>


        <div class="player-stat-grid">

            <div>

                <strong>
                    ${fixture.homeAway || "—"}
                </strong>

                <span>
                    HOME / AWAY
                </span>

            </div>


            <div>

                <strong>
                    ${fixture.competition || "—"}
                </strong>

                <span>
                    COMPETITION
                </span>

            </div>


            <div>

                <strong>
                    ${status}
                </strong>

                <span>
                    STATUS
                </span>

            </div>

        </div>

    `;


    /*
       PRE-MATCH NOTES
    */

    if (preMatchNotes) {

        const notesCard =
            document.createElement(
                "div"
            );

        notesCard.className =
            "stat-card";


        notesCard.innerHTML = `

            <h2>
                PRE-MATCH NOTES
            </h2>

            <p>
                ${preMatchNotes}
            </p>

        `;


        fixtureDetails
            .parentNode
            .insertBefore(
                notesCard,
                fixtureDetails.nextSibling
            );

    }


    /*
       GENERAL NOTES
    */

    if (generalNotes) {

        const generalCard =
            document.createElement(
                "div"
            );

        generalCard.className =
            "stat-card";


        generalCard.innerHTML = `

            <h2>
                GENERAL NOTES
            </h2>

            <p>
                ${generalNotes}
            </p>

        `;


        /*
           Put it after the pre-match
           notes if they exist.
        */

        const cards =
            fixtureDetails
                .parentNode
                .querySelectorAll(
                    ".stat-card"
                );


        const lastCard =
            cards[cards.length - 1];


        if (lastCard) {

            lastCard.parentNode
                .insertBefore(
                    generalCard,
                    lastCard.nextSibling
                );

        } else {

            fixtureDetails
                .parentNode
                .appendChild(
                    generalCard
                );

        }

    }


    /* =====================================================
       ADMIN CONTROLS
    ===================================================== */

    if (isAdmin()) {

        if (adminActions) {

            adminActions.style.display =
                "grid";

        }


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
                            "DELETE FIXTURE ERROR:",
                            error
                        );


                        alert(
                            "Could not delete the fixture. Check your Firebase connection and Firestore rules."
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


    /*
       Use the exact same Firestore
       collection as fixtures.js.
    */

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
                "Fixture loaded:",
                fixtureId
            );


            if (
                !snapshot.exists()
            ) {

                showError(
                    "FIXTURE NOT FOUND",
                    "This fixture does not exist in Firestore."
                );

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
                "FIREBASE FIXTURE ERROR:",
                error
            );


            /*
               Show the actual Firebase
               error instead of just saying
               that it cannot connect.
            */

            showError(
                "COULD NOT LOAD FIXTURE",
                "Firebase error: " +
                error.code +
                " — " +
                error.message
            );

        }

    );

}
```
