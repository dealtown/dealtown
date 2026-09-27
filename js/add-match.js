import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    setDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


requireAdmin();


var players = [];


var selectedPlayers = {
    played: [],
    goalscorers: [],
    assists: [],
    potm: [],
    yellowCards: [],
    redCards: []
};


/*
 * LOAD PLAYERS FROM FIRESTORE
 */

async function loadPlayers() {

    try {

        var snapshot =
            await getDocs(
                collection(
                    db,
                    "players"
                )
            );


        players =
            snapshot.docs.map(
                function(item) {

                    return item.data();

                }
            );


        /*
         * If Firebase has no players,
         * fall back to localStorage.
         */

        if (players.length === 0) {

            var savedPlayers =
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


        fillAllPlayerDropdowns();

    } catch (error) {

        console.error(
            "Could not load players:",
            error
        );


        /*
         * Keep the old localStorage
         * system as a fallback.
         */

        var savedPlayers =
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


        fillAllPlayerDropdowns();

    }

}


/*
 * GET CURRENT SEASON
 */

function getCurrentSeason() {

    return localStorage.getItem(
        "selectedSeason"
    ) || "2026/27";

}


/*
 * FIND PLAYER
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
 * FILL PLAYER DROPDOWN
 */

function fillPlayerDropdown(selectId) {

    var select =
        document.getElementById(
            selectId
        );


    if (!select) {

        return;

    }


    /*
     * Clear old options first.
     */

    while (
        select.options.length > 1
    ) {

        select.remove(
            1
        );

    }


    players.forEach(
        function(player) {

            var option =
                document.createElement(
                    "option"
                );


            option.value =
                String(player.id);


            option.textContent =
                "#" +
                player.shirtNumber +
                " " +
                player.name;


            select.appendChild(
                option
            );

        }
    );

}


/*
 * FILL ALL DROPDOWNS
 */

function fillAllPlayerDropdowns() {

    fillPlayerDropdown(
        "playedPlayerSelect"
    );


    fillPlayerDropdown(
        "goalscorerSelect"
    );


    fillPlayerDropdown(
        "assistSelect"
    );


    fillPlayerDropdown(
        "potmSelect"
    );


    fillPlayerDropdown(
        "yellowCardSelect"
    );


    fillPlayerDropdown(
        "redCardSelect"
    );

}


/*
 * ADD PLAYER TO A SECTION
 */

function addPlayer(
    type,
    selectId,
    containerId
) {

    var select =
        document.getElementById(
            selectId
        );


    if (!select) {

        return;

    }


    var playerId =
        select.value;


    if (!playerId) {

        return;

    }


    var player =
        getPlayer(playerId);


    if (!player) {

        return;

    }


    /*
     * PLAYERS WHO PLAYED
     * CAN ONLY BE ADDED ONCE
     */

    if (type === "played") {

        if (
            !selectedPlayers.played.some(
                function(id) {

                    return String(id) ===
                        String(playerId);

                }
            )
        ) {

            selectedPlayers.played.push(
                String(playerId)
            );

        }

    } else {

        /*
         * GOALS, ASSISTS, POTM
         * AND CARDS CAN REPEAT
         */

        selectedPlayers[type].push(
            String(playerId)
        );

    }


    select.value = "";


    displaySelectedPlayers(
        type,
        containerId
    );

}


/*
 * DISPLAY SELECTED PLAYERS
 */

function displaySelectedPlayers(
    type,
    containerId
) {

    var container =
        document.getElementById(
            containerId
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    selectedPlayers[type].forEach(
        function(playerId, index) {

            var player =
                getPlayer(playerId);


            if (!player) {

                return;

            }


            var item =
                document.createElement(
                    "div"
                );


            item.className =
                "selected-player";


            var name =
                document.createElement(
                    "span"
                );


            name.textContent =
                "#" +
                player.shirtNumber +
                " " +
                player.name;


            var removeButton =
                document.createElement(
                    "button"
                );


            removeButton.type =
                "button";


            removeButton.textContent =
                "X";


            removeButton.onclick =
                function() {

                    removePlayer(
                        type,
                        index,
                        containerId
                    );

                };


            item.appendChild(
                name
            );


            item.appendChild(
                removeButton
            );


            container.appendChild(
                item
            );

        }
    );

}


/*
 * REMOVE PLAYER
 */

function removePlayer(
    type,
    index,
    containerId
) {

    selectedPlayers[type].splice(
        index,
        1
    );


    displaySelectedPlayers(
        type,
        containerId
    );

}


/*
 * DROPDOWN EVENTS
 */

function connectDropdown(
    selectId,
    type,
    containerId
) {

    var select =
        document.getElementById(
            selectId
        );


    if (!select) {

        return;

    }


    select.addEventListener(
        "change",
        function() {

            addPlayer(
                type,
                selectId,
                containerId
            );

        }
    );

}


connectDropdown(
    "playedPlayerSelect",
    "played",
    "playedPlayers"
);


connectDropdown(
    "goalscorerSelect",
    "goalscorers",
    "goalscorers"
);


connectDropdown(
    "assistSelect",
    "assists",
    "assists"
);


connectDropdown(
    "potmSelect",
    "potm",
    "potmPlayers"
);


connectDropdown(
    "yellowCardSelect",
    "yellowCards",
    "yellowCards"
);


connectDropdown(
    "redCardSelect",
    "redCards",
    "redCards"
);


/*
 * SHOW CURRENT SEASON
 */

var currentSeason =
    getCurrentSeason();


var seasonText =
    document.querySelector(
        "main.dashboard > p"
    );


if (seasonText) {

    seasonText.textContent =
        "DEAL TOWN U10 HOOPS • " +
        currentSeason;

}


/*
 * SAVE MATCH TO FIRESTORE
 */

async function saveMatch() {

    var opponent =
        document.getElementById(
            "opponent"
        ).value.trim();


    var date =
        document.getElementById(
            "date"
        ).value;


    var venue =
        document.getElementById(
            "venue"
        ).value;


    var goalsFor =
        Number(
            document.getElementById(
                "goalsFor"
            ).value
        );


    var goalsAgainst =
        Number(
            document.getElementById(
                "goalsAgainst"
            ).value
        );


    var notes =
        document.getElementById(
            "notes"
        ).value.trim();


    var message =
        document.getElementById(
            "message"
        );


    /*
     * REQUIRED FIELDS
     */

    if (!opponent || !date) {

        message.style.color =
            "#ff7070";


        message.textContent =
            "Please enter the opponent and date.";


        return;

    }


    /*
     * PLAYERS WHO PLAYED
     * ARE REQUIRED
     */

    if (
        selectedPlayers.played.length === 0
    ) {

        message.style.color =
            "#ff7070";


        message.textContent =
            "Please select at least one player who played.";


        return;

    }


    /*
     * CREATE MATCH
     */

    var match = {

        id:
            Date.now().toString(),


        season:
            getCurrentSeason(),


        opponent:
            opponent,


        date:
            date,


        venue:
            venue,


        goalsFor:
            Number.isFinite(
                goalsFor
            )
                ? goalsFor
                : 0,


        goalsAgainst:
            Number.isFinite(
                goalsAgainst
            )
                ? goalsAgainst
                : 0,


        playersWhoPlayed:
            Array.from(
                new Set(
                    selectedPlayers.played
                )
            ),


        goalscorers:
            selectedPlayers.goalscorers.slice(),


        assists:
            selectedPlayers.assists.slice(),


        playerOfMatch:
            selectedPlayers.potm.slice(),


        yellowCards:
            selectedPlayers.yellowCards.slice(),


        redCards:
            selectedPlayers.redCards.slice(),


        notes:
            notes

    };


    /*
     * SAVE LOCALLY TOO
     */

    var savedMatches =
        localStorage.getItem(
            "matches"
        );


    var matches = [];


    if (savedMatches) {

        try {

            matches =
                JSON.parse(
                    savedMatches
                );


            if (!Array.isArray(matches)) {

                matches = [];

            }

        } catch (error) {

            matches = [];

        }

    }


    matches.push(
        match
    );


    localStorage.setItem(
        "matches",
        JSON.stringify(matches)
    );


    /*
     * SAVE TO FIRESTORE
     */

    try {

        await setDoc(
            doc(
                db,
                "matches",
                String(match.id)
            ),
            match
        );


        message.style.color =
            "#8ee28e";


        message.textContent =
            "Match saved to " +
            getCurrentSeason() +
            "!";


        /*
         * RETURN TO DASHBOARD
         */

        setTimeout(
            function() {

                window.location.href =
                    "dashboard.html";

            },
            700
        );

    } catch (error) {

        console.error(
            "Firebase match error:",
            error
        );


        message.style.color =
            "#ff7070";


        message.textContent =
            "Match was saved locally, but could not be uploaded to Firebase.";

    }

}


/*
 * MAKE SAVE BUTTON WORK
 */

window.saveMatch =
    saveMatch;


/*
 * START
 */

loadPlayers();
