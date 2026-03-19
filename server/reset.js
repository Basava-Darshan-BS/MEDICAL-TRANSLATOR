const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.collection('documents').updateMany(
    {},
    { $set: { status: 'uploaded' } }
  );
  await mongoose.connection.collection('analyses').deleteMany({});
  console.log('Reset done!');
  process.exit();
});