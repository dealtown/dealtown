import {
    db
} from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


requireLogin();


const seasonSelect =
    document.getElementById("seasonSelect");

const seasonTitle =
    document.getElementById("seasonTitle");


let matches = [];


/* =========================================================
   LOAD LOCAL CACHE IMMEDIATELY
   ========================================================= */

function loadLocalMatches() {

    try {

        const savedMatches =
            localStorage.getItem("matches");

        if (savedMatches) {

            const parsed =
                JSON.parse(savedMatches);

            if (Array.isArray(parsed)) {

                matches = parsed;

            }

        }

    } catch (error) {

        console.error(
            "Could not load local matches:",
            error
        );

        matches = [];

    }

}


/* =========================================================
   SEASON
   ========================================================= */

function getSelectedSeason() {

    return localStorage.getItem(
        "selectedSeason"
    ) || "2026/27";

}


function setSelectedSeason(season) {

    localStorage.setItem(
        "selectedSeason",
        season
    );

}


/* =========================================================
   CALCULATE STATS
   ========================================================= */

function calculateStats() {

    const selectedSeason =
        getSelectedSeason();


    const seasonMatches =
        matches.filter(function(match) {

            return String(match.season) ===
                String(selectedSeason);

        });


    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;


    seasonMatches.forEach(function(match) {

        const scored =
            Number(match.goalsFor) || 0;

        const conceded =
            Number(match.goalsAgainst) || 0;


        goalsFor += scored;
        goalsAgainst += conceded;


        if (scored > conceded) {

            wins++;

        } else if (scored === conceded) {

            draws++;

        } else {

            losses++;

        }

    });


    const totalMatches =
        seasonMatches.length;


    const winRate =
        totalMatches > 0
            ? Math.round(
                (wins / totalMatches) * 100
            )
            : 0;


    const goalDifference =
        goalsFor - goalsAgainst;


    /* =====================================================
       SORT FOR STREAKS
       ===================================================== */

    const sortedMatches =
        seasonMatches
            .slice()
            .sort(function(a, b) {

                return (
                    new Date(a.date) -
                    new Date(b.date)
                );

            });


    /* =====================================================
       WINNING RUN
       ===================================================== */

    let winningRun = 0;


    for (
        let i = sortedMatches.length - 1;
        i >= 0;
        i--
    ) {

        const scored =
            Number(
                sortedMatches[i].goalsFor
            ) || 0;

        const conceded =
            Number(
                sortedMatches[i].goalsAgainst
            ) || 0;


        if (scored > conceded) {

            winningRun++;

        } else {

            break;

        }

    }


    /* =====================================================
       UNBEATEN RUN
       ===================================================== */

    let unbeatenRun = 0;


    for (
        let i = sortedMatches.length - 1;
        i >= 0;
        i--
    ) {

        const scored =
            Number(
                sortedMatches[i].goalsFor
            ) || 0;

        const conceded =
            Number(
                sortedMatches[i].goalsAgainst
            ) || 0;


        if (scored >= conceded) {

            unbeatenRun++;

        } else {

            break;

        }

    }


    /* =====================================================
       UPDATE SCREEN
       ===================================================== */

    const matchesElement =
        document.getElementById("matches");

    const winsElement =
        document.getElementById("wins");

    const drawsElement =
        document.getElementById("draws");

    const lossesElement =
        document.getElementById("losses");

    const winRateElement =
        document.getElementById("winRate");

    const goalsElement =
        document.getElementById("goals");

    const goalDifferenceElement =
        document.getElementById("goalDifference");

    const winningRunElement =
        document.getElementById("winningRun");

    const unbeatenRunElement =
        document.getElementById("unbeatenRun");


    if (matchesElement)
        matchesElement.textContent =
            totalMatches;

    if (winsElement)
        winsElement.textContent =
            wins;

    if (drawsElement)
        drawsElement.textContent =
            draws;

    if (lossesElement)
        lossesElement.textContent =
            losses;

    if (winRateElement)
        winRateElement.textContent =
            winRate + "%";

    if (goalsElement)
        goalsElement.textContent =
            goalsFor + " - " + goalsAgainst;

    if (goalDifferenceElement)
        goalDifferenceElement.textContent =
            goalDifference;

    if (winningRunElement)
        winningRunElement.textContent =
            winningRun;

    if (unbeatenRunElement)
        unbeatenRunElement.textContent =
            unbeatenRun;

    if (seasonTitle)
        seasonTitle.textContent =
            selectedSeason + " SEASON";

}


/* =========================================================
   START WITH LOCAL DATA
   ========================================================= */

loadLocalMatches();

calculateStats();


/* =========================================================
   LOAD SAVED SEASON
   ========================================================= */

if (seasonSelect) {

    seasonSelect.value =
        getSelectedSeason();


    seasonSelect.addEventListener(
        "change",
        function() {

            setSelectedSeason(
                seasonSelect.value
            );

            calculateStats();

        }
    );

}


/* =========================================================
   FIREBASE REAL-TIME LISTENER
   ========================================================= */

const matchesCollection =
    collection(
        db,
        "matches"
    );


onSnapshot(
    matchesCollection,

    function(snapshot) {

        const firebaseMatches =
            snapshot.docs.map(
                function(item) {

                    return {
                        id: item.id,
                        ...item.data()
                    };

                }
            );


        /*
         * Firebase is now the main source.
         */

        matches =
            firebaseMatches;


        /*
         * Update local cache so the dashboard
         * can display immediately next time.
         */

        localStorage.setItem(
            "matches",
            JSON.stringify(matches)
        );


        calculateStats();

    },

    function(error) {

        console.error(
            "Dashboard Firebase error:",
            error
        );

        /*
         * Keep using local data if Firebase
         * temporarily cannot be reached.
         */

        calculateStats();

    }
);


applyViewerRestrictions();
