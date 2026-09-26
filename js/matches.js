requireLogin();


const matchList =
    document.getElementById(
        "matchList"
    );


let matches =
    JSON.parse(
        localStorage.getItem("matches")
    ) || [];


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
 * GET PLAYERS
 */

function getPlayers() {

    return JSON.parse(
        localStorage.getItem("players")
    ) || [];

}


/*
 * GET PLAYER
 */

function getPlayer(id) {

    const players =
        getPlayers();


    return players.find(
        function(player) {

            return player.id === Number(id);

        }
    );

}


/*
 * GET PLAYER NAME
 *
 * If a player has been deleted,
 * use the historical name saved
 * inside the match when available.
 */

function getPlayerName(
    id,
    match
) {

    const player =
        getPlayer(id);


    if (player) {

        return `#${player.shirtNumber} ${player.name}`;

    }


    /*
     * Old matches may not yet have
     * historical player information.
     */

    if (
        match &&
        match.playerSnapshots
    ) {

        const snapshot =
            match.playerSnapshots.find(
                function(savedPlayer) {

                    return (
                        Number(savedPlayer.id) ===
                        Number(id)
                    );

                }
            );


        if (snapshot) {

            return `#${snapshot.shirtNumber} ${snapshot.name}`;

        }

    }


    return "Deleted Player";

}


/*
 * TURN PLAYER IDS INTO NAMES
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


    /*
     * ONLY SHOW CURRENT SEASON
     */

    const seasonMatches =
        matches
            .filter(
                function(match) {

                    return (
                        match.season ===
                        currentSeason
                    );

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


    /*
     * NO MATCHES
     */

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


    /*
     * CREATE MATCH CARDS
     */

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


            /*
             * ADMIN BUTTONS
             */

            const adminButtons =
                isAdminUser

                    ? `

                        <button
                            onclick="
                                editMatch(
                                    ${match.id}
                                )
                            "
                        >
                            EDIT MATCH
                        </button>


                        <button
                            class="delete-match"
                            onclick="
                                deleteMatch(
                                    ${match.id}
                                )
                            "
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

                return (
                    match.id === id
                );

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

function deleteMatch(id) {

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


    matches =
        matches.filter(
            function(match) {

                return (
                    match.id !== id
                );

            }
        );


    localStorage.setItem(
        "matches",
        JSON.stringify(matches)
    );


    displayMatches();

}


/*
 * DISPLAY
 */

displayMatches();


applyViewerRestrictions();