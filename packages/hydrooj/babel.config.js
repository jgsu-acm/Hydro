module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    esmodules: false,
                },
            },
        ],
    ],
    plugins: ['@babel/transform-runtime'],
};
