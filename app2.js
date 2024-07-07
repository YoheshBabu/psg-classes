const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost/booking_app', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// MongoDB User Schema and Model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Passport Configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user || user.password !== password) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Room Schema and Model
const roomSchema = new mongoose.Schema({
  className: String,
});

const Room = mongoose.model('Room', roomSchema);

// MongoDB Booking Schema and Model
const bookingSchema = new mongoose.Schema({
  name: String,
  date: Date,
  period: Number,
  classroom: String,
});

const Booking = mongoose.model('Booking', bookingSchema);

// Routes
app.get('/index', isAuthenticated, async (req, res) => {
  try {
    const classrooms = await Room.find({}, 'className');
    res.render('index', { classrooms, showDropdown: false, isAuthenticated: req.isAuthenticated(), username: req.user.username });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/checkAvailability', isAuthenticated, async (req, res) => {
  const { date, period } = req.body;

  try {
    const bookedClassrooms = await Booking.find({ date, period }, 'classroom');
    const bookedClassroomNames = bookedClassrooms.map(booking => booking.classroom);

    const classrooms = await Room.find({ className: { $nin: bookedClassroomNames } }, 'className');

    res.render('index', { classrooms, showDropdown: true, date, period, isAuthenticated: req.isAuthenticated(), username: req.user.username });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/book', isAuthenticated, async (req, res) => {
  const { name, date, period, classroom } = req.body;
  const newBooking = new Booking({ name, date, period, classroom });
  
  try {
    await newBooking.save();
    res.redirect('/index');
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/',
    failureFlash: true,
  })
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
