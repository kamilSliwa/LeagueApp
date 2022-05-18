const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const Match = require("../models/match");
const Team = require("../models/team");
const User = require("../models/user");
const EventMatch = require("../models/eventMatch");
const Player = require("../models/player");
const { addListener } = require("../models/eventMatch");

/* router.get("/", async (req, res) => {
  const teams = await Team.find({});
  res.render("home", { teams });
});
 */
router.get("/", async (req, res) => {
  const match = await Match.find({});
  const teams = await Team.find({});
  const events = await EventMatch.find({});
  const player = await Player.find({});
  //Goals lead
  const topTable = [];

  const top10 = [];
  events.forEach((element) => {
    if (element.event == "goal") {
      top10.push(element.playerId);
    }
  });

  console.log(top10);

  for (let j = 0; j < player.length; j++) {
    let counter = 0;
    for (let i = 0; i < top10.length; i++) {
      if (player[j]._id == top10[i]) {
        counter = counter + 1;
      }
      player[j].goals = counter;
    }
  }
  const sortByGoals = player.slice(0);
  sortByGoals.sort(function (a, b) {
    return b.goals - a.goals;
  });
  console.log(sortByGoals);
  for (let j = 0; j < sortByGoals.length; j++) {
    console.log(sortByGoals[j].fname, sortByGoals[j].goals);
  }

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
      if (s.homeGoals != null) {
        return s.homeTeam == team.name;
      }
    });
    team.playedHome = homePlayed.length;

    const awayPlayed = match.filter((s) => {
      if (s.awayGoals != null) {
        return s.awayTeam == team.name;
      }
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

  res.render("home", { match, teams, byPoints, events, rounds, sortByGoals });
});

//najlepszi strzelcy
//tabela
module.exports = router;
