const Travel = {
    findMaxDestination: () => Promise.resolve({ destination: 3 }),
    getWeatherCountByOrigin: jest.fn((dest) => {
        switch (dest) {
            case 1: return [{ _id: 1, count: 365 }, { _id: 2, count: 362 }];
            case 2: return [];
            case 3: return [{ _id: 1, count: 365 }, { _id: 2, count: 365 }];
        }
    }).mockImplementationOnce((dest) => {
        switch(dest) {
            case 1: return [{ _id: 1, count: 363}, { _id: 2, count: 362}];
            case 2: return [];
            case 3: return [{ _id: 1, count: 365}, { _id: 2, count: 365}];
        }
    }),
    findTravels: jest.fn((orig, dest) => [{ date: '2019-01-01', weatherTempStatMin: 100, weatherTempStatMax: 1000 },
    { date: '2019-01-02', weatherTempStatMin: -5, weatherTempStatMax: 0 }]),
    updateMany: jest.fn(() => Promise.resolve({})),
    findMissingDates: jest.fn(() => Promise.resolve([{ date: '2019-09-09' }])),
    updateOne: jest.fn(() => Promise.resolve({}))
}

module.exports = Travel;