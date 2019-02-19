const mongoose = require('mongoose');

const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DB = process.env.MONGO_DB;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;

let connection;

const connect = async () => {
    connection = await mongoose.connect('mongodb://' + MONGO_USER + ':' + MONGO_PASS + '@' + MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DB, { useNewUrlParser: true });
    console.log("Connected to DB " + MONGO_HOST + ":" + MONGO_PORT + "/" + MONGO_DB);
};

const close = async () => {
    await connection.disconnect();
    console.log("Connection to DB is closed");
};

module.exports = { connect, close };





