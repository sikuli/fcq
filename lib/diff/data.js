var debug = require('debug')('diff.data')
var fs = require('fs')
var csv = require('csv');
var _ = require('lodash');
var mongodb = require('mongodb');
var Promise = require('bluebird');

var jsonPath = './data/fcq.json'
var csvPath = './data/fcq.csv'

Promise.promisifyAll(mongodb);
var MongoClient = mongodb.MongoClient;

var plugin = function(diff) {

    diff.dataProvider('$json', function(callback) {
        readJSON(jsonPath, callback)
    })

    diff.dataProvider('$csv', function(callback) {
        readCSV(csvPath, callback)
    })

    diff.dataProvider('$mongodb', function(callback) {
        MongoClient.connectAsync('mongodb://localhost:27017/sikuli')
            .then(function(db) {
                callback(null, db);
            })
            .catch(function(err) {
                debug(err);
            })
            .disposer(function(db) {
                db.close();
            });
    })
};

module.exports = plugin


//
// local helper functions
//

// Read data from a JSON file (async)
function readJSON(path, callback) {
    debug('readJSON')
    fs.readFile(path, 'utf8', function(error, data) {
        if (error)
            callback(Error)

        var json = []

        data.split('\n')
            .forEach(function(line) {
                try {
                    json.push(JSON.parse(line))
                } catch (err) {
                    // debug(err)
                }
            })

        debug('read %d records', json.length)
        callback(null, json)
    })
}

// Read data from a CSV file (async)
function readCSV(path, callback) {
    debug('readCSV called')
    fs.readFile(path, 'utf8', function(error, data) {
        csv.parse(data, function(err, csvdata) {
            if (error)
                throw error
            debug('readCSV done')
            callback(null, csvdata)
        })
    })
}
