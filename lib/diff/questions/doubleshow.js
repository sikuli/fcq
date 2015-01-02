var debug = require('debug')('diff.questions.doubleshow')
var _ = require('lodash');

var plugin = function(diff) {

    diff.question('how many rows?', ['$json'], function($json, callback) {
        var answer = $json.length - 1

        callback(null, answer)
    })

    diff.question('how many different instructors?', ['$json'], function($json, callback) {

        var data = $json

        var names = _.pluck(data, 'insname1')
            .concat(_.pluck(data, 'insname2'))

        debug('%d names found', names.length)

        var unique_names = _.unique(names)
        debug('%d are unique', unique_names.length)

        callback(null, unique_names.length)
    })

    diff.question('which 10 instructor taught the most courses?', ['$json'], function($json, callback) {

        var data = $json
        var n = 10

        var counts = {}
        data.forEach(function(record) {

            var insnames = _(record).pick(['insname1', 'insname2']).values().compact().value()

            insnames.forEach(function(name) {
                counts[name] = (counts[name] || 0) + 1
            })

        })

        var firstN = _(counts).pairs().sortBy(1).reverse().first(n).value()
        debug(firstN)
        callback(null, firstN)
    })

}
module.exports = plugin