// routes/auth.js - register, login and logout

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// ---------- Register page ----------
router.get("/register", function (req, res) {
  res.render("register", { title: "Register" });
});

// ---------- Register form submitted ----------
router.post("/register", async function (req, res) {
  try {
    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const phone = req.body.phone.trim();
    const password = req.body.password;

    // Is this email already used?
    const oldUser = await User.findOne({ email: email });
    if (oldUser) {
      return res.render("register", { title: "Register", error: "This email is already registered" });
    }

    // Hash the password so the real password is never saved
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name: name, email: email, phone: phone, password: hashedPassword });

    req.session.message = "Registration successful. Please login.";
    res.redirect("/login");
  } catch (err) {
    res.render("register", { title: "Register", error: "Could not register. Try again." });
  }
});

// ---------- Login page ----------
router.get("/login", function (req, res) {
  res.render("login", { title: "Login" });
});

// ---------- Login form submitted ----------
router.post("/login", async function (req, res) {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.render("login", { title: "Login", error: "Email or password is wrong" });
    }

    // Compare typed password with the saved hash
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.render("login", { title: "Login", error: "Email or password is wrong" });
    }

    // Login success: remember the user in the session
    req.session.user = { id: user._id.toString(), name: user.name };
    req.session.message = "Welcome, " + user.name + "!";
    res.redirect("/my-products");
  } catch (err) {
    res.render("login", { title: "Login", error: "Could not login. Try again." });
  }
});

// ---------- Logout ----------
router.get("/logout", function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
