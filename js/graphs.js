/* =========================================================
   GRAPHS SYSTEM
   ========================================================= */

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
   SEASON
   ========================================================= */

function getCurrentSeason() {

    return (
        localStorage.getItem(
            "selectedSeason"
        ) ||
        "2026/27"
    );

}


/* =========================================================
   SEASON TITLE
   ========================================================= */

function updateSeasonTitle() {

    const title =
        document.getElementById(
            "seasonTitle"
        );

    if (title) {

        title.textContent =
            "DEAL TOWN U10 HOOPS • " +
            getCurrentSeason();

    }

}


/* =========================================================
   SEASON MATCHES
   ========================================================= */

function getSeasonMatches() {

    return matches
        .filter(function(match) {

            return (
                String(match.season) ===
                String(getCurrentSeason())
            );

        })
        .sort(function(a, b) {

            return (
                new Date(a.date) -
                new Date(b.date)
            );

        });

}


/* =========================================================
   RESULT
   ========================================================= */

function getResult(match) {

    const goalsFor =
        Number(match.goalsFor) || 0;

    const goalsAgainst =
        Number(match.goalsAgainst) || 0;


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
   DESTROY EXISTING CHARTS
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


    charts.forEach(function(chart) {

        if (chart) {

            chart.destroy();

        }

    });


    goalsScoredChart = null;
    resultsChart = null;
    goalsConcededChart = null;

    appearancesChart = null;
    goalsChart = null;
    assistsChart = null;
    potmChart = null;

}


/* =========================================================
   PLAYER STATISTICS
   ========================================================= */

function getPlayerStatistics() {

    const season =
        getCurrentSeason();


    const seasonMatches =
        matches.filter(function(match) {

            return (
                String(match.season) ===
                String(season)
            );

        });


    return players.map(function(player) {

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
                    played.some(function(id) {

                        return (
                            String(id) ===
                            playerId
                        );

                    })
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


        /* =================================================
           MANUAL STATS
           ================================================= */

        if (
            player.manualStats &&
            player.manualStats[season]
        ) {

            const manual =
                player.manualStats[season];


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

    });

}


/* =========================================================
   SORT PLAYERS
   ========================================================= */

function sortPlayers(
    data,
    statistic
) {

    return data
        .slice()
        .sort(function(a, b) {

            const difference =
                b[statistic] -
                a[statistic];


            if (
                difference !== 0
            ) {

                return difference;

            }


            return a.name.localeCompare(
                b.name
            );

        });

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

        console.error(
            "Canvas not found:",
            canvasId
        );

        return null;

    }


    const sorted =
        sortPlayers(
            data,
            statistic
        );


    const parent =
        canvas.parentElement;


    /*
       Automatically make the graph
       taller when there are lots
       of players.
    */

    const height =
        Math.max(
            300,
            sorted.length * 42
        );


    parent.style.height =
        height + "px";


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

                animation:
                    false,


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

                    },


                    y: {

                        ticks: {

                            autoSkip:
                                false

                        }

                    }

                }

            }

        }
    );

}


/* =========================================================
   TEAM GRAPHS
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


    /* =====================================================
       GOALS SCORED
       ===================================================== */

    const goalsScoredCanvas =
        document.getElementById(
            "goalsScoredChart"
        );


    if (
        goalsScoredCanvas
    ) {

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


    /* =====================================================
       WINS / DRAWS / LOSSES
       ===================================================== */

    const resultsCanvas =
        document.getElementById(
            "resultsChart"
        );


    if (
        resultsCanvas
    ) {

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


    /* =====================================================
       GOALS CONCEDED
       ===================================================== */

    const goalsConcededCanvas =
        document.getElementById(
            "goalsConcededChart"
        );


    if (
        goalsConcededCanvas
    ) {

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
   NO MATCHES
   ========================================================= */

function showNoMatches() {

    const ids = [

        "goalsScoredChart",
        "resultsChart",
        "goalsConcededChart"

    ];


    ids.forEach(function(id) {

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

    });

}


/* =========================================================
   CREATE ALL GRAPHS
   ========================================================= */

function createGraphs() {

    destroyCharts();


    const seasonMatches =
        getSeasonMatches();


    /* =====================================================
       TEAM GRAPHS
       ===================================================== */

    if (
        seasonMatches.length > 0
    ) {

        createTeamGraphs(
            seasonMatches
        );

    } else {

        showNoMatches();

    }


    /* =====================================================
       PLAYER GRAPHS
       ===================================================== */

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
   LOAD LOCAL DATA FIRST
   ========================================================= */

function loadLocalData() {

    try {

        const savedMatches =
            localStorage.getItem(
                "matches"
            );


        if (savedMatches) {

            const parsedMatches =
                JSON.parse(
                    savedMatches
                );


            if (
                Array.isArray(
                    parsedMatches
                )
            ) {

                matches =
                    parsedMatches;

            }

        }


        const savedPlayers =
            localStorage.getItem(
                "players"
            );


        if (savedPlayers) {

            const parsedPlayers =
                JSON.parse(
                    savedPlayers
                );


            if (
                Array.isArray(
                    parsedPlayers
                )
            ) {

                players =
                    parsedPlayers;

            }

        }

    } catch (error) {

        console.error(
            "Could not load local graph data:",
            error
        );

    }

}


/* =========================================================
   FIREBASE PLAYER LISTENER
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
                JSON.stringify(
                    players
                )
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
   FIREBASE MATCH LISTENER
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
                JSON.stringify(
                    matches
                )
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
   SEASON CHANGE FROM ANOTHER TAB
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
   START PAGE
   ========================================================= */

loadLocalData();

updateSeasonTitle();

createGraphs();

startPlayerListener();

startMatchListener();

applyViewerRestrictions();
