requireLogin();


const matches =
    JSON.parse(
        localStorage.getItem("matches")
    ) || [];


const players =
    JSON.parse(
        localStorage.getItem("players")
    ) || [];


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
 * GET PLAYER
 */

function getPlayer(id) {

    return players.find(
        function(player) {

            return (
                player.id ===
                Number(id)
            );

        }
    );

}


/*
 * GET AUTOMATIC PLAYER STATS
 */

function getAutomaticStats(
    playerId,
    seasonMatches
) {

    const stats = {

        appearances: 0,

        goals: 0,

        assists: 0,

        playerOfMatch: 0,

        yellowCards: 0,

        redCards: 0

    };


    seasonMatches.forEach(
        function(match) {

            const played =
                match.playersWhoPlayed ||
                [];


            const goalscorers =
                match.goalscorers ||
                [];


            const assists =
                match.assists ||
                [];


            const potm =
                match.playerOfMatch ||
                [];


            const yellowCards =
                match.yellowCards ||
                [];


            const redCards =
                match.redCards ||
                [];


            if (
                played
                    .map(Number)
                    .includes(
                        Number(playerId)
                    )
            ) {

                stats.appearances++;

            }


            goalscorers.forEach(
                function(id) {

                    if (
                        Number(id) ===
                        Number(playerId)
                    ) {

                        stats.goals++;

                    }

                }
            );


            assists.forEach(
                function(id) {

                    if (
                        Number(id) ===
                        Number(playerId)
                    ) {

                        stats.assists++;

                    }

                }
            );


            potm.forEach(
                function(id) {

                    if (
                        Number(id) ===
                        Number(playerId)
                    ) {

                        stats.playerOfMatch++;

                    }

                }
            );


            yellowCards.forEach(
                function(id) {

                    if (
                        Number(id) ===
                        Number(playerId)
                    ) {

                        stats.yellowCards++;

                    }

                }
            );


            redCards.forEach(
                function(id) {

                    if (
                        Number(id) ===
                        Number(playerId)
                    ) {

                        stats.redCards++;

                    }

                }
            );

        }
    );


    return stats;

}


/*
 * GET MANUAL STATS
 */

function getManualStats(
    player
) {

    const season =
        getCurrentSeason();


    if (
        player.manualStats &&
        player.manualStats[season]
    ) {

        return player.manualStats[season];

    }


    /*
     * Older data format
     */

    if (
        player.manualStats &&
        player.manualStats.appearances !==
            undefined
    ) {

        return player.manualStats;

    }


    return {

        appearances: 0,

        goals: 0,

        assists: 0,

        playerOfMatch: 0,

        yellowCards: 0,

        redCards: 0

    };

}


/*
 * GET TOTAL PLAYER STATS
 */

function getPlayerStats(
    player,
    seasonMatches
) {

    const automatic =
        getAutomaticStats(
            player.id,
            seasonMatches
        );


    const manual =
        getManualStats(
            player
        );


    return {

        appearances:
            automatic.appearances +
            manual.appearances,

        goals:
            automatic.goals +
            manual.goals,

        assists:
            automatic.assists +
            manual.assists,

        playerOfMatch:
            automatic.playerOfMatch +
            manual.playerOfMatch,

        yellowCards:
            automatic.yellowCards +
            manual.yellowCards,

        redCards:
            automatic.redCards +
            manual.redCards

    };

}


/*
 * CALCULATE STREAKS
 */

function calculateStreaks(
    seasonMatches
) {

    let winningRun = 0;

    let unbeatenRun = 0;


    for (
        let i =
            seasonMatches.length - 1;

        i >= 0;

        i--
    ) {

        const match =
            seasonMatches[i];


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

            winningRun++;

        } else {

            break;

        }

    }


    for (
        let i =
            seasonMatches.length - 1;

        i >= 0;

        i--
    ) {

        const match =
            seasonMatches[i];


        const goalsFor =
            Number(
                match.goalsFor
            ) || 0;


        const goalsAgainst =
            Number(
                match.goalsAgainst
            ) || 0;


        if (
            goalsFor >=
            goalsAgainst
        ) {

            unbeatenRun++;

        } else {

            break;

        }

    }


    return {

        winningRun:
            winningRun,

        unbeatenRun:
            unbeatenRun

    };

}


/*
 * MAIN PREVIEW
 */

