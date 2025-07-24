// migrateTextToQuestion.js
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await Question.updateMany(
      { question: { $exists: false }, text: { $exists: true } },
      [{ $set: { question: "$text" } }]
    );
    console.log(`已将 ${result.modifiedCount} 条数据的 text 字段迁移到 question 字段`);
    process.exit();
  })
  .catch(err => {
    console.error('迁移失败:', err);
    process.exit(1);
  });