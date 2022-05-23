const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const passport = require("passport");
//User model
const User = require("../models/user");
const Team = require("../models/team");
const { redirect } = require("express/lib/response");

//Login Page
router.get("/login", async (req, res) => {
  const teams = await Team.find({});
  const logged = req.isAuthenticated();
  res.render("login", { teams, logged });
});

//Login Handle
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
  })
);

router.get("/logout", (req, res) => {
  console.log("I am Logout");
  req.logout();
  req.user = null;
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

//Register Page
router.get("/register", async (req, res) => {
  const teams = await Team.find({});
  res.render("register", { teams });
});

//Register Handle
router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Plase fill all fields" });
  }
  if (password != password2) {
    errors.push({ msg: "Password do not match" });
  }

  if (password.length < 1) {
    errors.push({ msg: "short password" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    await User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        console.log(newUser);

        //Password hash
        bcrypt.genSalt(10, (e, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are not registred and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});
module.exports = router;
