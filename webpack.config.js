var path = require('path');

module.exports = {
    entry: "static/js/app.js",
    output: {
        path: 'static/js',
        filename: 'main-bundled.js'
    },
    module: {
        loaders: [
            { test: /\.hbs$/, loader: 'hanldebars-loader' }
        ]
    }
};