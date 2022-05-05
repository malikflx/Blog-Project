const express = require("express");
const router = express.Router();
const db = require("../models");

// get all users
router.get('/all', (req, res) => {
    db.Users.findAll().then(users => res.send(users));
});

// get single user by id
router.get('/find/:id', (req, res) => {
    db.Users.findAll({
        where: {
            id: req.params.id
        }
    }).then(user => res.send(user))
});

// post new user
router.post('/new', (req, res) => {
    db.Users.create({
        username: req.body.username,
        email: req.body.email
    }).then(submittedUser => res.send(submittedUser));
});


// delete user
router.delete('/delete/:id', (req, res) => {
    db.Users.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => res.send("deletion successful!"))
});

// edit user
router.put('/edit', (req, res) => {
    db.Users.update(
        {
            username: req.body.username,
            email: req.body.email

            // Re-authorize with password check
        },
        {
            where: { id: req.body.id }
        }
    ).then(() => res.send("update successsul!"))
})
module.exports = router;