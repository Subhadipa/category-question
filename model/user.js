const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    mobile: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    profileImage: {
      type: String,
    },
    token: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
