require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await Question.deleteMany({
      $or: [
        { tags: { $exists: false } },
        { tags: { $size: 0 } },
        { tags: null }
      ]
    });
    console.log(`已删除 ${result.deletedCount} 条没有 tag 的题目`);
    process.exit();
  })
  .catch(err => {
    console.error('删除失败:', err);
    process.exit(1);
  });