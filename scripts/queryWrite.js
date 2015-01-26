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
    collection.count

    //write to file 
    (function(err, results) {
        if (err) debug(err);
        else{
            fs.writeFile(outf, results, function(err) {
                if (err){ debug(err);}
                else {debug("File saved.");}
                db.close(); 
            });
        }
    });
}

