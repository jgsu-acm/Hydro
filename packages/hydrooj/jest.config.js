const esModules = ['@hydro', 'p-'].join('|');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.ts$': 'ts-jest',
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
    globals: {
        __MONGO_DB_NAME_: 'DB',
        __MONGO_URI__: 'mongodb://127.0.0.1',
    },
};
