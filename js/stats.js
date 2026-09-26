requireLogin();

var profile = document.getElementById("playerProfile");
var matchList = document.getElementById("matchList");

var players = JSON.parse(
    localStorage.getItem("players")
) || [];

var matches = JSON.parse(
    localStorage.getItem("matches")
) || [];

var playerId = new URLSearchParams(
    window.location.search
).get("id");


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


function getAutomaticStats(player) {

    var stats = {
        appearances: 0,
        goals: 0,
        assists: 0,
        playerOfMatch: 0,
        yellowCards: 0,
        redCards: 0
    };

    var season = getCurrentSeason();

    matches.forEach(
        function(match) {

            if (match.season !== season) {
                return;
            }

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


            goals.forEach(
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


            yellows.forEach(
                function(id) {
                    if (
                        String(id) ===
                        String(player.id)
                    ) {
                        stats.yellowCards++;
                    }
                }
            );


            reds.forEach(
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

    return stats;
}


function getManualStats(player) {

    var season = getCurrentSeason();

    if (
        player.manualStats &&
        player.manualStats[season]
    ) {
        return player.manualStats[season];
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


function getTotalStats(player) {

    var automatic =
        getAutomaticStats(player);

    var manual =
        getManualStats(player);

    return {
        appearances:
            automatic.appearances +
            Number(manual.appearances || 0),

        goals:
            automatic.goals +
            Number(manual.goals || 0),

        assists:
            automatic.assists +
            Number(manual.assists || 0),

        playerOfMatch:
            automatic.playerOfMatch +
            Number(manual.playerOfMatch || 0),

        yellowCards:
            automatic.yellowCards +
            Number(manual.yellowCards || 0),

        redCards:
            automatic.redCards +
            Number(manual.redCards || 0)
    };
}


function addStat(
    grid,
    value,
    label
) {

    var box =
        document.createElement("div");

    var number =
        document.createElement("strong");

    number.textContent = value;

    var text =
        document.createElement("span");

    text.textContent = label;

    box.appendChild(number);
    box.appendChild(text);

    grid.appendChild(box);
}


function createStatGrid(stats) {

    var grid =
        document.createElement("div");

    grid.className =
        "player-stat-grid";

    addStat(
        grid,
        stats.appearances,
        "APPS"
    );

    addStat(
        grid,
        stats.goals,
        "GOALS"
    );

    addStat(
        grid,
        stats.assists,
        "ASSISTS"
    );

    addStat(
        grid,
        stats.playerOfMatch,
        "POTM"
    );

    addStat(
        grid,
        stats.yellowCards,
        "YELLOW"
    );

    addStat(
        grid,
        stats.redCards,
        "RED"
    );

    return grid;
}


function displayProfile(player) {

    if (!player) {

        profile.innerHTML = "";

        var heading =
            document.createElement("h2");

        heading.textContent =
            "PLAYER NOT FOUND";

        var message =
            document.createElement("p");

        message.textContent =
            "This player does not exist.";

        profile.appendChild(heading);
        profile.appendChild(message);

        document.getElementById(
            "playerMatches"
        ).style.display = "none";

        return;
    }


    var automatic =
        getAutomaticStats(player);

    var manual =
        getManualStats(player);

    var total =
        getTotalStats(player);


    profile.innerHTML = "";


    var header =
        document.createElement("div");

    header.className =
        "player-profile-header";


    if (player.photo) {

        var image =
            document.createElement("img");

        image.src =
            player.photo;

        image.alt =
            player.name;

        image.className =
            "player-profile-photo";

        header.appendChild(image);

    } else {

        var placeholder =
            document.createElement("div");

        placeholder.className =
            "player-profile-placeholder";

        placeholder.textContent =
            player.shirtNumber;

        header.appendChild(placeholder);
    }


    var information =
        document.createElement("div");


    var name =
        document.createElement("h2");

    name.textContent =
        player.name;


    var details =
        document.createElement("p");

    details.textContent =
        "#" +
        player.shirtNumber +
        " • " +
        player.position;


    var season =
        document.createElement("p");

    season.textContent =
        "Season: " +
        getCurrentSeason();


    information.appendChild(name);
    information.appendChild(details);
    information.appendChild(season);

    header.appendChild(information);

    profile.appendChild(header);


    var totalTitle =
        document.createElement("h2");

    totalTitle.textContent =
        "TOTAL STATS";

    profile.appendChild(totalTitle);

    profile.appendChild(
        createStatGrid(total)
    );


    var automaticTitle =
        document.createElement("h2");

    automaticTitle.textContent =
        "AUTOMATIC STATS";

    profile.appendChild(
        automaticTitle
    );


    var automaticText =
        document.createElement("p");

    automaticText.textContent =
        "Calculated directly from match records.";

    profile.appendChild(
        automaticText
    );

    profile.appendChild(
        createStatGrid(automatic)
    );


    var manualTitle =
        document.createElement("h2");

    manualTitle.textContent =
        "MANUAL STATS";

    profile.appendChild(
        manualTitle
    );


    var manualText =
        document.createElement("p");

    manualText.textContent =
        "Extra statistics entered manually for this season.";

    profile.appendChild(
        manualText
    );

    profile.appendChild(
        createStatGrid(manual)
    );
}


function displayMatches(player) {

    if (!player) {
        return;
    }

    matchList.innerHTML = "";

    var season =
        getCurrentSeason();


    var playerMatches =
        matches.filter(
            function(match) {

                if (
                    match.season !== season
                ) {
                    return false;
                }

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


                return (
                    played.some(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ) ||

                    goals.some(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ) ||

                    assists.some(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ) ||

                    potm.some(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ) ||

                    yellows.some(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ) ||

                    reds.some(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    )
                );
            }
        );


    playerMatches.sort(
        function(a, b) {
            return new Date(b.date) -
                new Date(a.date);
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

            var card =
                document.createElement("div");

            card.className =
                "match-card";


            var goalsFor =
                Number(match.goalsFor) || 0;

            var goalsAgainst =
                Number(match.goalsAgainst) || 0;


            var result = "DRAW";

            if (goalsFor > goalsAgainst) {
                result = "WIN";
            } else if (
                goalsFor < goalsAgainst
            ) {
                result = "LOSS";
            }


            var goals =
                (match.goalscorers || [])
                    .filter(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ).length;


            var assists =
                (match.assists || [])
                    .filter(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ).length;


            var potm =
                (match.playerOfMatch || [])
                    .filter(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ).length;


            var yellows =
                (match.yellowCards || [])
                    .filter(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ).length;


            var reds =
                (match.redCards || [])
                    .filter(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    ).length;


            var played =
                (match.playersWhoPlayed || [])
                    .some(
                        function(id) {
                            return String(id) ===
                                String(player.id);
                        }
                    );


            var title =
                document.createElement("h3");

            title.textContent =
                match.opponent;


            var date =
                document.createElement("p");

            date.textContent =
                match.date +
                " • " +
                (match.venue ||
                    "Venue not recorded");


            var score =
                document.createElement("strong");

            score.textContent =
                goalsFor +
                " - " +
                goalsAgainst;


            var resultText =
                document.createElement("p");

            resultText.textContent =
                "Result: " +
                result;


            var playedText =
                document.createElement("p");

            playedText.textContent =
                "Played: " +
                (played ? "Yes" : "No");


            var goalsText =
                document.createElement("p");

            goalsText.textContent =
                "Goals: " +
                goals;


            var assistsText =
                document.createElement("p");

            assistsText.textContent =
                "Assists: " +
                assists;


            var potmText =
                document.createElement("p");

            potmText.textContent =
                "POTM: " +
                potm;


            var yellowText =
                document.createElement("p");

            yellowText.textContent =
                "Yellow Cards: " +
                yellows;


            var redText =
                document.createElement("p");

            redText.textContent =
                "Red Cards: " +
                reds;


            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(score);
            card.appendChild(resultText);
            card.appendChild(playedText);
            card.appendChild(goalsText);
            card.appendChild(assistsText);
            card.appendChild(potmText);
            card.appendChild(yellowText);
            card.appendChild(redText);

            matchList.appendChild(card);
        }
    );
}


var player = getPlayer();

displayProfile(player);
displayMatches(player);