requireLogin();


const matches =
    JSON.parse(
        localStorage.getItem("matches")
    ) || [];


let goalsScoredChart = null;

let resultsChart = null;

let goalsConcededChart = null;


/*
 * CURRENT SEASON
 */

function getCurrentSeason() {

    return localStorage.getItem(
        "selectedSeason"
    ) || "2026/27";

}


/*
 * GET SEASON MATCHES
 */

function getSeasonMatches() {

    return matches
        .filter(
            function(match) {

                return (
                    match.season ===
                    getCurrentSeason()
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


/*
 * GET RESULT
 */

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


/*
 * UPDATE SEASON TITLE
 */

function updateSeasonTitle() {

    const season =
        getCurrentSeason();


    const title =
        document.getElementById(
            "seasonTitle"
        );


    if (title) {

        title.textContent =
            `DEAL TOWN U10 HOOPS • ${season}`;

    }

}


/*
 * DESTROY OLD CHARTS
 */

function destroyCharts() {

    if (
        goalsScoredChart
    ) {

        goalsScoredChart.destroy();

        goalsScoredChart = null;

    }


    if (
        resultsChart
    ) {

        resultsChart.destroy();

        resultsChart = null;

    }


    if (
        goalsConcededChart
    ) {

        goalsConcededChart.destroy();

        goalsConcededChart = null;

    }

}


/*
 * CREATE GRAPHS
 */

function createGraphs() {

    const seasonMatches =
        getSeasonMatches();


    destroyCharts();


    /*
     * MATCH LABELS
     */

    const labels =
        seasonMatches.map(
            function(match, index) {

                return (
                    `Match ${index + 1}`
                );

            }
        );


    /*
     * GOALS SCORED DATA
     */

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


    /*
     * GOALS CONCEDED DATA
     */

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


    /*
     * RESULT COUNTS
     */

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


    /*
     * NO MATCHES
     */

    if (
        seasonMatches.length === 0
    ) {

        displayNoMatches();

        return;

    }


    /*
     * GOALS SCORED GRAPH
     */

    const goalsScoredCanvas =
        document.getElementById(
            "goalsScoredChart"
        );


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

                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    },

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


    /*
     * WINS / DRAWS / LOSSES
     */

    const resultsCanvas =
        document.getElementById(
            "resultsChart"
        );


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


    /*
     * GOALS CONCEDED
     */

    const goalsConcededCanvas =
        document.getElementById(
            "goalsConcededChart"
        );


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

                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    },

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


/*
 * SHOW NO MATCHES MESSAGE
 */

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


/*
 * START
 */

updateSeasonTitle();

createGraphs();

applyViewerRestrictions();