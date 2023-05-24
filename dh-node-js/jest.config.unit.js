const commonConfig = require('./jest.config');

module.exports = {
    ...commonConfig,
    testMatch: [
        '**/*.unit.test.{js,ts}'
    ],
    collectCoverageFrom: [
        '**/modules/**/*.js',
        '**/app/controllers/*.js',
        '**/app/services/*.js',
    ],
    coverageDirectory: 'coverage/unit'
};