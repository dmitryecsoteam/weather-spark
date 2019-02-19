const axios = require('axios');
const Destination = require('./models/Destination');
const Travel = require('./models/Travel');
const Origin = require('./models/Origin');
const mongo = require('./server/mongo');

async function parseSite() {


    try {

        await mongo.connect();

        const destinationArr = await Destination.find().select({ nameEn: 1, countryEn: 1, weatherSparkId: 1, weatherSparkName: 1 });
        const originArr = await Origin.find().select({ _id: 1 });

        for (let dest of destinationArr) {

            let emptyOrig = [];
            let filledOrig = [];
            for (let orig of originArr) {
                const randomTravel = await Travel.findOne({ destination: dest._id, origin: orig._id }).select({ weatherTempStatMin: 1 });
                if (randomTravel) {
                    if (!randomTravel.weatherTempStatMin) {
                        // MISSING weatherTempStat data in DB
                        emptyOrig.push(orig._id);
                    } else {
                        // PRESENT weatherTempStat data in DB
                        filledOrig.push(orig._id);
                    }
                }
            }

            if (emptyOrig.length > 0) {
                if (filledOrig.length > 0) {
                    
                    // get data from DB
                    const travelArr = await Travel.find({ destination: dest._id, origin: filledOrig[0] }).select({ destination: 1, date: 1, weatherTempStatMin: 1 , weatherTempStatMax: 1});
                    for (let orig of emptyOrig) {
                        for (let travel of travelArr) {
                            await Travel.updateOne({ destination: dest._id, origin: orig, date: travel.date }, { weatherTempStatMin: travel.weatherTempStatMin, weatherTempStatMax: travel.weatherTempStatMax });
                        }
                        console.log('Updated data for destination: ' + dest._id + ', origin: ' + orig);
                    }
                    
                } else {
                    
                    //get data from site
                    const start = new Date(2019, 0, 1);
                    const end = new Date(2019, 11, 31);
                    for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
                        
                        const response = await axios.get(generaterUrl(dest.weatherSparkId, day.getMonth() + 1, day.getDate(), dest.weatherSparkName || dest.nameEn, dest.countryEn));
                        const found = response.data.match(/typically ranges from (-*\d+)°F to (-*\d+)°F/);

                        const weatherTempStatMin = fToC(found[1]);
                        const weatherTempStatMax = fToC(found[2]);

                        const dayWithZero = '0'.concat(day.getDate()).slice(-2);
                        const monthWithZero = '0'.concat(day.getMonth() + 1).slice(-2);
                        const dateReg = new RegExp('.*-' + monthWithZero + '-' + dayWithZero + '$');
                        

                        for (let orig of emptyOrig) {
                            await Travel.updateOne({ destination: dest._id, origin: orig, date: dateReg }, { weatherTempStatMin, weatherTempStatMax });
                        }
                    }

                    console.log('Updated data from site for destination id: ' + dest._id);
                }
            }

        }

        await mongo.close();

    } catch (e) {
        console.log(e);
        await mongo.close();
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

//console.log(generaterUrl(143438, 1, 21, 'Kyoto', 'Japan'));
parseSite();