const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Types.ObjectId,
    },
    question: {
      type: String,
      lowercase: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("question", questionSchema);
