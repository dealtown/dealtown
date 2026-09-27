<!DOCTYPE html>

<html lang="en">

<head>

```
<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>
    Player Profile - Deal Town U10 Hoops
</title>

<link
    rel="stylesheet"
    href="style.css"
>
```

</head>

<body>

```
<main class="dashboard">

    <!-- PAGE HEADER -->

    <div class="team-header">

        <img
            src="team-logo.png"
            alt="Deal Town U10 Hoops"
            class="team-logo"
        >

        <div class="team-title">

            <h1>PLAYER PROFILE</h1>

            <h2>DEAL TOWN U10 HOOPS</h2>

            <p>PLAYER STATISTICS</p>

        </div>

        <img
            src="team-logo.png"
            alt="Deal Town U10 Hoops"
            class="team-logo"
        >

    </div>


    <!-- PLAYER PROFILE -->

    <section
        id="playerProfile"
        class="stat-card"
    >

        <p>
            Loading player...
        </p>

    </section>


    <!-- PLAYER MATCH HISTORY -->

    <section
        id="playerMatches"
        class="stat-card"
    >

        <h2>
            MATCH HISTORY
        </h2>

        <div id="matchList">

            <p>
                Loading matches...
            </p>

        </div>

    </section>


    <!-- NAVIGATION -->

    <div class="menu">

        <button
            type="button"
            onclick="window.location.href='playerstats.html'"
        >
            BACK TO PLAYERS
        </button>

        <button
            type="button"
            onclick="window.location.href='dashboard.html'"
        >
            DASHBOARD
        </button>

    </div>


    <!-- LOG OUT -->

    <button
        type="button"
        class="logout-button"
        onclick="logout()"
    >
        LOG OUT
    </button>

</main>


<!-- AUTH -->

<script src="js/auth.js"></script>


<!-- PLAYER PROFILE -->

<script
    type="module"
    src="js/stats.js"
></script>
```

</body>

</html>
