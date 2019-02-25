const updateWeather = require('../updateWeather');
const mockAxios = require('./__mocks__/axios');
const mongo = require('../server/mongo');
const mockTravel = require('../models/__mocks__/Travel');
const Travel = require('../models/Travel');

jest.mock('../server/mongo.js');
jest.mock('../models/Destination.js');
jest.mock('../models/Travel.js');

// mockTravel.getWeatherCountByOrigin.mockImplementationOnce((dest) => {
//     console.log(dest)
//     switch(dest) {
//         case 1: return [{ _id: 1, count: 363}, { _id: 2, count: 362}];
//         case 2: return [];
//         case 3: return [{ _id: 1, count: 365}, { _id: 2, count: 365}];
//     }
// });


test('should update weather info in DB', async () => {
    await updateWeather();

    // Open and close connection to DB
    expect(mongo.connect).toHaveBeenCalledTimes(1);
    expect(mongo.close).toHaveBeenCalledTimes(1);

    // getWeatherCountByOrigin should be called 4 times
    expect(Travel.getWeatherCountByOrigin).toHaveBeenCalledTimes(4);

    // API should be called one time with argument
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenLastCalledWith('https://weatherspark.com/d/11111/9/9/Average-Weather-on-September-9-in-Weather-First-Wonderland');

    // Travel.updateOne should be called one time
    expect(Travel.updateOne).toHaveBeenCalledTimes(1);
    expect(Travel.updateOne).toHaveBeenLastCalledWith({ destination: 1, origin: 1, date: '2019-09-09' }, { weatherTempStatMin: '15', weatherTempStatMax: '19' });

    // Travel.updateMany should be called two times
    expect(Travel.updateMany).toHaveBeenCalledTimes(2);
});