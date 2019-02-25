const axios = require('axios');
const Destination = require('./models/Destination');
const Travel = require('./models/Travel');
const mongo = require('./server/mongo');

const updateWeather = async function () {

    try {
        // Connect to mongo DB
        await mongo.connect();

        // Find max destination ID
        const destID = await Travel.findMaxDestination();

        for (let destIndex = 1; destIndex <= destID.destination; destIndex++) {
            const destination = await Destination.findById(destIndex).select({ _id: 1, nameEn: 1, weatherSparkId: 1, weatherSparkName: 1, countryEn: 1 });

            // If destination with such ID exists
            if (destination) {

                await updateWeatherByDestinationId(destination);
            }
        }
                        // const destinationArr = await Destination.find().select({ nameEn: 1, countryEn: 1, weatherSparkId: 1, weatherSparkName: 1 });
                        // const originArr = await Origin.find().select({ _id: 1 });

                        // for (let dest of destinationArr) {

                        //     let emptyOrig = [];
                        //     let filledOrig = [];
                        //     for (let orig of originArr) {
                        //         const randomTravel = await Travel.findOne({ destination: dest._id, origin: orig._id }).select({ weatherTempStatMin: 1 });
                        //         if (randomTravel) {
                        //             if (!randomTravel.weatherTempStatMin) {
                        //                 // MISSING weatherTempStat data in DB
                        //                 emptyOrig.push(orig._id);
                        //             } else {
                        //                 // PRESENT weatherTempStat data in DB
                        //                 filledOrig.push(orig._id);
                        //             }
                        //         }
                        //     }

                        //     if (emptyOrig.length > 0) {
                        //         if (filledOrig.length > 0) {

                        //             // get data from DB
                        //             const travelArr = await Travel.find({ destination: dest._id, origin: filledOrig[0] }).select({ destination: 1, date: 1, weatherTempStatMin: 1, weatherTempStatMax: 1 });
                        //             for (let orig of emptyOrig) {
                        //                 for (let travel of travelArr) {
                        //                     await Travel.updateOne({ destination: dest._id, origin: orig, date: travel.date }, { weatherTempStatMin: travel.weatherTempStatMin, weatherTempStatMax: travel.weatherTempStatMax });
                        //                 }
                        //                 console.log('Updated data for destination: ' + dest._id + ', origin: ' + orig);
                        //             }

                        //         } else {

                        //             //get data from site
                        //             const start = new Date(2019, 0, 1);
                        //             const end = new Date(2019, 11, 31);
                        //             for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {

                        //                 const response = await axios.get(generaterUrl(dest.weatherSparkId, day.getMonth() + 1, day.getDate(), dest.weatherSparkName || dest.nameEn, dest.countryEn));
                        //                 const found = response.data.match(/typically ranges from (-*\d+)°F to (-*\d+)°F/);

                        //                 const weatherTempStatMin = fToC(found[1]);
                        //                 const weatherTempStatMax = fToC(found[2]);

                        //                 const dayWithZero = '0'.concat(day.getDate()).slice(-2);
                        //                 const monthWithZero = '0'.concat(day.getMonth() + 1).slice(-2);
                        //                 const dateReg = new RegExp('.*-' + monthWithZero + '-' + dayWithZero + '$');


                        //                 for (let orig of emptyOrig) {
                        //                     await Travel.updateOne({ destination: dest._id, origin: orig, date: dateReg }, { weatherTempStatMin, weatherTempStatMax });
                        //                 }
                        //             }

                        //             console.log('Updated data from site for destination id: ' + dest._id);
                        //         }
                        //     }

                        // }

                        await mongo.close();

                    } catch (e) {
                        console.log(e);
                        await mongo.close();
                    }
                }

                async function updateWeatherByDestinationId(destination) {

                    // Find statistics in DB: how many Travel documents with weather info grouped by origin
                    // Returns array of objects: { _id: Origin id, count: number of documents}
                    const weatherCount = await Travel.getWeatherCountByOrigin(destination._id);

                    const fullWeatherInfo = weatherCount.filter(item => item.count >= 365);
                    const missingWeatherInfo = weatherCount.filter(item => item.count < 365);

                    // If there is no Travels to this destination OR travels with missing info is absent
                    if ((weatherCount.length === 0) || (missingWeatherInfo.length === 0)) {

                        // This is the 'base case', just return 
                        return;
                    } else {

                        // Info in DB is missing
                        
                        if (fullWeatherInfo.length > 0) {

                            // There is at least one origin with full weather info and we don't need to call API
                            // Update information for all origins from missingWeatherInfo with information from fullWeatherInfo

                            const travels = await Travel.findTravels(fullWeatherInfo[0]._id, destination._id);
                            
                            for ({date, weatherTempStatMin, weatherTempStatMax} of travels) {
                                await Travel.updateMany({ origin: {$in: missingWeatherInfo.map(item => item._id)}, destination: destination._id, date}, 
                                                        { $set: { weatherTempStatMin, weatherTempStatMax }});
                            }

                            // All travels updated, return from function
                            return;

                        } else {

                            // This is recursive case.
                            // In this case there is no origin with full info.
                            // 1. Find origin with most count
                            // 2. Find dates from db with missing info
                            // 3. Request api and fulfill the missing info for that origin
                            // 4. Now we have one origin with full info, call updateWeatherByDestinationId to update all other travels

                            const updateOrigin = missingWeatherInfo.reduce((acc, next) => next.count > acc.count ? next : acc);
                            const travels = await Travel.findMissingDates(updateOrigin._id, destination._id);
                            for ({ date } of travels) {
                                const day = new Date(date);

                                const response = await axios.get(generaterUrl(destination.weatherSparkId, day.getMonth() + 1, day.getDate(), destination.weatherSparkName || destination.nameEn, destination.countryEn));
                                const found = response.data.match(/typically ranges from (-*\d+)°F to (-*\d+)°F/);

                                const weatherTempStatMin = fToC(found[1]);
                                const weatherTempStatMax = fToC(found[2]);

                                await Travel.updateOne({ destination: destination._id, origin: updateOrigin._id, date }, { weatherTempStatMin, weatherTempStatMax });
                            }
                            await updateWeatherByDestinationId(destination);
                        }
                    }
                }

                function generaterUrl(id, month, day, city, country) {
                    const months = {
                        1: 'January',
                        2: 'February',
                        3: 'March',
                        4: 'April',
                        5: 'May',
                        6: 'June',
                        7: 'July',
                        8: 'August',
                        9: 'September',
                        10: 'October',
                        11: 'November',
                        12: 'December'
                    };

                    return 'https://weatherspark.com/d/' +
                        id + '/' + month + '/' + day +
                        '/Average-Weather-on-' + months[month] +
                        '-' + day + '-in-' + city + '-' + country;
                }

                function fToC(far) {
                    return Math.ceil(((+far - 32) * 5) / 9).toString();
                }

            

                module.exports = updateWeather;