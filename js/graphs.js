import {
    db
} from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

requireLogin();


/* =========================================================
   DATA
   ========================================================= */

let matches = [];

let players = [];

let goalsScoredChart = null;

let resultsChart = null;

let goalsConcededChart = null;

let appearancesChart = null;

let goalsChart = null;

let assistsChart = null;

let potmChart = null;


/* =========================================================
   CURRENT SEASON
   ========================================================= */

function getCurrentSeason() {

    return localStorage.getItem(
        "selectedSeason"
    ) || "2026/27";

}


/* =========================================================
   GET SEASON MATCHES
   ========================================================= */

function getSeasonMatches() {

    return matches
        .filter(
            function(match) {

                return (
                    String(match.season) ===
                    String(getCurrentSeason())
                );

            }
        )
        .sort(
            function(a, b) {

                return (
                    new Date(a.date) -
                    new Date(b.date)
                );

            }
        );

}


/* =========================================================
   GET RESULT
   ========================================================= */

function getResult(match) {

    const goalsFor =
        Number(
            match.goalsFor
        ) || 0;


    const goalsAgainst =
        Number(
            match.goalsAgainst
        ) || 0;


    if (
        goalsFor >
        goalsAgainst
    ) {

        return "WIN";

    }


    if (
        goalsFor <
        goalsAgainst
    ) {

        return "LOSS";

    }


    return "DRAW";

}


/* =========================================================
   UPDATE SEASON TITLE
   ========================================================= */

function updateSeasonTitle() {

    const season =
        getCurrentSeason();


    const title =
        document.getElementById(
            "seasonTitle"
        );


    if (title) {

        title.textContent =
            "DEAL TOWN U10 HOOPS • " +
            season;

    }

}


/* =========================================================
   DESTROY OLD CHARTS
   ========================================================= */

function destroyCharts() {

    const charts = [

        goalsScoredChart,

        resultsChart,

        goalsConcededChart,

        appearancesChart,

        goalsChart,

        assistsChart,

        potmChart

    ];


    charts.forEach(
        function(chart) {

            if (chart) {

                chart.destroy();

            }

        }
    );


    goalsScoredChart = null;

    resultsChart = null;

    goalsConcededChart = null;

    appearancesChart = null;

    goalsChart = null;

    assistsChart = null;

    potmChart = null;

}


/* =========================================================
   CREATE PLAYER GRAPH SECTION
   ========================================================= */

function createPlayerGraphSection() {

    let section =
        document.getElementById(
            "playerGraphsSection"
        );


    if (section) {

        section.remove();

    }


    section =
        document.createElement("section");


    section.id =
        "playerGraphsSection";


    section.className =
        "stats-grid";


    section.style.marginTop =
        "30px";


    section.innerHTML = `

        <div class="stat-card">

            <h2>
                PLAYER APPEARANCES
            </h2>

            <div
                style="
                    position: relative;
                    height: 350px;
                "
            >

                <canvas
                    id="appearancesChart"
                ></canvas>

            </div>

        </div>


        <div class="stat-card">

            <h2>
                TOP GOAL SCORERS
            </h2>

            <div
                style="
                    position: relative;
                    height: 350px;
                "
            >

                <canvas
                    id="goalsChart"
                ></canvas>

            </div>

        </div>


        <div class="stat-card">

            <h2>
                TOP ASSIST PROVIDERS
            </h2>

            <div
                style="
                    position: relative;
                    height: 350px;
                "
            >

                <canvas
                    id="assistsChart"
                ></canvas>

            </div>

        </div>


        <div class="stat-card">

            <h2>
                PLAYER OF THE MATCH
            </h2>

            <div
                style="
                    position: relative;
                    height: 350px;
                "
            >

                <canvas
                    id="potmChart"
                ></canvas>

            </div>

        </div>

    `;


    const dashboard =
        document.querySelector(
            ".dashboard"
        );


    if (dashboard) {

        dashboard.appendChild(
            section
        );

    }

}


/* =========================================================
   GET PLAYER STATISTICS
   ========================================================= */

