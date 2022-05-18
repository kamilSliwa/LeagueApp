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

router.get("/matchs", async (req, res) => {
  const match = await Match.find({});
  const teams = await Team.find({});
  const events = await EventMatch.find({});
  const player = await Player.find({});

  for (i = 0; i < match.length; i++) {
    const homeTeam = teams.find((element) => element._id == match[i].homeTeam);
    const awayTeam = teams.find((element) => element._id == match[i].awayTeam);
    if (homeTeam == undefined) {
      match[i].homeTeam = "drużyna usunięta";
    } else match[i].homeTeam = homeTeam.name;

    if (awayTeam == undefined) {
      match[i].awayTeam = "drużyna usunięta";
    } else match[i].awayTeam = awayTeam.name;
  }

  //Creating table
  const tabela = [];
  teams.forEach((element) => {
    const team = {
      id: element._id.valueOf(),
      name: element.name,
      playedHome: 0,
      playedAway: 0,
      points: 0,
      played: function () {
        return this.playedHome + this.playedAway;
      },
    };
    tabela.push(team);
  }); //Match played
  tabela.forEach((team) => {
    const homePlayed = match.filter((s) => {
      return s.homeTeam == team.name;
    });
    team.playedHome = homePlayed.length;

    const awayPlayed = match.filter((s) => {
      return s.awayTeam == team.name;
    });
    team.playedAway = awayPlayed.length;

    homePlayed.forEach((match) => {
      const matchResoult = match.getResoult();
      if (matchResoult == 1) {
        team.points = team.points + 3;
      } else if (matchResoult == 2) {
        team.points = team.points;
      } else if (matchResoult == 0) {
        team.points = team.points + 1;
      }
    });
    awayPlayed.forEach((match) => {
      const matchResoult = match.getResoult();
      if (matchResoult == 1) {
        team.points = team.points;
      } else if (matchResoult == 2) {
        team.points = team.points + 3;
      } else if (matchResoult == 0) {
        team.points = team.points + 1;
      }
    });
  });
  const byPoints = tabela.slice(0);
  byPoints.sort(function (a, b) {
    return b.points - a.points;
  });
  let rounds = [];
  const roundCounter = match.forEach((match) => {
    if (!rounds.includes(match.round)) {
      rounds.push(match.round);
    }
  });

  res.render("admin_views/match", { match, teams, byPoints, events, rounds });
});

router.get("/addMatch", async (req, res) => {
  const teams = await Team.find({});

  res.render("admin_views/addMatch", { teams });
});

router.post("/addMatch", async (req, res) => {
  const teams = await Team.find({});

  const match = new Match({
    homeTeam: req.body.homeTeam,
    awayTeam: req.body.awayTeam,
    homeGoals: req.body.homeGoals,
    awayGoals: req.body.awayGoals,
    round: req.body.round,
    date: req.body.date,
  });

  try {
    if (req.body.homeTeam == req.body.awayTeam) throw Error("blad");
    await match.save();
    res.redirect("/matchs");
  } catch (e) {
    if (e.message == "blad") {
    }
    // console.log(e.errors.date.message);
    res.render("admin_views/addMatch", { teams, errors: e });
  }
});

router.get("/matchs/:id/edytuj", async (req, res) => {
  const id = req.params.id;
  const match = await Match.findOne({ _id: id });

  const teams = await Team.find();

  res.render("admin_views/editMatch", { match, teams, form: req.body });
});

router.post("/matchs/:id/edytuj", async (req, res) => {
  const id = req.params.id;
  const match = await Match.findOne({ _id: id });
  const teams = await Team.find();
  (match.homeGoals = req.body.homeGoals),
    (match.awayGoals = req.body.awayGoals),
    (match.date = req.body.date);
  match.round = req.body.round;
  try {
    await match.save();
    res.redirect("/matchs");
  } catch (e) {
    res.render("admin_views/editMatch", { match, teams, errors: e });
  }
});

router.get("/matchs/:id/usun", async (req, res) => {
  try {
    await Match.deleteOne({ _id: req.params.id });
  } catch (e) {
    console.log(e);
  }
  res.redirect("/matchs");
});

router.get("/matchs/:id/zdarzenie", async (req, res) => {
  const events = await EventMatch.find({ matchId: req.params.id });
  const teams = await Team.find({});
  const player = await Player.find({});
  const match = await Match.findById({ _id: req.params.id });
  const matchId = req.params.id;
  const homeTeam = await Team.findById({ _id: match.homeTeam });
  const awayTeam = await Team.findById({ _id: match.awayTeam });
  const home = homeTeam._id.valueOf();
  const away = awayTeam._id.valueOf();

  for (i = 0; i < events.length; i++) {
    const playerName = player.find(
      (e) => e._id.valueOf() == events[i].playerId
    );

    events[i].playerName = playerName.fname;
  }

  const listPlayers = await Player.find({ teamId: { $in: [home, away] } });
  const awayEvents = [];
  const homeEvents = [];

  for (i = 0; i < events.length; i++) {
    let pl = player.find((x) => x._id.valueOf() == events[i].playerId);

    if (pl.teamId == home) {
      homeEvents.push(events[i]);
    } else {
      awayEvents.push(events[i]);
    }
  }

  res.render("admin_views/event", {
    awayEvents,
    homeEvents,
    listPlayers,
    matchId,
    events,
    match,
    homeTeam,
    awayTeam,
    teams,
  });
});
router.post("/addEvent/:id", async (req, res) => {
  const event = new EventMatch({
    matchId: req.body.match,
    playerId: req.body.player,
    event: req.body.event,
  });
  try {
    await event.save();
    res.redirect("/matchs/" + req.params.id + "/zdarzenie");
  } catch (e) {
    res.redirect("/matchs/" + req.params.id + "/zdarzenie");
  }
});
router.get("/deleteEvent/:id", async (req, res) => {
  const event = await EventMatch.findById({ _id: req.params.id });

  await EventMatch.deleteOne({ _id: req.params.id });
  res.redirect("/matchs/" + event.matchId + "/zdarzenie");
});

module.exports = router;
