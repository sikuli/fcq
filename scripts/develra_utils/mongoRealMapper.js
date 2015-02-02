//dependencies
var mongodb = require('mongodb');
var mongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var debug = require('debug');
var _ = require('lodash');

//config
var db_name = "mongodb://localhost:27017/sikuli";
var db_collection = 'fcq';

//connect to the database
mongoClient.connect(db_name, function (err, db) {
    if(err){
        debug(err)
        db.close();
    }
    debug("Connected to the " +db_name +" database")
    mapToReal(db)
});


function mapToReal(db) {
var collection = db.collection(db_collection);

//for slightly better consistancy and figuring out where the hell to close
//mongodb
function start() {
    getKeys()
}
function getKeys() {
   collection.find({}).toArray(function (err, items) {
        if (err) console.log(err);
        else
            //this method assumes all objects have the same keys
            //for speed and consistent mapping
            keys = Object.keys(items[0]);
            _.map(keys, function (key) {getDistinctKeys(key)});
            
    });
}

function getDistinctKeys(key) {
    collection.distinct(key, function (err, dist_keys) {
        if (err) console.log(err);
        else
            _.map(dist_keys, function (dist_key) {mapAndUpdate(key, dist_key, _.indexOf(dist_keys,dist_key))});
            });
}

function mapAndUpdate(key, dist_key, index) { 
    var query = {};
    var newField = {};
    var field_R =  key + "_R"
    //object access for javascript
     query[key] = dist_key;
     newField[field_R] = index;
     //actual update
     collection.update(
        query, //query
        {$set: newField}, //new field to set
        {multi: true}, //options  - multi == all documents that match query
        function(err, result) {
            if (err) console.log(err);
            else console.log(query + " mapped to Real " + newField);
        }
     );
}
//main
start();
}
