const express = require("express");
const router = express.Router();
const flash = require("connect-flash");
const { ensureAuthenticated } = require("../config/auth");
const Team = require("../models/team");
const res = require("express/lib/response");
const Player = require("../models/player");
const EventMatch = require("../models/eventMatch");
const multer = require("multer");
const upload = multer({ dest: "public/uploads" });

//TEAM ADMIN//
router.get("/teams", async (req, res) => {
  const teams = await Team.find({});
  res.render("admin_views/team", { teams });
});

router.post(
  "/addTeam",
  ensureAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const teams = await Team.find({});

    const team = new Team();
    team.name = req.body.name;
    team.since = req.body.since;
    if (req.file != undefined) {
      team.logo = req.file.filename;
    }

    try {
      await team.save();
      res.redirect("/teams");
    } catch (e) {
      res.render("admin_views/team", { teams, errors: e });
    }
  }
);
router.get("/teams/:id", async (req, res) => {
  const team = await Team.findById({ _id: req.params.id });
  const teams = await Team.find({});
  const players = await Player.find({ teamId: { $in: [team._id] } });

  for (i = 0; i < players.length; i++) {
    const goals = await EventMatch.find({
      playerId: players[i]._id,
      event: "goal",
    });
    const yellowCards = await EventMatch.find({
      playerId: players[i]._id,
      event: "yelowCard",
    });
    const redCards = await EventMatch.find({
      playerId: players[i]._id,
      event: "redCard",
    });
    players[i].goals = goals.length;
    players[i].yellowCards = yellowCards.length;
    players[i].redCards = redCards.length;
  }

  res.render("admin_views/teamDetails", {
    team,
    teams,
    players,
  });
});

router.get("/teams/:id/edytuj", async (req, res) => {
  const id = req.params.id;
  const teams = await Team.find({});
  const team = await Team.findOne({ _id: id });
  res.render("admin_views/editTeam", { teams, team });
});

router.post("/teams/:id/edytuj", upload.single("image"), async (req, res) => {
  const teams = await Team.find({});
  const id = req.params.id;
  const name = req.body.name;
  const since = req.body.since;
  const team = await Team.findOne({ _id: id });
  team.name = name;
  team.since = since;
  console.log(req.file);
  if (req.file != undefined) {
    team.logo = req.file.filename;
  } else {
    console.log("sadsssss");
    team.logo = "defaultLogo";
  }

  try {
    await team.save();
    res.redirect("/teams");
  } catch (e) {
    res.render("admin_views/editTeam", { team, teams, errors: e });
  }
});

router.get("/teams/:id/usun", async (req, res) => {
  const id = req.params.id;
  const teams = await Team.deleteOne({ _id: id });
  res.redirect("/teams");
});

module.exports = router;
