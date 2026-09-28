import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

requireLogin();

const playerProfile =
    document.getElementById("playerProfile");

const matchList =
    document.getElementById("matchList");

const urlParams =
    new URLSearchParams(window.location.search);

const playerId =
    urlParams.get("id");

let player = null;
let players = [];
let matches = [];

function getCurrentSeason() {

    return (
        localStorage.getItem("selectedSeason") ||
        "2026/27"
    );

}

function findPlayer() {

    return players.find(function(item) {

        return (
            String(item.id) ===
            String(playerId)
        );

    });

}

function getManualStats(player) {

    const emptyStats = {

        appearances: 0,
        goals: 0,
        assists: 0,
        playerOfMatch: 0,
        yellowCards: 0,
        redCards: 0

    };

    if (
        !player ||
        !player.manualStats ||
        typeof player.manualStats !== "object" ||
        Array.isArray(player.manualStats)
    ) {

        return emptyStats;

    }

    const stats =
        player.manualStats[getCurrentSeason()];

    if (!stats) {

        return emptyStats;

    }

    return {

        appearances:
            Number(stats.appearances) || 0,

        goals:
            Number(stats.goals) || 0,

        assists:
            Number(stats.assists) || 0,

        playerOfMatch:
            Number(stats.playerOfMatch) || 0,

        yellowCards:
            Number(stats.yellowCards) || 0,

        redCards:
            Number(stats.redCards) || 0

    };

}

function getAutomaticStats(id) {

    const stats = {

        appearances: 0,
        goals: 0,
        assists: 0,
        playerOfMatch: 0,
        yellowCards: 0,
        redCards: 0

    };

    const season =
        getCurrentSeason();

    const seasonMatches =
        matches.filter(function(match) {

            return (
                String(match.season) ===
                String(season)
            );

        });

    seasonMatches.forEach(function(match) {

        const played =
            Array.isArray(match.playersWhoPlayed)
                ? match.playersWhoPlayed
                : [];

        const goalscorers =
            Array.isArray(match.goalscorers)
                ? match.goalscorers
                : [];

        const assists =
            Array.isArray(match.assists)
                ? match.assists
                : [];

        const potm =
            Array.isArray(match.playerOfMatch)
                ? match.playerOfMatch
                : [];

        const yellowCards =
            Array.isArray(match.yellowCards)
                ? match.yellowCards
                : [];

        const redCards =
            Array.isArray(match.redCards)
                ? match.redCards
                : [];

        if (
            played.some(function(player) {

                return (
                    String(player) ===
                    String(id)
                );

            })
        ) {

            stats.appearances++;

        }

        goalscorers.forEach(function(player) {

            if (
                String(player) ===
                String(id)
            ) {

                stats.goals++;

            }

        });

        assists.forEach(function(player) {

            if (
                String(player) ===
                String(id)
            ) {

                stats.assists++;

            }

        });

        potm.forEach(function(player) {

            if (
                String(player) ===
                String(id)
            ) {

                stats.playerOfMatch++;

            }

        });

        yellowCards.forEach(function(player) {

            if (
                String(player) ===
                String(id)
            ) {

                stats.yellowCards++;

            }

        });

        redCards.forEach(function(player) {

            if (
                String(player) ===
                String(id)
            ) {

                stats.redCards++;

            }

        });

    });

    return stats;

}

