var debug = require('debug')('diff.questions.develra')

var plugin = function(diff) {

    diff.question('how many rows?', ['$mongodb'], function($mongodb, callback) {
         var fcq = $mongodb.collection('fcq');
         fcq.count(function(err, count){
            if(err) throw err;
            callback(null, count)
            $mongodb.close();
         })
    })
}
//I have no idea where to close the database. I'm gonna try it here
module.exports = plugin
