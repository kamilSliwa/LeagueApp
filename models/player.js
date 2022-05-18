const mongoose = require("mongoose");

const PlayerShema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  teamId: {
    type: String,
    required: true,
  },
});
const Player = mongoose.model("Player", PlayerShema);
module.exports = Player;
