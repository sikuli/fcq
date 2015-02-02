var mongodb = require('mongodb');
var mongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var debug = require('debug');

var outf = "sunburst.json"

//connect to the database
mongoClient.connect("mongodb://localhost:27017/sikuli", function (err, db) {
    if(err){
        debug(err)
        db.close();
    }
    debug("Connected to sikuli  database")
    writeQuery(db);
});

function writeQuery(db, query) {
    //collection name
    var collection = db.collection('fcq');
    //actual query
    collection.aggregate(
    [
        { $project: {YearTerm: 1, N_ENROLL: 1, Subject: 1, Course:1}},
        //level 1
        { $group : {_id: {Year: "$YearTerm", Department: "$Subject", Class: "$Course"},
        ClassTotal: {$sum: "$N_ENROLL"}}},
        // level 2
        { $group: {_id: {Year:"$_id.Year", Department: "$_id.Department"},
        DepartmentTotal: { $sum: "$ClassTotal"},
        Classes: { $push:{
                        Class: "$_id.Class",
                        ClassTotal: "$ClassTotal"
        }}}},
        // level 3
        { $group :{_id: {Year: "$_id.Year"},
        YearTotal: { $sum: "$DepartmentTotal"},
        Departments: { $push:{
            Department: "$_id.Department",
            DepartmentTotal: "$DepartmentTotal",
            Classes: "$Classes"
        }}}}


    ],
    //write to file
    function(err, results) {
        debug(results);
        if (err) debug(err);
        //if you need additional javascript manipulation, put it here
        else{
            fs.writeFile(outf, JSON.stringify(results, null, 2), function(err) {
                if (err) debug(err);
                else debug("File saved.");
                db.close(); 
            });
        }
    });
}