function getPlayerStatistics() {

    const season =
        getCurrentSeason();


    const seasonMatches =
        matches.filter(
            function(match) {

                return (
                    String(match.season) ===
                    String(season)
                );

            }
        );


    return players.map(
        function(player) {

            const playerId =
                String(player.id);


            let appearances = 0;

            let goals = 0;

            let assists = 0;

            let potm = 0;


            seasonMatches.forEach(
                function(match) {

                    const played =
                        match.playersWhoPlayed ||
                        [];


                    const goalscorers =
                        match.goalscorers ||
                        [];


                    const matchAssists =
                        match.assists ||
                        [];


                    const playerOfMatch =
                        match.playerOfMatch ||
                        [];


                    if (
                        played.some(
                            function(id) {

                                return (
                                    String(id) ===
                                    playerId
                                );

                            }
                        )
                    ) {

                        appearances++;

                    }


                    goalscorers.forEach(
                        function(id) {

                            if (
                                String(id) ===
                                playerId
                            ) {

                                goals++;

                            }

                        }
                    );


                    matchAssists.forEach(
                        function(id) {

                            if (
                                String(id) ===
                                playerId
                            ) {

                                assists++;

                            }

                        }
                    );


                    playerOfMatch.forEach(
                        function(id) {

                            if (
                                String(id) ===
                                playerId
                            ) {

                                potm++;

                            }

                        }
                    );

                }
            );


            /*
             * MANUAL STATS
             */

            let manual =
                null;


            if (
                player.manualStats &&
                player.manualStats[season]
            ) {

                manual =
                    player.manualStats[season];

            }


            if (manual) {

                appearances +=
                    Number(
                        manual.appearances
                    ) || 0;


                goals +=
                    Number(
                        manual.goals
                    ) || 0;


                assists +=
                    Number(
                        manual.assists
                    ) || 0;


                potm +=
                    Number(
                        manual.playerOfMatch
                    ) || 0;

            }


            return {

                name:
                    player.name,

                appearances:
                    appearances,

                goals:
                    goals,

                assists:
                    assists,

                potm:
                    potm

            };

        }
    );

}


/* =========================================================
   SORT PLAYER DATA
   ========================================================= */

function sortPlayers(
    data,
    statistic
) {

    return data
        .slice()
        .sort(
            function(a, b) {

                return (
                    b[statistic] -
                    a[statistic]
                );

            }
        );

}


/* =========================================================
   CREATE PLAYER BAR CHART
   ========================================================= */

function createPlayerChart(
    canvasId,
    data,
    statistic,
    label
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        return null;

    }


    const sorted =
        sortPlayers(
            data,
            statistic
        );


    return new Chart(
        canvas,
        {

            type:
                "bar",

            data: {

                labels:
                    sorted.map(
                        function(player) {

                            return player.name;

                        }
                    ),

                datasets: [

                    {

                        label:
                            label,

                        data:
                            sorted.map(
                                function(player) {

                                    return player[
                                        statistic
                                    ];

                                }
                            ),

                        borderWidth:
                            1

                    }

                ]

            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                indexAxis:
                    "y",

                plugins: {

                    legend: {

                        display:
                            false

                    }

                },

                scales: {

                    x: {

                        beginAtZero:
                            true,

                        ticks: {

                            stepSize:
                                1

                        }

                    }

                }

            }

        }

    );

}


/* =========================================================
   CREATE TEAM GRAPHS
   ========================================================= */

