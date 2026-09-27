import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


requireLogin();


const matchList =
    document.getElementById("matchList");


let matches = [];
let players = [];

const isAdminUser =
    isAdmin();


/*
 * GET CURRENT SEASON
 */

function getCurrentSeason() {

    return localStorage.getItem(
        "selectedSeason"
    ) || "2026/27";

}


/*
 * LOAD PLAYERS FROM FIREBASE
 */

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
            snapshot.docs.map(
                function(item) {

                    return {
                        id: item.id,
                        ...item.data()
                    };

                }
            );

    } catch (error) {

        console.error(
            "Could not load players:",
            error
        );

        /*
         * Temporary fallback for
         * old local data.
         */

        const savedPlayers =
            localStorage.getItem(
                "players"
            );

        if (savedPlayers) {

            try {

                players =
                    JSON.parse(
                        savedPlayers
                    );

            } catch (error) {

                players = [];

            }

        }

    }

}


/*
 * GET PLAYER
 */

function getPlayer(id) {

    return players.find(
        function(player) {

            return String(player.id) ===
                String(id);

        }
    );

}


/*
 * GET PLAYER NAME
 */

function getPlayerName(
    id,
    match
) {

    const player =
        getPlayer(id);

    if (player) {

        return "#" +
            player.shirtNumber +
            " " +
            player.name;

    }


    /*
     * Check historical snapshot
     * if one exists.
     */

    if (
        match &&
        Array.isArray(match.playerSnapshots)
    ) {

        const snapshot =
            match.playerSnapshots.find(
                function(savedPlayer) {

                    return String(savedPlayer.id) ===
                        String(id);

                }
            );

        if (snapshot) {

            return "#" +
                snapshot.shirtNumber +
                " " +
                snapshot.name;

        }

    }


    return "Deleted Player";

}


/*
 * GET MULTIPLE PLAYER NAMES
 */

function playerNames(
    ids,
    match
) {

    if (
        !ids ||
        ids.length === 0
    ) {

        return "None";

    }

    return ids
        .map(
            function(id) {

                return getPlayerName(
                    id,
                    match
                );

            }
        )
        .join(", ");

}


/*
 * GET MATCH RESULT
 */

function getResult(match) {

    const goalsFor =
        Number(match.goalsFor) || 0;

    const goalsAgainst =
        Number(match.goalsAgainst) || 0;


    if (
        goalsFor > goalsAgainst
    ) {

        return "WIN";

    }


    if (
        goalsFor < goalsAgainst
    ) {

        return "LOSS";

    }


    return "DRAW";

}


/*
 * DISPLAY MATCHES
 */

function displayMatches() {

    matchList.innerHTML = "";


    const currentSeason =
        getCurrentSeason();


    const seasonMatches =
        matches
            .filter(
                function(match) {

                    return String(match.season) ===
                        String(currentSeason);

                }
            )
            .sort(
                function(a, b) {

                    return (
                        new Date(b.date) -
                        new Date(a.date)
                    );

                }
            );


    if (
        seasonMatches.length === 0
    ) {

        matchList.innerHTML = `

            <div class="stat-card">

                <h2>
                    No matches in ${currentSeason}
                </h2>

                <p>
                    Add a match to see it here.
                </p>

            </div>

        `;

        return;

    }


    seasonMatches.forEach(
        function(match) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "stat-card match-card";


            const teamNames =
                match.venue === "Home"

                    ? `Deal Town vs ${match.opponent}`

                    : `${match.opponent} vs Deal Town`;


            const goalscorers =
                match.goalscorers || [];


            const assists =
                match.assists || [];


            const potm =
                match.playerOfMatch || [];


            const yellowCards =
                match.yellowCards || [];


            const redCards =
                match.redCards || [];


            const played =
                match.playersWhoPlayed || [];


            const result =
                getResult(match);


            const adminButtons =
                isAdminUser

                    ? `

                        <button
                            type="button"
                            onclick="editMatch('${match.id}')"
                        >
                            EDIT MATCH
                        </button>

                        <button
                            type="button"
                            class="delete-match"
                            onclick="deleteMatch('${match.id}')"
                        >
                            DELETE MATCH
                        </button>

                    `

                    : "";


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
                    ${match.goalsFor}
                    -
                    ${match.goalsAgainst}
                </strong>

                <p>
                    <b>Result:</b>
                    ${result}
                </p>

                <p>
                    <b>Players Who Played:</b>
                    <br>
                    ${playerNames(
                        played,
                        match
                    )}
                </p>

                <p>
                    <b>Goalscorers:</b>
                    <br>
                    ${playerNames(
                        goalscorers,
                        match
                    )}
                </p>

                <p>
                    <b>Assists:</b>
                    <br>
                    ${playerNames(
                        assists,
                        match
                    )}
                </p>

                <p>
                    <b>Player of the Match:</b>
                    <br>
                    ${playerNames(
                        potm,
                        match
                    )}
                </p>

                <p>
                    <b>Yellow Cards:</b>
                    <br>
                    ${playerNames(
                        yellowCards,
                        match
                    )}
                </p>

                <p>
                    <b>Red Cards:</b>
                    <br>
                    ${playerNames(
                        redCards,
                        match
                    )}
                </p>

                ${
                    match.notes
                        ? `

                            <p>
                                <b>Notes:</b>
                                <br>
                                ${match.notes}
                            </p>

                        `
                        : ""
                }

                ${adminButtons}

            `;


            matchList.appendChild(
                card
            );

        }
    );

}


/*
 * EDIT MATCH
 */

function editMatch(id) {

    if (!isAdmin()) {
        return;
    }


    const match =
        matches.find(
            function(match) {

                return String(match.id) ===
                    String(id);

            }
        );


    if (!match) {
        return;
    }


    localStorage.setItem(
        "editingMatch",
        JSON.stringify(match)
    );


    window.location.href =
        "edit-match.html";

}


/*
 * DELETE MATCH
 */

async function deleteMatch(id) {

    if (!isAdmin()) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this match?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "matches",
                String(id)
            )
        );


        /*
         * Remove it from the local
         * copy as well.
         */

        matches =
            matches.filter(
                function(match) {

                    return String(match.id) !==
                        String(id);

                }
            );


        localStorage.setItem(
            "matches",
            JSON.stringify(matches)
        );


        displayMatches();


    } catch (error) {

        console.error(
            "Could not delete match:",
            error
        );

        alert(
            "The match could not be deleted from Firebase."
        );

    }

}


/*
 * MAKE FUNCTIONS AVAILABLE TO
 * INLINE HTML BUTTONS
 */

window.editMatch =
    editMatch;

window.deleteMatch =
    deleteMatch;


/*
 * LOAD EVERYTHING
 */

async function startMatchesPage() {

    await loadPlayers();


    /*
     * Real-time Firebase listener.
     *
     * If another device adds,
     * edits or deletes a match,
     * this page updates automatically.
     */

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
                            id: item.id,
                            ...item.data()
                        };

                    }
                );


            /*
             * Keep localStorage updated
             * as a temporary cache.
             */

            localStorage.setItem(
                "matches",
                JSON.stringify(matches)
            );


            displayMatches();

        },

        function(error) {

            console.error(
                "Firebase matches listener error:",
                error
            );

            /*
             * Fallback to local data
             * if Firebase cannot be read.
             */

            const savedMatches =
                localStorage.getItem(
                    "matches"
                );

            if (savedMatches) {

                try {

                    matches =
                        JSON.parse(
                            savedMatches
                        );

                } catch (error) {

                    matches = [];

                }

            }

            displayMatches();

        }
    );

}


startMatchesPage();

applyViewerRestrictions();
