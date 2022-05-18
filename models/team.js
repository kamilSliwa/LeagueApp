const mongoose = require("mongoose");

const TeamShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  since: {
    type: Number,
    required: true,
  },
  logo: {
    type: String,
    default: "defaultLogo",
  },
});
const Team = mongoose.model("Team", TeamShema);
module.exports = Team;
