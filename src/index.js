const express = require("express");
const path = require("path");
const expressHbs = require("express-handlebars");
const { urlencoded } = require("body-parser");
const { players, restrictions } = require("./data.json");
const { getTeamGroups } = require("./getTeamGroups");

// Players data
let myPlayers = new Set([...players]);
let myRestrictions = restrictions;
let myGroups = [];
let isEnableRandomTeam = false;

const updateGroups = () => {
  myGroups = getTeamGroups([...myPlayers], myRestrictions, isEnableRandomTeam);
};

// Server Settings
const app = express();
const urlencodedParser = urlencoded({ extended: false });
app.set("views", path.join(__dirname, "/views"));
app.engine(
  "hbs",
  expressHbs({
    extname: "hbs",
    defaultLayout: "",
    layoutsDir: "",
  })
);
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use("/", express.static(__dirname + "/public"));

// Main Page
app.get("/", urlencodedParser, (request, response) => {
  updateGroups();

  response.render("main.hbs", {
    title: "Main Page",
    isOdd: myPlayers.size % 2 !== 0,
    isNoRestrictions: Object.keys(myRestrictions).length === 0,
    players: [...myPlayers],
    restrictions: myRestrictions,
    playerGroups: myGroups,
  });
});

// Add Players
app.get("/add-player", urlencodedParser, (request, response) => {
  response.render("addPlayer.hbs", {
    title: "Add Player",
  });
});

app.get("/add-players", urlencodedParser, (request, response) => {
  response.render("addPlayers.hbs", {
    title: "Add Players",
  });
});

app.post("/add-player", urlencodedParser, (request, response) => {
  if (!request.body) return response.sendStatus(400);

  console.log(request.body);
  const { playerName, playerSurname } = request.body;
  myPlayers.add(playerName.trim() + " " + playerSurname.trim());
  response.redirect("/");
});

app.post("/add-players", urlencodedParser, (request, response) => {
  if (!request.body) return response.sendStatus(400);

  console.log(request.body);
  const newPlayers = request.body.newPlayers;
  let players = [];

  if (newPlayers.includes(",")) {
    players = newPlayers.trim().split(",");
  } else {
    players = newPlayers.trim().split("\r\n");
  }

  players.forEach((player) => {
    player = player.trim();

    if (player.length > 0) {
      myPlayers.add(player.trim());
    }
  });

  response.redirect("/");
});

// Restrictions
app.get("/add-restrictions", urlencodedParser, (request, response) => {
  response.render("addRestrictions.hbs", {
    title: "Add Restrictions",
    players: [...myPlayers],
  });
});

app.post("/add-restrictions", urlencodedParser, (request, response) => {
  if (!request.body) return response.sendStatus(400);

  console.log(request.body);
  const { toAdd, whoAdd } = request.body;

  if (toAdd !== whoAdd) {
    if (!(toAdd in myRestrictions)) {
      myRestrictions[toAdd] = [whoAdd];
    } else if (myRestrictions[toAdd].indexOf(whoAdd) < 0) {
      myRestrictions[toAdd].push(whoAdd);
    }

    if (!(whoAdd in myRestrictions)) {
      myRestrictions[whoAdd] = [toAdd];
    } else if (myRestrictions[whoAdd].indexOf(toAdd) < 0) {
      myRestrictions[whoAdd].push(toAdd);
    }
  }

  response.redirect("/");
});

// Settings
app.get("/settings", urlencodedParser, (request, response) => {
  response.render("settings.hbs", {
    title: "Settings",
    isEnableRandomTeam,
  });
});

app.post("/settings", urlencodedParser, (request, response) => {
  if (!request.body) return response.sendStatus(400);
  const { settingsSelection, enableRandomTeams } = request.body;

  if (enableRandomTeams === "on") {
    isEnableRandomTeam = true;
  } else {
    isEnableRandomTeam = false;
  }

  switch (settingsSelection) {
    case "deleteRestrictions":
      myRestrictions = {};
      break;
    case "deleteAllPlayersData":
      myRestrictions = {};
      myPlayers = new Set();
      break;
    case "loadDefaultPlayersRestrictions":
      myRestrictions = restrictions;
      break;
    case "loadDefaultPlayersData":
      myPlayers = new Set(players);
      break;
    case "enableRandomTeams":
      break;
    default:
      break;
  }

  myGroups = [];
  response.redirect("/");
});

// Errors
app.get("*", urlencodedParser, (request, response) => {
  response.render("error.hbs", {
    title: "Error Page",
  });
});

// Server
const PORT = process.env.port | 3000;
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}...`);
});
