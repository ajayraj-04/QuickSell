// models/User.js - how a seller is saved in the database

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // same email cannot register twice
    phone: { type: String, required: true },
    password: { type: String, required: true },            // saved as a hash, not plain text
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
