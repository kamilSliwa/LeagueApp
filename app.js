const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const { ensureAuthenticated } = require("./config/auth");

//passport config
require("./config/passport")(passport);
//PORT COnfig
const PORT = process.env.PORT || 3001;
//DB CONFIG
const db = require("./config/key").MongoURI;
//Connect to DATE BASE
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Datebase connected"))
  .catch((err) => console.log(err));

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout logged", false);
//Body parser
app.use(express.urlencoded({ extended: false }));

//SESSION
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
//CONNECT FLASH
app.use(flash());
//PUBLIC FILES
app.use("/static", express.static("public"));

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//GLOBALS VARS
app.use((req, res, next) => {
  res.locals.form = {};
  res.locals.errors = null;
  res.locals.logged = req.isAuthenticated();
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/user"));
app.use("/", require("./routes/team"));
app.use("/", require("./routes/match"));
app.use("/", require("./routes/player"));

app.listen(PORT, console.log("Server started on port", PORT));
