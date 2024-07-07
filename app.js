const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/booking_app', { useNewUrlParser: true, useUnifiedTopology: true });

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Define the MongoDB Schema and Model for Rooms
const roomSchema = new mongoose.Schema({
  className: String,
});

const Room = mongoose.model('Room', roomSchema);
const newRoom = new Room({ className: 'A103' });
newRoom.save()
  .then(() => {
    console.log('Room inserted successfully');
  })
  .catch((error) => {
    console.error('Error inserting room:', error);
  });
// Define the MongoDB Schema and Model for Bookings
const bookingSchema = new mongoose.Schema({
  name: String,
  date: Date,
  period: Number,
  classroom: String,
});

const Booking = mongoose.model('Booking', bookingSchema);

// Define routes
app.get('/', async (req, res) => {
  try {
    // Fetch classrooms from the "rooms" collection
    const classrooms = await Room.find({}, 'className');
    console.log('Classrooms:', classrooms); // Log the fetched classrooms
    res.render('index', { classrooms });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/book', async (req, res) => {
  // Extract data from the form
  const { name, date, period, classroom } = req.body;

  // Create a new booking in the database
  const newBooking = new Booking({ name, date, period, classroom });
  await newBooking.save();

  res.redirect('/');
});




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
