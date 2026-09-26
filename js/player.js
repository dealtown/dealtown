requireLogin();

var players = [];
var matches = [];

var playerId =
    new URLSearchParams(
        window.location.search
    ).get("id");


function loadData() {

    var savedPlayers =
        localStorage.getItem("players");

    var savedMatches =
        localStorage.getItem("matches");


    if (savedPlayers) {

        try {

            players =
                JSON.parse(savedPlayers);

        } catch (error) {

            players = [];

        }

    }


    if (savedMatches) {

        try {

            matches =
                JSON.parse(savedMatches);

        } catch (error) {

            matches = [];

        }

    }

}


function getCurrentSeason() {

    return localStorage.getItem(
        "selectedSeason"
    ) || "2026/27";

}


function getPlayer() {

    return players.find(
        function(player) {

            return String(player.id) ===
                String(playerId);

        }
    );

}


function getPlayerStats(player) {

    var stats = {

        appearances: 0,
        goals: 0,
        assists: 0,
        playerOfMatch: 0,
        yellowCards: 0,
        redCards: 0

    };


    var season =
        getCurrentSeason();


    matches.forEach(
        function(match) {

            if (
                match.season &&
                match.season !== season
            ) {

                return;

            }


            var played =
                match.playersWhoPlayed || [];

            var goalscorers =
                match.goalscorers || [];

            var assists =
                match.assists || [];

            var potm =
                match.playerOfMatch || [];

            var yellow =
                match.yellowCards || [];

            var red =
                match.redCards || [];


            if (
                played.some(
                    function(id) {

                        return String(id) ===
                            String(player.id);

                    }
                )
            ) {

                stats.appearances++;

            }


            goalscorers.forEach(
                function(id) {

                    if (
                        String(id) ===
                        String(player.id)
                    ) {

                        stats.goals++;

                    }

                }
            );


            assists.forEach(
                function(id) {

                    if (
                        String(id) ===
                        String(player.id)
                    ) {

                        stats.assists++;

                    }

                }
            );


            potm.forEach(
                function(id) {

                    if (
                        String(id) ===
                        String(player.id)
                    ) {

                        stats.playerOfMatch++;

                    }

                }
            );


            yellow.forEach(
                function(id) {

                    if (
                        String(id) ===
                        String(player.id)
                    ) {

                        stats.yellowCards++;

                    }

                }
            );


            red.forEach(
                function(id) {

                    if (
                        String(id) ===
                        String(player.id)
                    ) {

                        stats.redCards++;

                    }

                }
            );

        }
    );


    if (
        player.manualStats &&
        player.manualStats[season]
    ) {

        var manual =
            player.manualStats[season];


        stats.appearances +=
            Number(manual.appearances) || 0;

        stats.goals +=
            Number(manual.goals) || 0;

        stats.assists +=
            Number(manual.assists) || 0;

        stats.playerOfMatch +=
            Number(manual.playerOfMatch) || 0;

        stats.yellowCards +=
            Number(manual.yellowCards) || 0;

        stats.redCards +=
            Number(manual.redCards) || 0;

    }


    return stats;

}


function displayProfile(player) {

    var profile =
        document.getElementById(
            "playerProfile"
        );


    var stats =
        getPlayerStats(player);


    profile.innerHTML = "";


    var title =
        document.createElement("h2");

    title.textContent =
        player.name;


    var details =
        document.createElement("p");

    details.textContent =
        "#" +
        player.shirtNumber +
        " • " +
        player.position;


    profile.appendChild(title);
    profile.appendChild(details);


    if (player.photo) {

        var image =
            document.createElement("img");

        image.src =
            player.photo;

        image.alt =
            player.name;

        image.className =
            "player-profile-photo";

        profile.appendChild(image);

    }


    var grid =
        document.createElement(
            "div"
        );

    grid.className =
        "player-stat-grid";


    addStat(
        grid,
        "APPEARANCES",
        stats.appearances
    );

    addStat(
        grid,
        "GOALS",
        stats.goals
    );

    addStat(
        grid,
        "ASSISTS",
        stats.assists
    );

    addStat(
        grid,
        "POTM",
        stats.playerOfMatch
    );

    addStat(
        grid,
        "YELLOW",
        stats.yellowCards
    );

    addStat(
        grid,
        "RED",
        stats.redCards
    );


    profile.appendChild(grid);

}


function addStat(
    container,
    label,
    value
) {

    var box =
        document.createElement("div");


    var number =
        document.createElement("strong");

    number.textContent =
        value;


    var text =
        document.createElement("span");

    text.textContent =
        label;


    box.appendChild(number);
    box.appendChild(text);

    container.appendChild(box);

}


function displayMatches(player) {

    var matchList =
        document.getElementById(
            "matchList"
        );


    matchList.innerHTML = "";


    var season =
        getCurrentSeason();


    var playerMatches =
        matches.filter(
            function(match) {

                if (
                    match.season &&
                    match.season !== season
                ) {

                    return false;

                }


                var played =
                    match.playersWhoPlayed || [];


                return played.some(
                    function(id) {

                        return String(id) ===
                            String(player.id);

                    }
                );

            }
        );


    if (playerMatches.length === 0) {

        var empty =
            document.createElement("p");

        empty.textContent =
            "No matches recorded for this player this season.";

        matchList.appendChild(empty);

        return;

    }


    playerMatches.forEach(
        function(match) {

            var matchCard =
                document.createElement(
                    "div"
                );

            matchCard.className =
                "stat-card";


            var result = "DRAW";


            if (
                Number(match.goalsFor) >
                Number(match.goalsAgainst)
            ) {

                result = "WIN";

            } else if (
                Number(match.goalsFor) <
                Number(match.goalsAgainst)
            ) {

                result = "LOSS";

            }


            var title =
                document.createElement("h3");

            title.textContent =
                match.date +
                " • " +
                result;


            var opponent =
                document.createElement("p");

            opponent.textContent =
                "vs " +
                match.opponent;


            var score =
                document.createElement("p");

            score.textContent =
                "Score: " +
                match.goalsFor +
                " - " +
                match.goalsAgainst;


            var venue =
                document.createElement("p");

            if (match.venue) {

                venue.textContent =
                    "Venue: " +
                    match.venue;

            }


            matchCard.appendChild(title);
            matchCard.appendChild(opponent);
            matchCard.appendChild(score);


            if (match.venue) {

                matchCard.appendChild(
                    venue
                );

            }


            matchList.appendChild(
                matchCard
            );

        }
    );

}


function showError(message) {

    var profile =
        document.getElementById(
            "playerProfile"
        );


    profile.innerHTML = "";


    var heading =
        document.createElement("h2");

    heading.textContent =
        "PLAYER NOT FOUND";


    var text =
        document.createElement("p");

    text.textContent =
        message;


    profile.appendChild(heading);
    profile.appendChild(text);


    document.getElementById(
        "matchList"
    ).innerHTML = "";

}


loadData();


var player =
    getPlayer();


if (!player) {

    showError(
        "This player does not exist."
    );

} else {

    displayProfile(player);

    displayMatches(player);

}