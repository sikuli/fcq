var debug = require('debug')('diff.questions.ianks')

var plugin = function(diff) {

    diff.question('how many rows?', ['$mongodb'], function($mongodb, callback) {
        var answer = 'implement me'        
        callback(null, answer)
        $mongodb.close();
    })
}
module.exports = plugin
