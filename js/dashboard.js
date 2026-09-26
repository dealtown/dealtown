requireLogin();

const seasonSelect =
    document.getElementById("seasonSelect");

const seasonTitle =
    document.getElementById("seasonTitle");


function getMatches() {

    return JSON.parse(
        localStorage.getItem("matches")
    ) || [];

}


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


function calculateStats() {

    const selectedSeason =
        getSelectedSeason();


    const matches =
        getMatches()
            .filter(function(match) {

                return match.season === selectedSeason;

            });


    let wins = 0;

    let draws = 0;

    let losses = 0;

    let goalsFor = 0;

    let goalsAgainst = 0;


    matches.forEach(function(match) {

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
        matches.length;


    const winRate =
        totalMatches > 0

            ? Math.round(
                (wins / totalMatches) * 100
            )

            : 0;


    const goalDifference =
        goalsFor - goalsAgainst;


    /*
     * Sort matches chronologically
     * for streak calculations.
     */

    const sortedMatches =
        matches
            .slice()
            .sort(function(a, b) {

                return (
                    new Date(a.date) -
                    new Date(b.date)
                );

            });


    /*
     * CURRENT WINNING RUN
     *
     * Starts from the most recent match
     * and stops at the first non-win.
     */

    let winningRun = 0;


    for (
        let i = sortedMatches.length - 1;
        i >= 0;
        i--
    ) {

        const match =
            sortedMatches[i];


        const scored =
            Number(match.goalsFor) || 0;

        const conceded =
            Number(match.goalsAgainst) || 0;


        if (scored > conceded) {

            winningRun++;

        } else {

            break;

        }

    }


    /*
     * CURRENT UNBEATEN RUN
     *
     * Counts consecutive wins or draws
     * from the latest match backwards.
     */

    let unbeatenRun = 0;


    for (
        let i = sortedMatches.length - 1;
        i >= 0;
        i--
    ) {

        const match =
            sortedMatches[i];


        const scored =
            Number(match.goalsFor) || 0;

        const conceded =
            Number(match.goalsAgainst) || 0;


        if (scored >= conceded) {

            unbeatenRun++;

        } else {

            break;

        }

    }


    /*
     * UPDATE DASHBOARD
     */

    document.getElementById(
        "matches"
    ).textContent =
        totalMatches;


    document.getElementById(
        "wins"
    ).textContent =
        wins;


    document.getElementById(
        "draws"
    ).textContent =
        draws;


    document.getElementById(
        "losses"
    ).textContent =
        losses;


    document.getElementById(
        "winRate"
    ).textContent =
        winRate + "%";


    document.getElementById(
        "goals"
    ).textContent =
        goalsFor + " - " + goalsAgainst;


    document.getElementById(
        "goalDifference"
    ).textContent =
        goalDifference;


    document.getElementById(
        "winningRun"
    ).textContent =
        winningRun;


    document.getElementById(
        "unbeatenRun"
    ).textContent =
        unbeatenRun;


    seasonTitle.textContent =
        selectedSeason + " SEASON";

}


/*
 * LOAD SAVED SEASON
 */

const savedSeason =
    getSelectedSeason();


seasonSelect.value =
    savedSeason;


/*
 * CHANGE SEASON
 */

seasonSelect.addEventListener(
    "change",
    function() {

        setSelectedSeason(
            seasonSelect.value
        );

        calculateStats();

        /*
         * Refresh the page so every
         * page using the selected season
         * stays synchronised.
         */

        window.location.reload();

    }
);


calculateStats();

applyViewerRestrictions();