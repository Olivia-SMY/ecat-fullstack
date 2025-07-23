const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await Question.deleteMany({
      index: { $gte: 8, $lte: 25 }
    });
    console.log(`✅ Deleted ${result.deletedCount} questions`);
    process.exit();
  })
  .catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });
