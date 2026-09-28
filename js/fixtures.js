import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


/* =========================================================
   LOGIN
   ========================================================= */

requireLogin();


/* =========================================================
   ELEMENTS
   ========================================================= */

const seasonSelect =
    document.getElementById("seasonSelect");

const monthSelect =
    document.getElementById("monthSelect");

const fixtureList =
    document.getElementById("fixtureList");

const fixtureCount =
    document.getElementById("fixtureCount");


/* =========================================================
   DATA
   ========================================================= */

let fixtures = [];


/* =========================================================
   SEASONS
   ========================================================= */

const seasons = [
    "2024/25",
    "2025/26",
    "2026/27",
    "2027/28",
    "2028/29",
    "2029/30"
];


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
   SAVE SEASON
   ========================================================= */

function saveSeason() {

    localStorage.setItem(
        "selectedSeason",
        seasonSelect.value
    );

}


/* =========================================================
   GET MONTH
   ========================================================= */

function getMonthName(month) {

    const months = [
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER"
    ];

    return months[month];

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getFixtureDate(fixture) {

    if (!fixture.date) {
        return null;
    }

    const dateString =
        fixture.date + "T" +
        (fixture.time || "00:00");

    const date =
        new Date(dateString);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;

}


/* =========================================================
   AUTOMATIC STATUS
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


    const fixtureDate =
        getFixtureDate(fixture);


    if (!fixtureDate) {
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
   FORMAT DATE
   ========================================================= */

function formatDate(fixture) {

    const date =
        getFixtureDate(fixture);

    if (!date) {
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
   TEAM NAME
   ========================================================= */

function getFixtureTitle(fixture) {

    if (
        fixture.homeAway === "Away"
    ) {

        return (
            fixture.opponent +
            " vs DEAL TOWN"
        );

    }


    return (
        "DEAL TOWN vs " +
        fixture.opponent
    );

}


/* =========================================================
   DISPLAY FIXTURES
   ========================================================= */

function displayFixtures() {

    if (!fixtureList) {
        return;
    }


    const season =
        seasonSelect.value;

    const month =
        Number(monthSelect.value);


    const filteredFixtures =
        fixtures
            .filter(function(fixture) {

                if (
                    String(fixture.season) !==
                    String(season)
                ) {

                    return false;

                }


                const date =
                    getFixtureDate(fixture);


                if (!date) {
                    return false;
                }


                return (
                    date.getMonth() ===
                    month
                );

            })
            .sort(function(a, b) {

                const dateA =
                    getFixtureDate(a);

                const dateB =
                    getFixtureDate(b);

                return (
                    dateA.getTime() -
                    dateB.getTime()
                );

            });


    fixtureCount.textContent =
        filteredFixtures.length +
        (
            filteredFixtures.length === 1
                ? " FIXTURE THIS MONTH"
                : " FIXTURES THIS MONTH"
        );


    fixtureList.innerHTML = "";


    if (
        filteredFixtures.length === 0
    ) {

        fixtureList.innerHTML = `

            <div class="stat-card">

                <h2>
                    NO FIXTURES
                </h2>

                <p>
                    No fixtures are scheduled for
                    ${getMonthName(month)}
                    ${season}.
                </p>

            </div>

        `;

        return;

    }


    filteredFixtures.forEach(
        function(fixture) {

            const card =
                document.createElement("div");


            card.className =
                "stat-card fixture-card";


            const status =
                getFixtureStatus(fixture);


            const statusText =
                status;


            const competition =
                fixture.competition ||
                "FIXTURE";


            const homeAway =
                fixture.homeAway ||
                "HOME";


            card.innerHTML = `

                <h2>
                    ${getFixtureTitle(fixture)}
                </h2>

                <p>
                    ${formatDate(fixture)}
                    •
                    ${formatTime(fixture)}
                </p>

                <p>
                    ${homeAway.toUpperCase()}
                    •
                    ${competition.toUpperCase()}
                </p>

                <strong>
                    ${statusText}
                </strong>

            `;


            card.addEventListener(
                "click",
                function() {

                    window.location.href =
                        "fixture.html?id=" +
                        encodeURIComponent(
                            fixture.id
                        );

                }
            );


            fixtureList.appendChild(card);

        }
    );

}


/* =========================================================
   SEASON CHANGE
   ========================================================= */

seasonSelect.addEventListener(
    "change",
    function() {

        saveSeason();

        displayFixtures();

    }
);


/* =========================================================
   MONTH CHANGE
   ========================================================= */

monthSelect.addEventListener(
    "change",
    function() {

        displayFixtures();

    }
);


/* =========================================================
   SET INITIAL SEASON
   ========================================================= */

function setupSeason() {

    const savedSeason =
        getCurrentSeason();


    if (
        seasons.includes(
            savedSeason
        )
    ) {

        seasonSelect.value =
            savedSeason;

    }


    localStorage.setItem(
        "selectedSeason",
        seasonSelect.value
    );

}


/* =========================================================
   FIREBASE REAL-TIME LISTENER
   ========================================================= */

function startFixtureListener() {

    onSnapshot(

        collection(
            db,
            "fixtures"
        ),

        function(snapshot) {

            fixtures =
                snapshot.docs.map(
                    function(item) {

                        return {

                            id: item.id,

                            ...item.data()

                        };

                    }
                );


            displayFixtures();

        },

        function(error) {

            console.error(
                "Firebase fixtures error:",
                error
            );


            fixtureList.innerHTML = `

                <div class="stat-card">

                    <h2>
                        COULD NOT LOAD FIXTURES
                    </h2>

                    <p>
                        Please check the Firebase connection.
                    </p>

                </div>

            `;

        }

    );

}


/* =========================================================
   START
   ========================================================= */

setupSeason();

startFixtureListener();

applyViewerRestrictions();
