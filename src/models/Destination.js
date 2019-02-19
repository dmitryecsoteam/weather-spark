const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DestinationSchema = new Schema({
    _id: Number,
    nameEn: String,
    countryEn: String,
    weatherSparkId: String,
    weatherSparkName: String
});

module.exports = mongoose.model('Destination', DestinationSchema, 'destinations');