function getTotalStats() {

    const automatic =
        getAutomaticStats(playerId);

    const manual =
        getManualStats(player);

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

function getResult(match) {

    const goalsFor =
        Number(match.goalsFor) || 0;

    const goalsAgainst =
        Number(match.goalsAgainst) || 0;

    if (goalsFor > goalsAgainst) {

        return "WIN";

    }

    if (goalsFor < goalsAgainst) {

        return "LOSS";

    }

    return "DRAW";

}

function displayPlayerProfile() {

    if (!playerProfile) {
        return;
    }

    if (!player) {

        playerProfile.innerHTML = `
            <h2>PLAYER NOT FOUND</h2>
            <p>This player could not be found.</p>
        `;

        return;

    }

    const stats =
        getTotalStats();

    const currentSeason =
        getCurrentSeason();

    let photoHTML = "";

    if (player.photo) {

        photoHTML = `
            <img
                src="${player.photo}"
                alt="${player.name}"
                class="player-profile-photo"
            >
        `;

    } else {

        photoHTML = `
            <div class="player-placeholder">
                ${player.shirtNumber}
            </div>
        `;

    }

    playerProfile.innerHTML = `

        <div class="profile-header">

            <div class="profile-photo">

                ${photoHTML}

            </div>

            <div class="profile-info">

                <h2>
                    ${player.name}
                </h2>

                <p>
                    #${player.shirtNumber}
                    •
                    ${player.position}
                </p>

                <p>
                    ${currentSeason}
                </p>

            </div>

        </div>

        <div class="player-stat-grid">

            <div>
                <strong>
                    ${stats.appearances}
                </strong>

                <span>
                    APPEARANCES
                </span>
            </div>

            <div>
                <strong>
                    ${stats.goals}
                </strong>

                <span>
                    GOALS
                </span>
            </div>

            <div>
                <strong>
                    ${stats.assists}
                </strong>

                <span>
                    ASSISTS
                </span>
            </div>

            <div>
                <strong>
                    ${stats.playerOfMatch}
                </strong>

                <span>
                    PLAYER OF THE MATCH
                </span>
            </div>

            <div>
                <strong>
                    ${stats.yellowCards}
                </strong>

                <span>
                    YELLOW CARDS
                </span>
            </div>

            <div>
                <strong>
                    ${stats.redCards}
                </strong>

                <span>
                    RED CARDS
                </span>
            </div>

        </div>

    `;

}

function displayPlayerMatches() {

    if (!matchList) {
        return;
    }

    if (!player) {

        matchList.innerHTML =
            "<p>Player not found.</p>";

        return;

    }

    const currentSeason =
        getCurrentSeason();

    const playerMatches =
        matches
            .filter(function(match) {

                if (
                    String(match.season) !==
                    String(currentSeason)
                ) {

                    return false;

                }

                const played =
                    Array.isArray(match.playersWhoPlayed)
                        ? match.playersWhoPlayed
                        : [];

                return played.some(function(id) {

                    return (
                        String(id) ===
                        String(playerId)
                    );

                });

            })
            .sort(function(a, b) {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            });

    if (playerMatches.length === 0) {

        matchList.innerHTML = `
            <p>
                No matches recorded for
                ${player.name}
                in ${currentSeason}.
            </p>
        `;

        return;

    }

    matchList.innerHTML = "";

    playerMatches.forEach(function(match) {

        const card =
            document.createElement("div");

        card.className =
            "stat-card match-card";

        const result =
            getResult(match);

        const teamNames =
            match.venue === "Home"
                ? `Deal Town vs ${match.opponent}`
                : `${match.opponent} vs Deal Town`;

        const goals =
            `${Number(match.goalsFor) || 0} - ${Number(match.goalsAgainst) || 0}`;

        const goalscorers =
            Array.isArray(match.goalscorers)
                ? match.goalscorers
                : [];

        const assists =
            Array.isArray(match.assists)
                ? match.assists
                : [];

        const potm =
            Array.isArray(match.playerOfMatch)
                ? match.playerOfMatch
                : [];

        const yellowCards =
            Array.isArray(match.yellowCards)
                ? match.yellowCards
                : [];

        const redCards =
            Array.isArray(match.redCards)
                ? match.redCards
                : [];

        const scoredGoals =
            goalscorers.filter(function(id) {

                return (
                    String(id) ===
                    String(playerId)
                );

            }).length;

        const playerAssists =
            assists.filter(function(id) {

                return (
                    String(id) ===
                    String(playerId)
                );

            }).length;

        const playerPOTM =
            potm.filter(function(id) {

                return (
                    String(id) ===
                    String(playerId)
                );

            }).length;

        const playerYellow =
            yellowCards.filter(function(id) {

                return (
                    String(id) ===
                    String(playerId)
                );

            }).length;

        const playerRed =
            redCards.filter(function(id) {

                return (
                    String(id) ===
                    String(playerId)
                );

            }).length;

        card.innerHTML = `

            <h2>
                ${teamNames}
            </h2>

            <p>
                ${match.date}
                •
                ${match.venue}
                •
                ${currentSeason}
            </p>

            <strong>
                ${goals}
            </strong>

            <p>
                <b>Result:</b>
                ${result}
            </p>

            <p>
                <b>Player Performance</b>
            </p>

            <p>
                Goals:
                ${scoredGoals}
            </p>

            <p>
                Assists:
                ${playerAssists}
            </p>

            <p>
                Player of the Match:
                ${playerPOTM}
            </p>

            <p>
                Yellow Cards:
                ${playerYellow}
            </p>

            <p>
                Red Cards:
                ${playerRed}
            </p>

            ${
                match.notes
                    ? `
                        <p>
                            <b>Match Notes:</b><br>
                            ${match.notes}
                        </p>
                    `
                    : ""
            }

        `;

        matchList.appendChild(card);

    });

}

function displayPage() {

    player =
        findPlayer();

    displayPlayerProfile();

    displayPlayerMatches();

}

function loadLocalCache() {

    try {

        const savedPlayers =
            localStorage.getItem("players");

        if (savedPlayers) {

            const parsedPlayers =
                JSON.parse(savedPlayers);

            if (Array.isArray(parsedPlayers)) {

                players =
                    parsedPlayers;

            }

        }

    } catch (error) {

        console.error(
            "Could not load local players:",
            error
        );

    }

    try {

        const savedMatches =
            localStorage.getItem("matches");

        if (savedMatches) {

            const parsedMatches =
                JSON.parse(savedMatches);

            if (Array.isArray(parsedMatches)) {

                matches =
                    parsedMatches;

            }

        }

    } catch (error) {

        console.error(
            "Could not load local matches:",
            error
        );

    }

    displayPage();

}

async function loadPlayers() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "players"
                )
            );

        players =
            snapshot.docs.map(function(item) {

                return {
                    id: item.id,
                    ...item.data()
                };

            });

        localStorage.setItem(
            "players",
            JSON.stringify(players)
        );

        displayPage();

    } catch (error) {

        console.error(
            "Could not load Firebase players:",
            error
        );

    }

}

function startFirebaseListeners() {

    onSnapshot(
        collection(
            db,
            "players"
        ),
        function(snapshot) {

            players =
                snapshot.docs.map(function(item) {

                    return {
                        id: item.id,
                        ...item.data()
                    };

                });

            localStorage.setItem(
                "players",
                JSON.stringify(players)
            );

            displayPage();

        },
        function(error) {

            console.error(
                "Player listener error:",
                error
            );

        }
    );

    onSnapshot(
        collection(
            db,
            "matches"
        ),
        function(snapshot) {

            matches =
                snapshot.docs.map(function(item) {

                    return {
                        id: item.id,
                        ...item.data()
                    };

                });

            localStorage.setItem(
                "matches",
                JSON.stringify(matches)
            );

            displayPage();

        },
        function(error) {

            console.error(
                "Match listener error:",
                error
            );

        }
    );

}

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            "selectedSeason"
        ) {

            displayPage();

        }

    }
);

loadLocalCache();

loadPlayers();

startFirebaseListeners();

applyViewerRestrictions();
