const mongo = {
    connect: jest.fn(() => Promise.resolve({})),
    close: jest.fn(() => Promise.resolve({}))
}

module.exports = mongo;