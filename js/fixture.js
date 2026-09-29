import { db } from "./firebase.js";

import {
    doc,
    getDoc,
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
   CHECK ID
   ========================================================= */

if (!fixtureId) {

    fixtureDetails.innerHTML = `

        <h2>
            FIXTURE NOT FOUND
        </h2>

        <p>
            No fixture ID was provided.
        </p>

    `;

} else {

    loadFixture();

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

    if (isNaN(date.getTime())) {
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

    if (!Number.isFinite(hours)) {
        return "TIME TBC";
    }

    const suffix =
        hours >= 12
            ? "PM"
            : "AM";

    let displayHour =
        hours % 12;

    if (displayHour === 0) {
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

    if (
        fixture.statusOverride === true &&
        fixture.status
    ) {

        return fixture.status;

    }


    if (
        fixture.status === "POSTPONED" ||
        fixture.status === "CANCELLED"
    ) {

        return fixture.status;

    }


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

    const status =
        getFixtureStatus(fixture);


    const title =
        fixture.homeAway === "Away"
            ? fixture.opponent +
              " vs DEAL TOWN"
            : "DEAL TOWN vs " +
              fixture.opponent;


    const preMatchNotes =
        fixture.preMatchNotes ||
        "";


    const generalNotes =
        fixture.generalNotes ||
        "";


    let notesHTML = "";


    if (preMatchNotes) {

        notesHTML += `

            <div class="stat-card">

                <h2>
                    PRE-MATCH NOTES
                </h2>

                <p>
                    ${preMatchNotes}
                </p>

            </div>

        `;

    }


    if (generalNotes) {

        notesHTML += `

            <div class="stat-card">

                <h2>
                    GENERAL NOTES
                </h2>

                <p>
                    ${generalNotes}
                </p>

            </div>

        `;

    }


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
     * Notes are displayed underneath
     */

    if (notesHTML) {

        fixtureDetails.insertAdjacentHTML(
            "afterend",
            notesHTML
        );

    }


    /*
     * Admin buttons
     */

    if (isAdmin()) {

        adminActions.style.display =
            "grid";

        editFixtureButton.addEventListener(
            "click",
            function() {

                window.location.href =
                    "add-fixture.html?id=" +
                    encodeURIComponent(
                        fixture.id
                    );

            }
        );


        deleteFixtureButton.addEventListener(
            "click",
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

                }

            }
        );

    }

}


/* =========================================================
   LOAD FIXTURE
   ========================================================= */

async function loadFixture() {

    try {

        const fixtureRef =
            doc(
                db,
                "fixtures",
                fixtureId
            );


        const fixtureSnapshot =
            await getDoc(
                fixtureRef
            );


        if (
            !fixtureSnapshot.exists()
        ) {

            fixtureDetails.innerHTML = `

                <h2>
                    FIXTURE NOT FOUND
                </h2>

                <p>
                    This fixture may have been deleted.
                </p>

            `;

            return;

        }


        const fixture = {

            id:
                fixtureSnapshot.id,

            ...fixtureSnapshot.data()

        };


        displayFixture(
            fixture
        );


    } catch (error) {

        console.error(
            "Firebase fixture error:",
            error
        );


        fixtureDetails.innerHTML = `

            <h2>
                COULD NOT LOAD FIXTURE
            </h2>

            <p>
                Please check the Firebase connection.
            </p>

        `;

    }

}
