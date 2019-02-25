const axios = {
    get: jest.fn((url) => Promise.resolve({ data: 'On January 15, the temperature in Hong Kong typically ranges from 59°F to 65°F and is rarely below 51°F or above 73°F.'}))
};

module.exports = axios;