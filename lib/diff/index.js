// main module object to export
var diff = module.exports = {}

//
// Plugins
//

function plugin(func) {
    func(diff);
}

plugin(require('./main.js'))
plugin(require('./data.js'))
plugin(require('./questions/doubleshow.js'))
plugin(require('./questions/wannabeCitizen.js'))
plugin(require('./questions/ianks.js'))
plugin(require('./questions/develra.js'))