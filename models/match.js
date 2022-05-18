const mongoose = require("mongoose");

const MatchShema = new mongoose.Schema({
  round: {
    type: String,
    required: true,
  },
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  homeGoals: {
    type: Number,
  },
  awayGoals: {
    type: Number,
  },
  date: {
    type: Date,
    required: [true, "Podaj date"],
  },
});
MatchShema.methods.getResoult = function () {
  if (this.homeGoals > this.awayGoals) {
    return 1;
  } else if (this.homeGoals < this.awayGoals) {
    return 2;
  } else if (this.homeGoals == null || this.awayGoals == null) return null;
  else return 0;
};
MatchShema.methods.getScore = function () {
  return this.homeGoals + ":" + this.awayGoals;
};
const Match = mongoose.model("Match", MatchShema);
module.exports = Match;
