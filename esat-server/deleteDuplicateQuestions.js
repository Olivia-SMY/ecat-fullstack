require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // 1. Find all duplicate questions
    const duplicates = await Question.aggregate([
      { $group: {
          _id: "$question",
          ids: { $push: "$_id" },
          count: { $sum: 1 }
      }},
      { $match: { count: { $gt: 1 }, _id: { $ne: "" } } }
    ]);

    let totalDeleted = 0;

    // 2. For each duplicate, delete all but the first
    for (const dup of duplicates) {
      // Keep the first, delete the rest
      const [keep, ...toDelete] = dup.ids;
      if (toDelete.length > 0) {
        const res = await Question.deleteMany({ _id: { $in: toDelete } });
        totalDeleted += res.deletedCount;
        console.log(`Deleted ${res.deletedCount} duplicates for question: "${dup._id}"`);
      }
    }

    console.log(`Total deleted: ${totalDeleted}`);
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });