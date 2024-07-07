const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  className: String,
});

const Room = mongoose.model('Room', roomSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/book', { useNewUrlParser: true, useUnifiedTopology: true });

// Insert one document into the "rooms" collection
const newRoom = new Room({ className: 'A101' });

newRoom.save()
  .then(() => {
    console.log('Room inserted successfully');
  })
  .catch((error) => {
    console.error('Error inserting room:', error);
  });
