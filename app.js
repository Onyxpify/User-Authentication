if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// Importing Libraies that we installed using npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const connectDB = require('./db/connect')
const User = require("./models/users")



initializePassport(
    passport,
    async email => {
        try {
            const user = await User.findOne({email:email});
            return user
        } catch (e) {
          console.log(e)  
          return null
        }
    },
    async (id) => {
        try {
            const user = await User.findById(id)
            return user
        } catch (e) {
            console.log(e)
            return null
        }
    }
    )

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

// Configuring the register post functionality
app.post("/login", 
checkNotAuthenticated, 
passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", 
checkNotAuthenticated, 
async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        await user.save()
        console.log(user); // Display newly registered in the console
        res.redirect("/login")
        
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
//   })

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

const PORT =process.env.PORT || 8000

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
};
start()