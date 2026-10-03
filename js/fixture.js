import { db } from "./firebase.js";

import {
    doc,
    onSnapshot,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

requireLogin();

const fixtureDetails =
    document.getElementById("fixtureDetails");

const adminActions =
    document.getElementById("adminActions");

const editFixtureButton =
    document.getElementById("editFixtureButton");

const deleteFixtureButton =
    document.getElementById("deleteFixtureButton");


/* =========================================================
   GET ID FROM URL
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const fixtureId =
    params.get("id");


console.log(
    "Fixture ID:",
    fixtureId
);


/* =========================================================
   CHECK ID
========================================================= */

if (!fixtureId) {

    fixtureDetails.innerHTML = `
        <h2>
            FIXTURE NOT FOUND
        </h2>

        <p>
            No fixture ID was found in the page URL.
        </p>
    `;

} else {

    loadFixture();

}


/* =========================================================
   LOAD FIXTURE
========================================================= */

function loadFixture() {

    console.log(
        "Loading Firestore fixture:",
        fixtureId
    );


    const fixtureRef =
        doc(
            db,
            "fixtures",
            fixtureId
        );


    onSnapshot(
        fixtureRef,

        function(snapshot) {

            console.log(
                "Firestore response:",
                snapshot
            );


            if (!snapshot.exists()) {

                fixtureDetails.innerHTML = `
                    <h2>
                        FIXTURE NOT FOUND
                    </h2>

                    <p>
                        Firebase connected, but this fixture does not exist.
                    </p>

                    <p>
                        ID:
                        ${fixtureId}
                    </p>
                `;

                return;

            }


            const fixture = {

                id:
                    snapshot.id,

                ...snapshot.data()

            };


            console.log(
                "Fixture data:",
                fixture
            );


            displayFixture(
                fixture
            );

        },

        function(error) {

            console.error(
                "FIREBASE ERROR:",
                error
            );


            fixtureDetails.innerHTML = `

                <h2>
                    FIREBASE ERROR
                </h2>

                <p>
                    ${error.code || "Unknown error"}
                </p>

                <p>
                    ${error.message || "Unknown Firebase error"}
                </p>

            `;

        }
    );

}


/* =========================================================
   DATE
========================================================= */

function formatDate(fixture) {

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
   TIME
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
   STATUS
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


    if (
        fixtureDate.getTime() <=
        Date.now()
    ) {

        return "COMPLETED";

    }


    return "SCHEDULED";

}


/* =========================================================
   DISPLAY
========================================================= */

function displayFixture(fixture) {

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


    const status =
        getFixtureStatus(
            fixture
        );


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


    if (
        fixture.preMatchNotes
    ) {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "stat-card";


        card.innerHTML = `

            <h2>
                PRE-MATCH NOTES
            </h2>

            <p>
                ${fixture.preMatchNotes}
            </p>

        `;


        fixtureDetails
            .parentNode
            .insertBefore(
                card,
                fixtureDetails.nextSibling
            );

    }


    if (
        fixture.generalNotes
    ) {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "stat-card";


        card.innerHTML = `

            <h2>
                GENERAL NOTES
            </h2>

            <p>
                ${fixture.generalNotes}
            </p>

        `;


        fixtureDetails
            .parentNode
            .appendChild(
                card
            );

    }


    /* =====================================================
       ADMIN
    ===================================================== */

    if (
        isAdmin()
    ) {

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
                            "Delete error:",
                            error
                        );


                        alert(
                            "Could not delete the fixture."
                        );


                        deleteFixtureButton.disabled =
                            false;

                    }

                };

        }

    }

}
