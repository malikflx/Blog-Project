const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const User = require('./models/user');
const Article = require('./models/articles')
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.set('port', 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    key: 'user_sid', // user session ID
    secret: 'somesecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1000000
    }
}));

app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) { // If server restarts and session information is missing, clear browser cookies
        res.clearCookie('user_sid')
    }
    next();
});

let hbsContent = { emailAddress: '', loggedin: false, title: "You are not currently logged in", body: "Are you logged into blog?" }

// middleware function to check for logged-in users
let sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard')
    } else {
        next();
    }
};

// Homepage Route
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
})

// Sign Up page Route
app.route('/signup')
    .get((req, res) => {
        res.render('signup', hbsContent);
    })
    .post((req, res) => {
        User.create({
            email: req.body.email,
            password: req.body.password
        })
            .then(user => {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            })
            .catch(error => {
                res.redirect('/signup');
            });
    })

// Login page Route
app.route('/login')
    .get((req, res) => {
        res.render('login', hbsContent)
    })
    .post((req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        User.findOne({ where: { email: email } }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });

// Dashboard Route
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        hbsContent.loggedin = true;
        hbsContent.emailAddress = req.session.user.email;
        hbsContent.title = "You're logged in";
        res.render('index', hbsContent);
    } else {
        res.redirect('/login');
    }
})

// Logout Route
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        hbsContent.loggedin = false;
        hbsContent.title = "You're logged out";
        res.clearCookie('user_sid');
        res.redirect("/");
    } else {
        res.redirect('/login');
    }
});

// Create Articles route
app.route('/createArticles')
    .get((req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            console.log(req.session.user)
            console.log(req.cookies.user_sid)
            res.render('createArticles');
        } else {
            res.redirect('/login');
        }
    })
    .post((req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            Article.create({
                title: req.body.title,
                authorId: req.session.user.id,
                article: req.body.article
            })
                .then(_article => {
                    res.redirect('/createArticles');
                })
        } else {
            res.redirect('/login');
        }

    });

// Not Found Route
app.use(function (req, res, next) {
    res.status(404).send("Sorry, we can't find that page! Please check the URL and try again.")
});

app.listen(app.get('port'), () => console.log(`Blog app started on port ${app.get('port')}`));