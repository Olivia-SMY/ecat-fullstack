require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await Question.deleteMany({
      $or: [
        { question: { $exists: false } },
        { question: "" }
      ]
    });
    console.log(`已删除 ${result.deletedCount} 条题干为空的题目`);
    process.exit();
  })
  .catch(err => {
    console.error('删除失败:', err);
    process.exit(1);
  });