function generatePreview() {

    const season =
        getCurrentSeason();


    const seasonMatches =
        getSeasonMatches();


    /*
     * BASIC STATS
     */

    let wins = 0;

    let draws = 0;

    let losses = 0;

    let goalsScored = 0;

    let goalsConceded = 0;

    let cleanSheets = 0;


    seasonMatches.forEach(
        function(match) {

            const goalsFor =
                Number(
                    match.goalsFor
                ) || 0;


            const goalsAgainst =
                Number(
                    match.goalsAgainst
                ) || 0;


            goalsScored +=
                goalsFor;


            goalsConceded +=
                goalsAgainst;


            if (
                goalsFor >
                goalsAgainst
            ) {

                wins++;

            } else if (
                goalsFor ===
                goalsAgainst
            ) {

                draws++;

            } else {

                losses++;

            }


            if (
                goalsAgainst === 0
            ) {

                cleanSheets++;

            }

        }
    );


    const matchCount =
        seasonMatches.length;


    const winRate =
        matchCount > 0

            ? Math.round(
                (
                    wins /
                    matchCount
                ) * 100
            )

            : 0;


    const goalDifference =
        goalsScored -
        goalsConceded;


    const goalsPerGame =
        matchCount > 0

            ? (
                goalsScored /
                matchCount
            ).toFixed(2)

            : "0.00";


    const streaks =
        calculateStreaks(
            seasonMatches
        );


    /*
     * UPDATE BASIC INFORMATION
     */

    document.getElementById(
        "seasonTitle"
    ).textContent =
        `DEAL TOWN U10 HOOPS • ${season}`;


    document.getElementById(
        "matches"
    ).textContent =
        matchCount;


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
        `${winRate}%`;


    document.getElementById(
        "goalsScored"
    ).textContent =
        goalsScored;


    document.getElementById(
        "goalsConceded"
    ).textContent =
        goalsConceded;


    document.getElementById(
        "goalsPerGame"
    ).textContent =
        goalsPerGame;


    document.getElementById(
        "cleanSheets"
    ).textContent =
        cleanSheets;


    document.getElementById(
        "winningRun"
    ).textContent =
        streaks.winningRun;


    document.getElementById(
        "unbeatenRun"
    ).textContent =
        streaks.unbeatenRun;


    document.getElementById(
        "goalDifference"
    ).textContent =
        goalDifference;


    /*
     * PLAYER HIGHLIGHTS
     */

    displayPlayerHighlights(
        seasonMatches
    );


    /*
     * MATCH HIGHLIGHTS
     */

    displayMatchHighlights(
        seasonMatches
    );

}


/*
 * PLAYER HIGHLIGHTS
 */

function displayPlayerHighlights(
    seasonMatches
) {

    const container =
        document.getElementById(
            "playerHighlights"
        );


    container.innerHTML = "";


    if (
        players.length === 0
    ) {

        container.innerHTML = `

            <div class="stat-card">

                <h3>
                    No players added
                </h3>

            </div>

        `;

        return;

    }


    let totalGoals = null;

    let totalAssists = null;

    let totalPotm = null;

    let totalAppearances = null;


    players.forEach(
        function(player) {

            const stats =
                getPlayerStats(
                    player,
                    seasonMatches
                );


            if (
                !totalGoals ||
                stats.goals >
                totalGoals.stats.goals
            ) {

                totalGoals = {

                    player:
                        player,

                    stats:
                        stats

                };

            }


            if (
                !totalAssists ||
                stats.assists >
                totalAssists.stats.assists
            ) {

                totalAssists = {

                    player:
                        player,

                    stats:
                        stats

                };

            }


            if (
                !totalPotm ||
                stats.playerOfMatch >
                totalPotm.stats.playerOfMatch
            ) {

                totalPotm = {

                    player:
                        player,

                    stats:
                        stats

                };

            }


            if (
                !totalAppearances ||
                stats.appearances >
                totalAppearances.stats.appearances
            ) {

                totalAppearances = {

                    player:
                        player,

                    stats:
                        stats

                };

            }

        }
    );


    const highlights = [

        {

            title:
                "TOP GOALSCORER",

            item:
                totalGoals,

            value:
                totalGoals
                    ? totalGoals.stats.goals
                    : 0,

            label:
                "GOALS"

        },


        {

            title:
                "TOP ASSIST PROVIDER",

            item:
                totalAssists,

            value:
                totalAssists
                    ? totalAssists.stats.assists
                    : 0,

            label:
                "ASSISTS"

        },


        {

            title:
                "MOST POTM",

            item:
                totalPotm,

            value:
                totalPotm
                    ? totalPotm.stats.playerOfMatch
                    : 0,

            label:
                "POTM"

        },


        {

            title:
                "MOST APPEARANCES",

            item:
                totalAppearances,

            value:
                totalAppearances
                    ? totalAppearances.stats.appearances
                    : 0,

            label:
                "APPEARANCES"

        }

    ];


    highlights.forEach(
        function(highlight) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "stat-card";


            if (
                !highlight.item
            ) {

                card.innerHTML = `

                    <h3>
                        ${highlight.title}
                    </h3>

                    <strong>
                        —
                    </strong>

                `;

            } else {

                card.innerHTML = `

                    <h3>
                        ${highlight.title}
                    </h3>

                    <p>
                        #${highlight.item.player.shirtNumber}
                        ${highlight.item.player.name}
                    </p>

                    <strong>
                        ${highlight.value}
                    </strong>

                    <p>
                        ${highlight.label}
                    </p>

                `;

            }


            container.appendChild(
                card
            );

        }
    );

}


