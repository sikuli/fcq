var mongodb = require('mongodb');
var mongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var debug = require('debug');

var outf = "test.json"

//connect to the database
mongoClient.connect("mongodb://localhost:27017/sikuli", function (err, db) {
    if(err){
        debug(err)
        db.close();
    }
    debug("Connected to sikuli  database")
    query(db);
});

function query(db) {
    //collection name
    var collection = db.collection('fcq');
    //actual query
    collection.aggregate(
    [
        { $project: {insname1 : 1, N_ENROLL: 1, YearTerm: 1}},
        { $sort: {insname1: 1, YearTerm: -1}},
        { $group: {_id: {insname1: "$insname1", YearTerm:"$YearTerm"},
        N_TAUGHT: { $sum: "$N_ENROLL"}}}
    ],
    //write to file
    function(err, results) {
        console.log(results);
        if (err) debug(err);
        else{
            fs.writeFile(outf, JSON.stringify(results, null, 2), function(err) {
                if (err) debug(err);
                else debug("File saved.");
                db.close(); 
            });
        }
    });
}
