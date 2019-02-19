const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TravelSchema = new Schema({
    origin: Number,
    destination: Number,
    date: String,
    weatherTempStatMin: String,
    weatherTempStatMax: String
});

module.exports = mongoose.model('Travel', TravelSchema, 'travels');