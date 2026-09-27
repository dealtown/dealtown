import {
    db
} from "./firebase.js";

import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


requireLogin();


var players = JSON.parse(
    localStorage.getItem("players")
) || [];


var matches = JSON.parse(
    localStorage.getItem("matches")
) || [];


var editingPlayerId = null;


var playerNameInput =
    document.getElementById("playerName");

var shirtNumberInput =
    document.getElementById("shirtNumber");

var positionInput =
    document.getElementById("position");

var playerPhotoInput =
    document.getElementById("playerPhoto");

var savePlayerButton =
    document.getElementById("savePlayerButton");

var cancelEditButton =
    document.getElementById("cancelEdit");

var playerList =
    document.getElementById("playerList");

var currentSeasonText =
    document.getElementById("currentSeason");


/* =========================
   SEASON
========================= */

function getCurrentSeason() {

    return localStorage.getItem(
        "selectedSeason"
    ) || "2026/27";

}


function updateSeasonText() {

    if (!currentSeasonText) {
        return;
    }

    currentSeasonText.textContent =
        getCurrentSeason()
            .replace("/", " / ");

}


/* =========================
   LOCAL SAVE
========================= */

function savePlayers() {

    localStorage.setItem(
        "players",
        JSON.stringify(players)
    );

}


/* =========================
   FIREBASE
========================= */

var playersCollection =
    collection(db, "players");


async function savePlayerToFirebase(player) {

    await setDoc(
        doc(
            db,
            "players",
            String(player.id)
        ),
        player
    );

}


async function deletePlayerFromFirebase(id) {

    await deleteDoc(
        doc(
            db,
            "players",
            String(id)
        )
    );

}


/* =========================
   LOAD FIREBASE PLAYERS
========================= */

async function loadPlayersFromFirebase() {

    try {

        var snapshot =
            await getDocs(
                playersCollection
            );


        /*
           If Firebase is empty and this is
           an admin, upload the existing
           local players once.
        */

        if (
            snapshot.empty &&
            isAdmin() &&
            players.length > 0
        ) {

            for (
                var i = 0;
                i < players.length;
                i++
            ) {

                await savePlayerToFirebase(
                    players[i]
                );

            }

            return;

        }


        /*
           If Firebase already contains
           players, use the shared database.
        */

        if (!snapshot.empty) {

            players =
                snapshot.docs.map(
                    function(item) {

                        return item.data();

                    }
                );


            savePlayers();

            renderPlayers();

        }

    } catch (error) {

        console.error(
            "Firebase player loading error:",
            error
        );

        alert(
            "Could not connect to the shared player database."
        );

    }

}


/* =========================
   REAL-TIME FIREBASE LISTENER
========================= */

function startPlayerListener() {

    onSnapshot(
        playersCollection,
        function(snapshot) {

            players =
                snapshot.docs.map(
                    function(item) {

                        return item.data();

                    }
                );


            savePlayers();

            renderPlayers();

        },
        function(error) {

            console.error(
                "Firebase listener error:",
                error
            );

        }
    );

}


/* =========================
   EMPTY MANUAL STATS
========================= */

function createEmptyManualStats() {

    return {

        appearances: 0,

        goals: 0,

        assists: 0,

        playerOfMatch: 0,

        yellowCards: 0,

        redCards: 0

    };

}


/* =========================
   GET MANUAL STATS
========================= */

function getManualStats(player) {

    var season =
        getCurrentSeason();


    if (
        player.manualStats &&
        player.manualStats[season]
    ) {

        return player.manualStats[season];

    }


    return createEmptyManualStats();

}


/* =========================
   AUTOMATIC STATS
========================= */

function getAutomaticStats(player) {

    var stats =
        createEmptyManualStats();


    var season =
        getCurrentSeason();


    matches.forEach(
        function(match) {

            if (
                match.season !== season
            ) {

                return;

            }


            var playerId =
                String(player.id);


            var played =
                match.playersWhoPlayed || [];


            var goals =
                match.goalscorers || [];


            var assists =
                match.assists || [];


            var potm =
                match.playerOfMatch || [];


            var yellows =
                match.yellowCards || [];


            var reds =
                match.redCards || [];


            var appeared =
                played.some(
                    function(id) {

                        return String(id) ===
                            playerId;

                    }
                );


            if (appeared) {

                stats.appearances++;

            }


            goals.forEach(
                function(id) {

                    if (
                        String(id) ===
                        playerId
                    ) {

                        stats.goals++;

                    }

                }
            );


            assists.forEach(
                function(id) {

                    if (
                        String(id) ===
                        playerId
                    ) {

                        stats.assists++;

                    }

                }
            );


            potm.forEach(
                function(id) {

                    if (
                        String(id) ===
                        playerId
                    ) {

                        stats.playerOfMatch++;

                    }

                }
            );


            yellows.forEach(
                function(id) {

                    if (
                        String(id) ===
                        playerId
                    ) {

                        stats.yellowCards++;

                    }

                }
            );


            reds.forEach(
                function(id) {

                    if (
                        String(id) ===
                        playerId
                    ) {

                        stats.redCards++;

                    }

                }
            );

        }
    );


    return stats;

}