/*
 * MATCH HIGHLIGHTS
 */

function displayMatchHighlights(
    seasonMatches
) {

    const container =
        document.getElementById(
            "matchHighlights"
        );


    container.innerHTML = "";


    if (
        seasonMatches.length === 0
    ) {

        container.innerHTML = `

            <div class="stat-card">

                <h3>
                    No matches recorded
                </h3>

                <p>
                    Add matches to generate
                    the season preview.
                </p>

            </div>

        `;

        return;

    }


    /*
     * BIGGEST WIN
     */

    let biggestWin = null;


    /*
     * BIGGEST LOSS
     */

    let biggestLoss = null;


    /*
     * HIGHEST SCORING
     */

    let highestScoring = null;


    seasonMatches.forEach(
        function(match) {

            const goalsFor =
                Number(
                    match.goalsFor
                ) || 0;


            const goalsAgainst =
                Number(
                    match.goalsAgainst
                ) || 0;


            const difference =
                Math.abs(
                    goalsFor -
                    goalsAgainst
                );


            const totalGoals =
                goalsFor +
                goalsAgainst;


            if (
                goalsFor >
                goalsAgainst
            ) {

                if (
                    !biggestWin ||
                    difference >
                    biggestWin.difference
                ) {

                    biggestWin = {

                        match:
                            match,

                        difference:
                            difference

                    };

                }

            }


            if (
                goalsAgainst >
                goalsFor
            ) {

                if (
                    !biggestLoss ||
                    difference >
                    biggestLoss.difference
                ) {

                    biggestLoss = {

                        match:
                            match,

                        difference:
                            difference

                    };

                }

            }


            if (
                !highestScoring ||
                totalGoals >
                highestScoring.totalGoals
            ) {

                highestScoring = {

                    match:
                        match,

                    totalGoals:
                        totalGoals

                };

            }

        }
    );


    const cards = [

        {

            title:
                "BIGGEST WIN",

            data:
                biggestWin,

            empty:
                "No wins recorded"

        },


        {

            title:
                "BIGGEST LOSS",

            data:
                biggestLoss,

            empty:
                "No losses recorded"

        },


        {

            title:
                "HIGHEST-SCORING MATCH",

            data:
                highestScoring,

            empty:
                "No matches recorded"

        }

    ];


    cards.forEach(
        function(cardData) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "stat-card";


            if (
                !cardData.data
            ) {

                card.innerHTML = `

                    <h3>
                        ${cardData.title}
                    </h3>

                    <p>
                        ${cardData.empty}
                    </p>

                `;

            } else {

                const match =
                    cardData.data.match;


                card.innerHTML = `

                    <h3>
                        ${cardData.title}
                    </h3>

                    <p>
                        ${match.opponent}
                    </p>

                    <strong>
                        ${match.goalsFor}
                        -
                        ${match.goalsAgainst}
                    </strong>

                    <p>
                        ${match.date}
                        •
                        ${match.venue}
                    </p>

                `;

            }


            container.appendChild(
                card
            );

        }
    );


    /*
     * LAST MATCH
     */

    const lastMatch =
        seasonMatches[
            seasonMatches.length - 1
        ];


    if (lastMatch) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "stat-card";


        let result =
            "DRAW";


        if (
            Number(lastMatch.goalsFor) >
            Number(lastMatch.goalsAgainst)
        ) {

            result =
                "WIN";

        } else if (
            Number(lastMatch.goalsFor) <
            Number(lastMatch.goalsAgainst)
        ) {

            result =
                "LOSS";

        }


        card.innerHTML = `

            <h3>
                MOST RECENT MATCH
            </h3>

            <p>
                ${lastMatch.opponent}
            </p>

            <strong>
                ${lastMatch.goalsFor}
                -
                ${lastMatch.goalsAgainst}
            </strong>

            <p>
                ${result}
                •
                ${lastMatch.date}
            </p>

        `;


        container.appendChild(
            card
        );

    }

}


/*
 * GENERATE REPORT
 */

generatePreview();

applyViewerRestrictions();