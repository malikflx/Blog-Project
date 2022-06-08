// import { User } from "./user";
const User = require('./user')

const dotenv = require('dotenv');
dotenv.config();

const dUser = process.env.DATABASE_USER;
const dPassword = process.env.DATABASE_PASSWORD;
const Sequelize = require('sequelize');


const sequelize = new Sequelize('blog', dUser, dPassword, {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

// Configure Articles table
const Article = sequelize.define('Articles', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    article: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    }

    // authorId: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    // }
    // title: {

    // }
});

Article.belongsTo(User, { as: 'author' }); // author foreign key added to the Article table
// User.hasMany(Article); 
sequelize.sync()
    .then(() => console.log('Article table created if one did not exist'))
    .catch(error => console.log('An error has occured', error))

module.exports = Article;