/* =========================
   TOTAL STATS
========================= */

function getTotalStats(player) {

    var automatic =
        getAutomaticStats(player);


    var manual =
        getManualStats(player);


    return {

        appearances:
            automatic.appearances +
            Number(
                manual.appearances || 0
            ),

        goals:
            automatic.goals +
            Number(
                manual.goals || 0
            ),

        assists:
            automatic.assists +
            Number(
                manual.assists || 0
            ),

        playerOfMatch:
            automatic.playerOfMatch +
            Number(
                manual.playerOfMatch || 0
            ),

        yellowCards:
            automatic.yellowCards +
            Number(
                manual.yellowCards || 0
            ),

        redCards:
            automatic.redCards +
            Number(
                manual.redCards || 0
            )

    };

}


/* =========================
   SAVE PLAYER
========================= */

async function savePlayer() {

    var name =
        playerNameInput.value.trim();


    var shirtNumber =
        shirtNumberInput.value.trim();


    var position =
        positionInput.value;


    if (!name) {

        alert(
            "Please enter the player's name."
        );

        playerNameInput.focus();

        return;

    }


    if (shirtNumber === "") {

        alert(
            "Please enter a shirt number."
        );

        shirtNumberInput.focus();

        return;

    }


    if (!position) {

        alert(
            "Please select a position."
        );

        positionInput.focus();

        return;

    }


    var existingPlayer =
        players.find(
            function(player) {

                return (
                    String(
                        player.shirtNumber
                    ) ===
                    String(shirtNumber)
                ) &&
                String(player.id) !==
                    String(editingPlayerId);

            }
        );


    if (existingPlayer) {

        alert(
            "That shirt number is already being used."
        );

        shirtNumberInput.focus();

        return;

    }


    if (editingPlayerId !== null) {

        await editExistingPlayer(
            name,
            shirtNumber,
            position
        );

    } else {

        await createNewPlayer(
            name,
            shirtNumber,
            position
        );

    }

}


/* =========================
   CREATE PLAYER
========================= */

async function createNewPlayer(
    name,
    shirtNumber,
    position
) {

    var player = {

        id:
            Date.now().toString(),

        name:
            name,

        shirtNumber:
            shirtNumber,

        position:
            position,

        photo:
            "",

        manualStats:
            {}

    };


    var file =
        playerPhotoInput.files[0];


    if (file) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please choose an image file."
            );

            return;

        }


        var reader =
            new FileReader();


        reader.onload =
            async function(event) {

                player.photo =
                    event.target.result;


                players.push(player);

                savePlayers();


                try {

                    await savePlayerToFirebase(
                        player
                    );

                    finishPlayerSave();

                } catch (error) {

                    console.error(error);

                    alert(
                        "Player was saved locally but could not be uploaded to Firebase."
                    );

                }

            };


        reader.readAsDataURL(file);

        return;

    }


    players.push(player);

    savePlayers();


    try {

        await savePlayerToFirebase(
            player
        );

        finishPlayerSave();

    } catch (error) {

        console.error(error);

        alert(
            "Player was saved locally but could not be uploaded to Firebase."
        );

    }

}


/* =========================
   EDIT PLAYER
========================= */

async function editExistingPlayer(
    name,
    shirtNumber,
    position
) {

    var player =
        players.find(
            function(item) {

                return String(item.id) ===
                    String(editingPlayerId);

            }
        );


    if (!player) {

        alert(
            "Player could not be found."
        );

        cancelEdit();

        return;

    }


    player.name =
        name;


    player.shirtNumber =
        shirtNumber;


    player.position =
        position;


    var file =
        playerPhotoInput.files[0];


    if (file) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please choose an image file."
            );

            return;

        }


        var reader =
            new FileReader();


        reader.onload =
            async function(event) {

                player.photo =
                    event.target.result;


                savePlayers();


                try {

                    await savePlayerToFirebase(
                        player
                    );

                    finishPlayerSave();

                } catch (error) {

                    console.error(error);

                    alert(
                        "Player was changed locally but could not be uploaded to Firebase."
                    );

                }

            };


        reader.readAsDataURL(file);

        return;

    }


    savePlayers();


    try {

        await savePlayerToFirebase(
            player
        );

        finishPlayerSave();

    } catch (error) {

        console.error(error);

        alert(
            "Player was changed locally but could not be uploaded to Firebase."
        );

    }

}