function createTeamGraphs(
    seasonMatches
) {

    const labels =
        seasonMatches.map(
            function(match, index) {

                return (
                    "Match " +
                    (index + 1)
                );

            }
        );


    const goalsScored =
        seasonMatches.map(
            function(match) {

                return (
                    Number(
                        match.goalsFor
                    ) || 0
                );

            }
        );


    const goalsConceded =
        seasonMatches.map(
            function(match) {

                return (
                    Number(
                        match.goalsAgainst
                    ) || 0
                );

            }
        );


    let wins = 0;

    let draws = 0;

    let losses = 0;


    seasonMatches.forEach(
        function(match) {

            const result =
                getResult(match);


            if (
                result === "WIN"
            ) {

                wins++;

            } else if (
                result === "DRAW"
            ) {

                draws++;

            } else {

                losses++;

            }

        }
    );


    const goalsScoredCanvas =
        document.getElementById(
            "goalsScoredChart"
        );


    if (goalsScoredCanvas) {

        goalsScoredChart =
            new Chart(
                goalsScoredCanvas,
                {

                    type:
                        "line",

                    data: {

                        labels:
                            labels,

                        datasets: [

                            {

                                label:
                                    "Goals Scored",

                                data:
                                    goalsScored,

                                borderWidth:
                                    3,

                                tension:
                                    0.25,

                                fill:
                                    false,

                                pointRadius:
                                    5

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        scales: {

                            y: {

                                beginAtZero:
                                    true,

                                ticks: {

                                    stepSize:
                                        1

                                }

                            }

                        }

                    }

                }

            );

    }


    const resultsCanvas =
        document.getElementById(
            "resultsChart"
        );


    if (resultsCanvas) {

        resultsChart =
            new Chart(
                resultsCanvas,
                {

                    type:
                        "doughnut",

                    data: {

                        labels: [

                            "Wins",

                            "Draws",

                            "Losses"

                        ],

                        datasets: [

                            {

                                data: [

                                    wins,

                                    draws,

                                    losses

                                ],

                                borderWidth:
                                    2

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        plugins: {

                            legend: {

                                position:
                                    "bottom"

                            }

                        }

                    }

                }

            );

    }


    const goalsConcededCanvas =
        document.getElementById(
            "goalsConcededChart"
        );


    if (goalsConcededCanvas) {

        goalsConcededChart =
            new Chart(
                goalsConcededCanvas,
                {

                    type:
                        "line",

                    data: {

                        labels:
                            labels,

                        datasets: [

                            {

                                label:
                                    "Goals Conceded",

                                data:
                                    goalsConceded,

                                borderWidth:
                                    3,

                                tension:
                                    0.25,

                                fill:
                                    false,

                                pointRadius:
                                    5

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        scales: {

                            y: {

                                beginAtZero:
                                    true,

                                ticks: {

                                    stepSize:
                                        1

                                }

                            }

                        }

                    }

                }

            );

    }

}


/* =========================================================
   CREATE ALL GRAPHS
   ========================================================= */

function createGraphs() {

    destroyCharts();


    const seasonMatches =
        getSeasonMatches();


    createPlayerGraphSection();


    /*
     * TEAM GRAPHS
     */

    if (
        seasonMatches.length > 0
    ) {

        createTeamGraphs(
            seasonMatches
        );

    } else {

        displayNoMatches();

    }


    /*
     * PLAYER GRAPHS
     */

    const playerData =
        getPlayerStatistics();


    appearancesChart =
        createPlayerChart(
            "appearancesChart",
            playerData,
            "appearances",
            "Appearances"
        );


    goalsChart =
        createPlayerChart(
            "goalsChart",
            playerData,
            "goals",
            "Goals"
        );


    assistsChart =
        createPlayerChart(
            "assistsChart",
            playerData,
            "assists",
            "Assists"
        );


    potmChart =
        createPlayerChart(
            "potmChart",
            playerData,
            "potm",
            "Player of the Match"
        );

}


/* =========================================================
   NO MATCHES
   ========================================================= */

function displayNoMatches() {

    const canvases = [

        "goalsScoredChart",

        "resultsChart",

        "goalsConcededChart"

    ];


    canvases.forEach(
        function(id) {

            const canvas =
                document.getElementById(
                    id
                );


            if (!canvas) {

                return;

            }


            const parent =
                canvas.parentElement;


            parent.innerHTML = `

                <p>
                    No matches recorded
                    for ${getCurrentSeason()}.
                </p>

            `;

        }
    );

}


/* =========================================================
   FIREBASE PLAYERS
   ========================================================= */

function startPlayerListener() {

    onSnapshot(
        collection(
            db,
            "players"
        ),

        function(snapshot) {

            players =
                snapshot.docs.map(
                    function(item) {

                        return {

                            id:
                                item.id,

                            ...item.data()

                        };

                    }
                );


            localStorage.setItem(
                "players",
                JSON.stringify(players)
            );


            updateSeasonTitle();

            createGraphs();

        },

        function(error) {

            console.error(
                "Firebase players error:",
                error
            );

        }

    );

}


/* =========================================================
   FIREBASE MATCHES
   ========================================================= */

function startMatchListener() {

    onSnapshot(
        collection(
            db,
            "matches"
        ),

        function(snapshot) {

            matches =
                snapshot.docs.map(
                    function(item) {

                        return {

                            id:
                                item.id,

                            ...item.data()

                        };

                    }
                );


            localStorage.setItem(
                "matches",
                JSON.stringify(matches)
            );


            updateSeasonTitle();

            createGraphs();

        },

        function(error) {

            console.error(
                "Firebase matches error:",
                error
            );

        }

    );

}


/* =========================================================
   SEASON CHANGES
   ========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            "selectedSeason"
        ) {

            updateSeasonTitle();

            createGraphs();

        }

    }
);


/* =========================================================
   LOAD LOCAL CACHE FIRST
   ========================================================= */

try {

    const savedMatches =
        localStorage.getItem(
            "matches"
        );


    if (savedMatches) {

        matches =
            JSON.parse(
                savedMatches
            ) || [];

    }


    const savedPlayers =
        localStorage.getItem(
            "players"
        );


    if (savedPlayers) {

        players =
            JSON.parse(
                savedPlayers
            ) || [];

    }

} catch (error) {

    console.error(
        "Could not load local graph data:",
        error
    );

}


/* =========================================================
   START
   ========================================================= */

updateSeasonTitle();

createGraphs();

startPlayerListener();

startMatchListener();

applyViewerRestrictions();
