```javascript
import { db } from "./firebase.js";

import {
    collection,
    onSnapshot,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


requireLogin();


const fixtureList = document.getElementById("fixtureList");
const seasonSelect = document.getElementById("seasonSelect");
const monthSelect = document.getElementById("monthSelect");
const fixtureCount = document.getElementById("fixtureCount");
const addFixtureButton = document.getElementById("addFixtureButton");


let allFixtures = [];


/* =========================================================
   ADMIN ADD FIXTURE
========================================================= */

if (addFixtureButton) {

    if (isAdmin()) {

        addFixtureButton.style.display = "block";

        addFixtureButton.addEventListener("click", function () {
            window.location.href = "add-fixture.html";
        });

    } else {

        addFixtureButton.style.display = "none";

    }

}


/* =========================================================
   LOAD FIXTURES
========================================================= */

function loadFixtures() {

    if (!fixtureList) {
        console.error("fixtureList was not found.");
        return;
    }

    fixtureList.innerHTML = "";

    const loadingCard = document.createElement("div");
    loadingCard.className = "stat-card";

    const loadingTitle = document.createElement("h2");
    loadingTitle.textContent = "LOADING FIXTURES...";

    const loadingText = document.createElement("p");
    loadingText.textContent = "Please wait while the fixtures load.";

    loadingCard.appendChild(loadingTitle);
    loadingCard.appendChild(loadingText);

    fixtureList.appendChild(loadingCard);


    const fixturesRef = collection(db, "fixtures");


    onSnapshot(
        fixturesRef,

        function (snapshot) {

            allFixtures = [];

            snapshot.forEach(function (item) {

                const fixture = {
                    id: item.id,
                    ...item.data()
                };

                allFixtures.push(fixture);

            });

            displayFixtures();

        },

        function (error) {

            console.error("FIREBASE FIXTURES ERROR:", error);

            fixtureList.innerHTML = "";

            const errorCard = document.createElement("div");
            errorCard.className = "stat-card";

            const errorTitle = document.createElement("h2");
            errorTitle.textContent = "COULD NOT LOAD FIXTURES";

            const errorText = document.createElement("p");
            errorText.textContent =
                "Firebase error: " +
                (error.message || "Unknown error.");

            errorCard.appendChild(errorTitle);
            errorCard.appendChild(errorText);

            fixtureList.appendChild(errorCard);

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

    const date = new Date(
        fixture.date + "T" + (fixture.time || "00:00")
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

    const parts = String(fixture.time).split(":");

    const hours = Number(parts[0]);
    const minutes = parts[1] || "00";

    if (!Number.isFinite(hours)) {
        return "TIME TBC";
    }

    const suffix = hours >= 12 ? "PM" : "AM";

    let displayHour = hours % 12;

    if (displayHour === 0) {
        displayHour = 12;
    }

    return displayHour + ":" + minutes + " " + suffix;

}


/* =========================================================
   STATUS
========================================================= */

function getStatus(fixture) {

    if (fixture.statusOverride === true && fixture.status) {
        return fixture.status;
    }

    if (fixture.status === "POSTPONED") {
        return "POSTPONED";
    }

    if (fixture.status === "CANCELLED") {
        return "CANCELLED";
    }

    if (!fixture.date) {
        return "SCHEDULED";
    }

    const date = new Date(
        fixture.date + "T" + (fixture.time || "00:00")
    );

    if (isNaN(date.getTime())) {
        return "SCHEDULED";
    }

    if (date.getTime() <= Date.now()) {
        return "COMPLETED";
    }

    return "SCHEDULED";

}


/* =========================================================
   SEASON
========================================================= */

function getSeason(fixture) {

    if (fixture.season) {
        return String(fixture.season);
    }

    if (!fixture.date) {
        return "";
    }

    const date = new Date(fixture.date + "T00:00");

    if (isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= 8) {
        return (
            year +
            "/" +
            String(year + 1).slice(-2)
        );
    }

    return (
        (year - 1) +
        "/" +
        String(year).slice(-2)
    );

}


/* =========================================================
   MONTH
========================================================= */

function getMonth(fixture) {

    if (!fixture.date) {
        return null;
    }

    const parts = String(fixture.date).split("-");

    if (parts.length < 2) {
        return null;
    }

    const month = Number(parts[1]);

    if (!Number.isInteger(month)) {
        return null;
    }

    return month;

}


/* =========================================================
   FILTER
========================================================= */

function filterFixtures() {

    const selectedSeason =
        seasonSelect ? seasonSelect.value : "2026/27";

    const selectedMonth =
        monthSelect ? monthSelect.value : "all";


    return allFixtures.filter(function (fixture) {

        const fixtureSeason = getSeason(fixture);

        if (
            selectedSeason &&
            fixtureSeason &&
            fixtureSeason !== selectedSeason
        ) {
            return false;
        }


        if (
            selectedMonth &&
            selectedMonth !== "all"
        ) {

            const fixtureMonth = getMonth(fixture);

            if (
                fixtureMonth !== Number(selectedMonth)
            ) {
                return false;
            }

        }


        return true;

    });

}


/* =========================================================
   CREATE FIXTURE
========================================================= */

function createFixture(fixture) {

    const card = document.createElement("div");

    card.className = "stat-card fixture-card";

    card.style.cursor = "pointer";


    let title = "";

    if (fixture.homeAway === "Away") {

        title =
            (fixture.opponent || "OPPONENT") +
            " vs DEAL TOWN";

    } else {

        title =
            "DEAL TOWN vs " +
            (fixture.opponent || "OPPONENT");

    }


    const titleElement =
        document.createElement("h2");

    titleElement.textContent = title;


    const dateElement =
        document.createElement("p");

    dateElement.textContent =
        formatDate(fixture) +
        " • " +
        formatTime(fixture);


    const competitionElement =
        document.createElement("p");

    competitionElement.textContent =
        fixture.competition || "Competition TBC";


    const statusElement =
        document.createElement("strong");

    statusElement.textContent =
        getStatus(fixture);


    const homeAwayElement =
        document.createElement("span");

    homeAwayElement.textContent =
        fixture.homeAway || "HOME";


    card.appendChild(titleElement);
    card.appendChild(dateElement);
    card.appendChild(competitionElement);
    card.appendChild(statusElement);
    card.appendChild(document.createElement("br"));
    card.appendChild(homeAwayElement);


    card.addEventListener("click", function () {

        window.location.href =
            "fixture.html?id=" +
            encodeURIComponent(fixture.id);

    });


    /* =====================================================
       ADMIN BUTTONS
    ===================================================== */

    if (isAdmin()) {

        const buttons = document.createElement("div");

        buttons.style.marginTop = "15px";
        buttons.style.display = "flex";
        buttons.style.gap = "10px";


        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "EDIT";


        editButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                window.location.href =
                    "edit-fixture.html?id=" +
                    encodeURIComponent(fixture.id);

            }
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "DELETE";


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


                deleteButton.disabled = true;
                deleteButton.textContent = "DELETING...";


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
                        "Could not delete the fixture. " +
                        (error.message || "")
                    );

                    deleteButton.disabled = false;
                    deleteButton.textContent = "DELETE";

                }

            }
        );


        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);

        card.appendChild(buttons);

    }


    return card;

}


/* =========================================================
   DISPLAY
========================================================= */

function displayFixtures() {

    if (!fixtureList) {
        return;
    }


    fixtureList.innerHTML = "";


    const fixtures =
        filterFixtures();


    fixtures.sort(function (a, b) {

        const dateA = new Date(
            (a.date || "9999-12-31") +
            "T" +
            (a.time || "23:59")
        );

        const dateB = new Date(
            (b.date || "9999-12-31") +
            "T" +
            (b.time || "23:59")
        );

        return dateA.getTime() - dateB.getTime();

    });


    if (fixtureCount) {

        fixtureCount.textContent =
            fixtures.length +
            (
                fixtures.length === 1
                    ? " fixture"
                    : " fixtures"
            );

    }


    if (fixtures.length === 0) {

        const emptyCard =
            document.createElement("div");

        emptyCard.className =
            "stat-card";


        const emptyTitle =
            document.createElement("h2");

        emptyTitle.textContent =
            "NO FIXTURES";


        const emptyText =
            document.createElement("p");

        emptyText.textContent =
            "There are no fixtures matching the selected filters.";


        emptyCard.appendChild(emptyTitle);
        emptyCard.appendChild(emptyText);

        fixtureList.appendChild(emptyCard);

        return;

    }


    fixtures.forEach(function (fixture) {

        const card =
            createFixture(fixture);

        fixtureList.appendChild(card);

    });

}


/* =========================================================
   FILTER EVENTS
========================================================= */

if (seasonSelect) {

    seasonSelect.addEventListener(
        "change",
        function () {
            displayFixtures();
        }
    );

}


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
