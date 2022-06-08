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

// app.get('/articles', (req, res) => {
//     res.render('articles');
// })

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

// Articles route
app.route('/articles')
    .get((req, res) => {
        res.render('articles');
    })
    .post((req, res) => {
        Article.create({
            title: req.body.title,
            article: req.body.article
        })
            .then(user => {
                req.session.user = user.dataValues;
                res.redirect('/articles');
                // })
                // .catch(error => {
                //     res.redirect('/signup');
                // });
            })
    });

// Not Found Route
app.use(function (req, res, next) {
    res.status(404).send("Sorry, we can't find that page! Please check the URL and try again.")
});

app.listen(app.get('port'), () => console.log(`Blog app started on port ${app.get('port')}`));









// const mysql = require('mysql');
// const db = require("./models");
// const PORT = process.env.PORT || 3000;

// app.use(express.urlencoded({ extended: true }))
// app.use(express.json());

// const apiRoutes = require('./routes/apiRoutes');
// app.use('/api', apiRoutes);

// db.sequelize.sync().then(() => {
//     app.listen(PORT, () => {
//         console.log(`listening on: http://localhost:${PORT}`);
//     })
// })

// const databaseConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Brooklyn15!',
//     database: 'blog'
// });

// databaseConnection.connect(error => {
//     if (error) throw error;
//     console.log("MySQL Database Connected!")
// });

// databaseConnection.query('SELECT * FROM USERS', (error, rows) => {
//     if (error) throw error;

//     console.log('Data received from blog database:');
//     console.log(rows);
// })

// import { User } from "./models/User";

// console.log(User.User);
// // Initialize app
// const app = express();

// // Load View Engine
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// // Home Route
// app.get('/', (req, res) => {
//     let articles = [
//         {
//             id: 1,
//             title: 'First Article',
//             author: 'Malik Felix',
//             body: 'This is the first article.'
//         },
//         {
//             id: 2,
//             title: 'Second Article',
//             author: 'Chris Hazen',
//             body: 'This is the second article.'
//         },
//         {
//             id: 3,
//             title: 'Third Article',
//             author: 'Devon Hartsfield',
//             body: 'This is the third article.'
//         }
//     ];
//     res.render('index', {
//         title: 'Articles',
//         articles: articles
//     });
// });

// // Add Route
// app.get('/articles/add', (req, res) => {
//     res.render('add_article', {
//         title: 'Add Article'
//     })
// })

// // Start Express Server
// app.listen(3000, () => {
//     console.log('Express server running on port 3000...');
// });