function displayPlayers() {
    playerList.innerHTML = "";

    if (players.length === 0) {
        var emptyCard = document.createElement("div");
        emptyCard.className = "stat-card";

        var emptyTitle = document.createElement("h2");
        emptyTitle.textContent = "NO PLAYERS YET";

        var emptyText = document.createElement("p");

        if (isAdmin()) {
            emptyText.textContent = "Add your first player using the form above.";
        } else {
            emptyText.textContent = "No players have been added yet.";
        }

        emptyCard.appendChild(emptyTitle);
        emptyCard.appendChild(emptyText);
        playerList.appendChild(emptyCard);

        return;
    }

    players.forEach(function(player) {
        var card = document.createElement("div");
        card.className = "player-card";

        var photoArea = document.createElement("div");
        photoArea.className = "player-photo";

        if (player.photo) {
            var photo = document.createElement("img");
            photo.src = player.photo;
            photo.alt = player.name;
            photoArea.appendChild(photo);
        } else {
            var noPhoto = document.createElement("span");
            noPhoto.textContent = "NO PHOTO";
            photoArea.appendChild(noPhoto);
        }

        var info = document.createElement("div");
        info.className = "player-info";

        var name = document.createElement("h2");
        name.textContent = player.name;

        var details = document.createElement("p");
        details.textContent =
            "Number: " + player.shirtNumber +
            " | Position: " + player.position;

        info.appendChild(name);
        info.appendChild(details);

        var stats = getPlayerStats(player);

        var statGrid = document.createElement("div");
        statGrid.className = "player-stat-grid";

        addPlayerStat(statGrid, "APPEARANCES", stats.appearances);
        addPlayerStat(statGrid, "GOALS", stats.goals);
        addPlayerStat(statGrid, "ASSISTS", stats.assists);
        addPlayerStat(statGrid, "POTM", stats.playerOfMatch);
        addPlayerStat(statGrid, "YELLOW", stats.yellowCards);
        addPlayerStat(statGrid, "RED", stats.redCards);

        info.appendChild(statGrid);

        card.appendChild(photoArea);
        card.appendChild(info);

        if (isAdmin()) {
            var actions = document.createElement("div");
            actions.className = "player-actions";

            var editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "EDIT";
            editButton.onclick = function(event) {
                event.stopPropagation();
                editPlayer(player.id);
            };

            var statsButton = document.createElement("button");
            statsButton.type = "button";
            statsButton.textContent = "EDIT STATS";
            statsButton.onclick = function(event) {
                event.stopPropagation();
                editStats(player.id);
            };

            var deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-player";
            deleteButton.textContent = "DELETE";
            deleteButton.onclick = function(event) {
                event.stopPropagation();
                deletePlayer(player.id);
            };

            actions.appendChild(editButton);
            actions.appendChild(statsButton);
            actions.appendChild(deleteButton);

            card.appendChild(actions);
        }

        card.onclick = function() {
            window.location.href = "player.html?id=" + player.id;
        };

        playerList.appendChild(card);
    });
}