/* =========================
   FINISH SAVE
========================= */

function finishPlayerSave() {

    editingPlayerId = null;


    playerNameInput.value = "";

    shirtNumberInput.value = "";

    positionInput.value = "";

    playerPhotoInput.value = "";


    savePlayerButton.textContent =
        "ADD PLAYER";


    cancelEditButton.style.display =
        "none";


    document.getElementById(
        "formTitle"
    ).textContent =
        "ADD PLAYER";


    renderPlayers();

}


/* =========================
   EDIT PLAYER BUTTON
========================= */

function editPlayer(id) {

    var player =
        players.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!player) {

        return;

    }


    editingPlayerId =
        player.id;


    playerNameInput.value =
        player.name || "";


    shirtNumberInput.value =
        player.shirtNumber || "";


    positionInput.value =
        player.position || "";


    playerPhotoInput.value =
        "";


    savePlayerButton.textContent =
        "SAVE CHANGES";


    cancelEditButton.style.display =
        "inline-block";


    document.getElementById(
        "formTitle"
    ).textContent =
        "EDIT PLAYER";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

    editingPlayerId = null;


    playerNameInput.value = "";

    shirtNumberInput.value = "";

    positionInput.value = "";

    playerPhotoInput.value = "";


    savePlayerButton.textContent =
        "ADD PLAYER";


    cancelEditButton.style.display =
        "none";


    document.getElementById(
        "formTitle"
    ).textContent =
        "ADD PLAYER";

}


/* =========================
   DELETE PLAYER
========================= */

async function deletePlayer(id) {

    var player =
        players.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!player) {

        return;

    }


    var confirmed =
        confirm(
            "Delete " +
            player.name +
            "?\n\nTheir old match records will remain."
        );


    if (!confirmed) {

        return;

    }


    players =
        players.filter(
            function(item) {

                return String(item.id) !==
                    String(id);

            }
        );


    savePlayers();

    renderPlayers();


    try {

        await deletePlayerFromFirebase(
            id
        );

    } catch (error) {

        console.error(error);

        alert(
            "The player was removed locally but could not be removed from Firebase."
        );

    }

}


/* =========================
   MANUAL STATS
========================= */

