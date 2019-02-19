const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OriginSchema = new Schema({
    _id: Number
});

module.exports = mongoose.model('Origin', OriginSchema, 'origins');