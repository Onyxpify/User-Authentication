if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt'); //importing bcrypt to hash the passwords

const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require("express-session");
const passport = require('passport');

initializePassport(
    passport, 
    email => users.find(user => user.email === email), //checking the email entered and comparing it to what we have in database if they are thesame equal
    id  => users.find(user => user.id === id)
)

const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }));

app.use(passport.initialize())
app.use(passport.session())
// configuring the register post functionality
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true  //this is sayingig we want to display the failure message
}))
// configure the register post functionality
app.post('/register', async(req, res) => {
    try {
        const hashPasswords = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashPasswords,
        })
        console.log(users) //displays the newly registered users on console/terminal
        res.redirect('/login') //redirect to login page after registration
    } catch  (e) {
        console.log(e);
        res.redirect('/register')
    }
})

// routes
app.get('/home-page', (req, res) => {
    res.render('index.ejs')
})
app.get('/login', (req, res) => {
    res.render('login.ejs')
})
app.get('/register', (req, res) => {
    res.render('register.ejs')
})

const PORT =process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})