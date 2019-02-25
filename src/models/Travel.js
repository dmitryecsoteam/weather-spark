const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TravelSchema = new Schema({
    origin: Number,
    destination: Number,
    date: String,
    weatherTempStatMin: String,
    weatherTempStatMax: String
});

TravelSchema.statics.findMaxOrigin = function findMaxOrigin() {
    return this.findOne().select({ origin: 1 }).sort({ origin: -1 });
}

TravelSchema.statics.findMaxDestination = function findMaxDestination() {
    return this.findOne().select({ destination: 1 }).sort({ destination: -1 });
}

TravelSchema.statics.getWeatherCountByOrigin = function getWeatherCountByOrigin(dest) {
    return this.aggregate([
        { $match: { destination: dest }},
        { $group: { _id: "$origin", 
            count: { 
                        $sum: {
                $cond: [ 
                    { $and: [ {$gt: ['$weatherTempStatMax', -1000]}, {$gt: ['$weatherTempStatMin', -1000]}] }, 1, 0
                ]
                        }
            }
        }
    }
    ]);
}

TravelSchema.statics.findTravels = function findTravels(origin, destination) {
    return this.find(origin, destination).select({ date: 1, weatherTempStatMax: 1, weatherTempStatMin: 1 })
}

TravelSchema.statics.findMissingDates = function findMissingDates(origin, destination) {
    return this.find({ origin, destination, $or: [{ weatherTempStatMax: null }, { weatherTempStatMin: null }] }).select({ date: 1 });
}

module.exports = mongoose.model('Travel', TravelSchema, 'travels');
