const dotenv = require('dotenv');
dotenv.config();

const dUser = process.env.DATABASE_USER;
const dPassword = process.env.DATABASE_PASSWORD;

const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

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

// Configure User table
const User = sequelize.define('Users', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Hash (salt) password
User.beforeCreate((user, options) => {
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);
});

// Validate Password
User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// Create table
sequelize.sync()
    .then(() => console.log('User table created if one did not exist'))
    .catch(error => console.log('An error has occured', error))

// module.exports = (sequelize, DataTypes) => {
//     const Users = sequelize.define(`Users`, {
//         username: {
//             type: DataTypes.STRING,
//             allowNull: false
//         },
//         email: {
//             type: DataTypes.STRING,
//             allowNull: false
//         }
//     })
//     return Users;
// }

module.exports = User;