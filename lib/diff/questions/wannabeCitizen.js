var debug = require('debug')('diff.questions.wannabeCitizen')

var plugin = function(diff) {

    diff.question('how many rows?', ['$mongodb'], function($mongodb, callback) {
        var answer = 'implement me'        
        callback(null, answer)
    })
}
module.exports = plugin