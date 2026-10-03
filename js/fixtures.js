```javascript
import { db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


/* =========================================================
   LOGIN
========================================================= */

requireLogin();


/* =========================================================
   ELEMENTS
========================================================= */

const fixtureList =
    document.getElementById("fixtureList");

const seasonSelect =
    document.getElementById("seasonSelect");

const monthSelect =
    document.getElementById("monthSelect");

const fixtureCount =
    document.getElementById("fixtureCount");

const addFixtureButton =
    document.getElementById("addFixtureButton");


/* =========================================================
   DATA
========================================================= */

let allFixtures = [];


/* =========================================================
   ADMIN ADD FIXTURE BUTTON
========================================================= */

if (addFixtureButton) {

    if (isAdmin()) {

        addFixtureButton.style.display = "block";

        addFixtureButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "add-fixture.html";

            }
        );

    } else {

        addFixtureButton.style.display =
            "none";

    }

}


/* =========================================================
   CREATE MESSAGE CARD
========================================================= */

function createMessageCard(title, message) {

    const card =
        document.createElement("div");

    card.className =
        "stat-card";


    const heading =
        document.createElement("h2");

    heading.textContent =
        title;


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        message;


    card.appendChild(
        heading
    );

    card.appendChild(
        paragraph
    );


    return card;

}


/* =========================================================
   LOAD FIXTURES
========================================================= */

function loadFixtures() {

    if (!fixtureList) {

        console.error(
            "fixtureList element was not found."
        );

        return;
    }


    fixtureList.innerHTML = "";


    const loadingCard =
        createMessageCard(
            "LOADING FIXTURES...",
            "Please wait while the fixtures load."
        );


    fixtureList.appendChild(
        loadingCard
    );


    const fixturesReference =
        collection(
            db,
            "fixtures"
        );


    const fixturesQuery =
        query(
            fixturesReference,
            orderBy(
                "date",
                "asc"
            )
        );


    onSnapshot(
        fixturesQuery,

        function (snapshot) {

            allFixtures = [];


            snapshot.forEach(
                function (documentSnapshot) {

                    const fixture = {
                        id: documentSnapshot.id,
                        ...documentSnapshot.data()
                    };


                    allFixtures.push(
                        fixture
                    );

                }
            );


            console.log(
                "Fixtures loaded:",
                allFixtures.length
            );


            displayFixtures();

        },

        function (error) {

            console.error(
                "FIREBASE FIXTURES ERROR:",
                error
            );


            fixtureList.innerHTML =
                "";


            const errorMessage =
                createMessageCard(
                    "COULD NOT LOAD FIXTURES",
                    "Firebase error: " +
                    (
                        error.code ||
                        "UNKNOWN"
                    ) +
                    " - " +
                    (
                        error.message ||
                        "Unknown Firebase error."
                    )
                );


            fixtureList.appendChild(
                errorMessage
            );


            if (fixtureCount) {

                fixtureCount.textContent =
                    "0 fixtures";

            }

        }
    );

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

function formatTime(fixture) {

    if (!fixture.time) {

        return "TIME TBC";

    }


    const parts =
        String(
            fixture.time
        ).split(":");


    const hours =
        Number(
            parts[0]
        );


    const minutes =
        parts[1] ||
        "00";


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
   GET SEASON
========================================================= */

function getFixtureSeason(fixture) {

    if (fixture.season) {

        return String(
            fixture.season
        );

    }


    if (!fixture.date) {

        return "";

    }


    const date =
        new Date(
            fixture.date +
            "T00:00"
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        date.getMonth() + 1;


    if (
        month >= 8
    ) {

        return (
            year +
            "/" +
            String(
                year + 1
            ).slice(-2)
        );

    }


    return (
        (year - 1) +
        "/" +
        String(
            year
        ).slice(-2)
    );

}


/* =========================================================
   GET MONTH
========================================================= */

function getFixtureMonth(fixture) {

    if (!fixture.date) {

        return null;

    }


    const parts =
        String(
            fixture.date
        ).split("-");


    if (
        parts.length < 2
    ) {

        return null;

    }


    const month =
        Number(
            parts[1]
        );


    if (
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
    ) {

        return null;

    }


    return month;

}


/* =========================================================
   FILTER FIXTURES
========================================================= */

function getFilteredFixtures() {

    const selectedSeason =
        seasonSelect
            ? seasonSelect.value
            : "2026/27";


    const selectedMonth =
        monthSelect
            ? monthSelect.value
            : "all";


    return allFixtures.filter(
        function (fixture) {

            const fixtureSeason =
                getFixtureSeason(
                    fixture
                );


            if (
                selectedSeason &&
                fixtureSeason &&
                fixtureSeason !==
                selectedSeason
            ) {

                return false;

            }


            if (
                selectedMonth &&
                selectedMonth !== "all"
            ) {

                const fixtureMonth =
                    getFixtureMonth(
                        fixture
                    );


                if (
                    fixtureMonth !==
                    Number(
                        selectedMonth
                    )
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* =========================================================
   CREATE FIXTURE CARD
========================================================= */

function createFixtureCard(fixture) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "stat-card fixture-card";


    card.style.cursor =
        "pointer";


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


    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    const heading =
        document.createElement(
            "h2"
        );


    heading.textContent =
        title;


    /* -----------------------------------------------------
       DATE
    ----------------------------------------------------- */

    const dateText =
        document.createElement(
            "p"
        );


    dateText.textContent =
        formatDate(
            fixture
        ) +
        " • " +
        formatTime(
            fixture
        );


    /* -----------------------------------------------------
       COMPETITION
    ----------------------------------------------------- */

    const competition =
        document.createElement(
            "p"
        );


    competition.textContent =
        fixture.competition ||
        "Competition TBC";


    /* -----------------------------------------------------
       STATUS
    ----------------------------------------------------- */

    const statusText =
        document.createElement(
            "strong"
        );


    statusText.textContent =
        status;


    /* -----------------------------------------------------
       HOME / AWAY
    ----------------------------------------------------- */

    const homeAway =
        document.createElement(
            "span"
        );


    homeAway.textContent =
        fixture.homeAway ||
        "HOME";


    /* -----------------------------------------------------
       ADD TO CARD
    ----------------------------------------------------- */

    card.appendChild(
        heading
    );

    card.appendChild(
        dateText
    );

    card.appendChild(
        competition
    );

    card.appendChild(
        statusText
    );

    card.appendChild(
        document.createElement(
            "br"
        )
    );

    card.appendChild(
        homeAway
    );


    /* -----------------------------------------------------
       OPEN FIXTURE
    ----------------------------------------------------- */

    card.addEventListener(
        "click",
        function () {

            window.location.href =
                "fixture.html?id=" +
                encodeURIComponent(
                    fixture.id
                );

        }
    );


    /* =====================================================
       ADMIN CONTROLS
    ===================================================== */

    if (isAdmin()) {

        const adminArea =
            document.createElement(
                "div"
            );


        adminArea.className =
            "fixture-admin-actions";


        adminArea.style.marginTop =
            "15px";


        adminArea.style.display =
            "flex";


        adminArea.style.gap =
            "10px";


        /* -------------------------------------------------
           EDIT BUTTON
        ------------------------------------------------- */

        const editButton =
            document.createElement(
                "button"
            );


        editButton.type =
            "button";


        editButton.textContent =
            "EDIT";


        editButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                window.location.href =
                    "edit-fixture.html?id=" +
                    encodeURIComponent(
                        fixture.id
                    );

            }
        );


        /* -------------------------------------------------
           DELETE BUTTON
        ------------------------------------------------- */

        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.type =
            "button";


        deleteButton.textContent =
            "DELETE";


        deleteButton.addEventListener(
            "click",
            async function (event) {

                event.stopPropagation();


                const confirmed =
                    confirm(
                        "Are you sure you want to delete this fixture?"
                    );


                if (!confirmed) {

                    return;

                }


                deleteButton.disabled =
                    true;


                deleteButton.textContent =
                    "DELETING...";


                try {

                    await deleteDoc(
                        doc(
                            db,
                            "fixtures",
                            fixture.id
                        )
                    );


                } catch (error) {

                    console.error(
                        "DELETE FIXTURE ERROR:",
                        error
                    );


                    alert(
                        "Could not delete this fixture. " +
                        (
                            error.message ||
                            "Unknown Firebase error."
                        )
                    );


                    deleteButton.disabled =
                        false;


                    deleteButton.textContent =
                        "DELETE";

                }

            }
        );


        adminArea.appendChild(
            editButton
        );


        adminArea.appendChild(
            deleteButton
        );


        card.appendChild(
            adminArea
        );

    }


    return card;

}


/* =========================================================
   DISPLAY FIXTURES
========================================================= */

function displayFixtures() {

    if (!fixtureList) {

        return;

    }


    fixtureList.innerHTML =
        "";


    const filteredFixtures =
        getFilteredFixtures();


    /* -----------------------------------------------------
       SORT BY DATE
    ----------------------------------------------------- */

    filteredFixtures.sort(
        function (a, b) {

            const dateA =
                new Date(
                    (
                        a.date ||
                        "9999-12-31"
                    ) +
                    "T" +
                    (
                        a.time ||
                        "23:59"
                    )
                );


            const dateB =
                new Date(
                    (
                        b.date ||
                        "9999-12-31"
                    ) +
                    "T" +
                    (
                        b.time ||
                        "23:59"
                    )
                );


            return (
                dateA.getTime() -
                dateB.getTime()
            );

        }
    );


    /* -----------------------------------------------------
       COUNT
    ----------------------------------------------------- */

    if (fixtureCount) {

        fixtureCount.textContent =
            filteredFixtures.length +
            (
                filteredFixtures.length === 1
                    ? " fixture"
                    : " fixtures"
            );

    }


    /* -----------------------------------------------------
       NO FIXTURES
    ----------------------------------------------------- */

    if (
        filteredFixtures.length === 0
    ) {

        const emptyCard =
            createMessageCard(
                "NO FIXTURES",
                "There are no fixtures matching the selected season and month."
            );


        fixtureList.appendChild(
            emptyCard
        );


        return;

    }


    /* -----------------------------------------------------
       DISPLAY FIXTURES
    ----------------------------------------------------- */

    filteredFixtures.forEach(
        function (fixture) {

            const card =
                createFixtureCard(
                    fixture
                );


            fixtureList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SEASON CHANGE
========================================================= */

if (seasonSelect) {

    seasonSelect.addEventListener(
        "change",
        function () {

            displayFixtures();

        }
    );

}


/* =========================================================
   MONTH CHANGE
========================================================= */

if (monthSelect) {

    monthSelect.addEventListener(
        "change",
        function () {

            displayFixtures();

        }
    );

}


/* =========================================================
   START
========================================================= */

loadFixtures();
```