async function editManualStats(id) {

    var player =
        players.find(
            function(item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!player) {

        return;

    }


    var season =
        getCurrentSeason();


    if (!player.manualStats) {

        player.manualStats = {};

    }


    if (!player.manualStats[season]) {

        player.manualStats[season] =
            createEmptyManualStats();

    }


    var stats =
        player.manualStats[season];


    var appearances =
        prompt(
            "Manual appearances:",
            stats.appearances
        );


    if (appearances === null) {

        return;

    }


    var goals =
        prompt(
            "Manual goals:",
            stats.goals
        );


    if (goals === null) {

        return;

    }


    var assists =
        prompt(
            "Manual assists:",
            stats.assists
        );


    if (assists === null) {

        return;

    }


    var potm =
        prompt(
            "Manual player of the match:",
            stats.playerOfMatch
        );


    if (potm === null) {

        return;

    }


    var yellow =
        prompt(
            "Manual yellow cards:",
            stats.yellowCards
        );


    if (yellow === null) {

        return;

    }


    var red =
        prompt(
            "Manual red cards:",
            stats.redCards
        );


    if (red === null) {

        return;

    }


    stats.appearances =
        safeNumber(appearances);


    stats.goals =
        safeNumber(goals);


    stats.assists =
        safeNumber(assists);


    stats.playerOfMatch =
        safeNumber(potm);


    stats.yellowCards =
        safeNumber(yellow);


    stats.redCards =
        safeNumber(red);


    savePlayers();

    renderPlayers();


    try {

        await savePlayerToFirebase(
            player
        );

    } catch (error) {

        console.error(error);

        alert(
            "Stats were changed locally but could not be uploaded to Firebase."
        );

    }

}


/* =========================
   NUMBER CHECK
========================= */

function safeNumber(value) {

    var number =
        Number(value);


    if (
        !Number.isFinite(number) ||
        number < 0
    ) {

        return 0;

    }


    return Math.floor(number);

}


/* =========================
   PLAYER CARD
========================= */

function createPlayerCard(player) {

    var card =
        document.createElement("div");


    card.className =
        "player-card";


    var header =
        document.createElement("div");


    header.style.display =
        "flex";


    header.style.alignItems =
        "center";


    header.style.gap =
        "15px";


    if (player.photo) {

        var image =
            document.createElement("img");


        image.src =
            player.photo;


        image.alt =
            player.name;


        image.style.width =
            "65px";


        image.style.height =
            "65px";


        image.style.borderRadius =
            "50%";


        image.style.objectFit =
            "cover";


        image.style.border =
            "2px solid #3d82ee";


        header.appendChild(
            image
        );

    } else {

        var placeholder =
            document.createElement("div");


        placeholder.textContent =
            player.shirtNumber;


        placeholder.style.width =
            "65px";


        placeholder.style.height =
            "65px";


        placeholder.style.borderRadius =
            "50%";


        placeholder.style.display =
            "flex";


        placeholder.style.alignItems =
            "center";


        placeholder.style.justifyContent =
            "center";


        placeholder.style.background =
            "#172b4d";


        placeholder.style.border =
            "2px solid #3d82ee";


        placeholder.style.fontWeight =
            "bold";


        placeholder.style.fontSize =
            "22px";


        header.appendChild(
            placeholder
        );

    }


    var information =
        document.createElement("div");


    var name =
        document.createElement("h3");


    name.textContent =
        player.name;


    var details =
        document.createElement("p");


    details.textContent =
        "#" +
        player.shirtNumber +
        " • " +
        player.position;


    information.appendChild(
        name
    );


    information.appendChild(
        details
    );


    header.appendChild(
        information
    );


    card.appendChild(
        header
    );


    var stats =
        getTotalStats(player);


    var statsText =
        document.createElement("p");


    statsText.textContent =
        "Apps: " +
        stats.appearances +
        " • Goals: " +
        stats.goals +
        " • Assists: " +
        stats.assists;


    card.appendChild(
        statsText
    );


    var viewButton =
        document.createElement("button");


    viewButton.type =
        "button";


    viewButton.textContent =
        "VIEW PROFILE";


    viewButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            window.location.href =
                "stats.html?id=" +
                encodeURIComponent(
                    player.id
                );

        }
    );


    card.appendChild(
        viewButton
    );


    if (isAdmin()) {

        var editButton =
            document.createElement("button");


        editButton.type =
            "button";


        editButton.textContent =
            "EDIT PLAYER";


        editButton.style.marginLeft =
            "8px";


        editButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                editPlayer(
                    player.id
                );

            }
        );


        card.appendChild(
            editButton
        );


        var manualButton =
            document.createElement("button");


        manualButton.type =
            "button";


        manualButton.textContent =
            "MANUAL STATS";


        manualButton.style.marginLeft =
            "8px";


        manualButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                editManualStats(
                    player.id
                );

            }
        );


        card.appendChild(
            manualButton
        );


        var deleteButton =
            document.createElement("button");


        deleteButton.type =
            "button";


        deleteButton.textContent =
            "DELETE";


        deleteButton.style.marginLeft =
            "8px";


        deleteButton.style.background =
            "#dc2626";


        deleteButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();


                deletePlayer(
                    player.id
                );

            }
        );


        card.appendChild(
            deleteButton
        );

    }


    card.addEventListener(
        "click",
        function() {

            window.location.href =
                "stats.html?id=" +
                encodeURIComponent(
                    player.id
                );

        }
    );


    return card;

}


/* =========================
   RENDER PLAYERS
========================= */

function renderPlayers() {

    if (!playerList) {

        return;

    }


    playerList.innerHTML = "";


    if (players.length === 0) {

        var empty =
            document.createElement("p");


        empty.textContent =
            "No players have been added yet.";


        playerList.appendChild(
            empty
        );


        return;

    }


    players.sort(
        function(a, b) {

            return (
                Number(a.shirtNumber) -
                Number(b.shirtNumber)
            );

        }
    );


    players.forEach(
        function(player) {

            playerList.appendChild(
                createPlayerCard(
                    player
                )
            );

        }
    );

}


/* =========================
   SEASON CHANGE
========================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            "selectedSeason"
        ) {

            updateSeasonText();

            renderPlayers();

        }

    }
);


/* =========================
   MAKE HTML BUTTONS WORK
========================= */

window.savePlayer =
    savePlayer;


window.cancelEdit =
    cancelEdit;


window.editPlayer =
    editPlayer;


window.deletePlayer =
    deletePlayer;


window.editManualStats =
    editManualStats;


/* =========================
   START
========================= */

updateSeasonText();

renderPlayers();

loadPlayersFromFirebase();

startPlayerListener();
