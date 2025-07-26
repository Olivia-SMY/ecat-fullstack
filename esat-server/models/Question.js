const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  index: Number,
  question: String,
  options: [String],
  answerIndex: Number,
  explanation: String,
  images: [String],
  tags: [String],
  difficulty: String,
  difficultyScore: Number,
  isMock: { type: Boolean, default: false },
  source: String
});

module.exports = mongoose.model("Question", questionSchema);

