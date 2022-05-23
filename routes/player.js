const express = require("express");
const router = express.Router();
const flash = require("connect-flash");
const { ensureAuthenticated } = require("../config/auth");
const Team = require("../models/team");
const Match = require("../models/match");
const EventMatch = require("../models/eventMatch");
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");
const Player = require("../models/player");

router.get("/:id/addPlayer/", async (req, res) => {
  const teams = await Team.find({});
  res.render("admin_views/addPlayer", { teams });
});

router.post("/addPlayer", ensureAuthenticated, async (req, res) => {
  const teams = await Team.find({});
  const player = new Player({
    fname: req.body.fname,
    lname: req.body.lname,
    teamId: req.body.teamId,
    birthDate: req.body.date,
  });
  try {
    await player.save();
    res.redirect("/teams/" + req.body.teamId);
  } catch (e) {
    res.render("admin_views/addPlayer", { teams, errors: e });
  }
});

router.get("/player/:id/usun", ensureAuthenticated, async (req, res) => {
  const player = await Player.findById({ _id: req.params.id });
  const idTeam = await Team.findById({ _id: player.teamId.valueOf() });
  await Player.deleteOne({ _id: req.params.id });
  res.redirect("/teams/" + idTeam._id);
});
router.get("/player/:id", async (req, res) => {
  const teams = await Team.find({});

  const player = await Player.findById({ _id: req.params.id });
  res.render("admin_views/playerDetails", {
    teams,
    player,
  });
});

router.get("/player/:id/edytuj", ensureAuthenticated, async (req, res) => {
  const teams = await Team.find({});
  const player = await Player.findById({ _id: req.params.id });
  res.render("admin_views/editPlayer", { teams, player });
});

router.post("/player/:id/edytuj", ensureAuthenticated, async (req, res) => {
  const teams = await Team.find({});
  const player = await Player.findById({ _id: req.params.id });

  if (!req.body.date == "") {
    player.birthDate = req.body.date;
  }
  player.fname = req.body.fname;
  player.lname = req.body.lname;
  player.teamId = req.body.teamId;
  try {
    await player.save();

    res.redirect("/teams/" + player.teamId);
  } catch (e) {
    res.render("admin_views/editPlayer", { teams, player, errors: e });
  }
});

module.exports = router;
