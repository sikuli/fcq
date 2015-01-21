var debug = require('debug')('diff.questions.develra')
var _= require('lodash')

var plugin = function(diff) {

    diff.question('how many rows?', 
    ['$mongodb'], function($mongodb, callback) {
         $mongodb.collection('fcq').count(function(err, result){
            if(err) throw err;
            callback(null, result)
            $mongodb.close();
         })
    })

    //Which courses failed the most students?
    diff.question('Which courses failed the most students?',
    ['$mongodb'], function($mongodb, callback) {
         $mongodb.collection('fcq').aggregate(
                //Limit results to percent of  D or F > .50 for fast sorting (no disk)
            [   
                { $project: {PCT_DF : 1, CourseTitle: 1, N_GRADE: 1, PCT_DF: 1}}, 
                { $match: {PCT_DF : { $gt: .5}}},
                { $group: {_id: "$CourseTitle", Failed: { $avg: "$PCT_DF"}}},
                { $sort: {Failed: -1}},
                { $limit: 10}
            ],
         function(err, result){
            if(err) throw err;
            debug(result);
            callback(null, result);
            $mongodb.close();
         });
    });

    //Does the average teaching load (# of students taught) for a typical lecturer increas
    //or decrease over the years?
    diff.question('Does the average teaching load (# of students taught) for a typical lecturer increase or decrease over the years?',
    ['$mongodb'], function($mongodb, callback) {
         $mongodb.collection('fcq').aggregate(
            [   
                { $project: {insname1 : 1, N_ENROLL: 1, YearTerm: 1}}, 
                { $sort: {insname1: 1, YearTerm: -1}},
                { $group: {_id: {insname1: "$insname1", YearTerm:"$YearTerm"},
                  N_TAUGHT: { $sum: "$N_ENROLL"}}},
            ],
         function(err, result){
            function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
            if(err) throw err;
            var trendAccumulator = 0;
            for (var i = 0; i < result.length-1; i++){
                var taughtAccumulator = 0;
                if (result[i]._id.insname1 == result[i+1]._id.insname1)
                    taughtAccumulator += result[i+1].N_TAUGHT-result[i].N_TAUGHT
                //if accumulator ends up being positive, the number of students
                //tends to increase over time
                trendAccumulator += sign(taughtAccumulator)
            }
            if (trendAccumulator > 0)
                result = "Increase";
            else
                result = "Decrease";
            debug(trendAccumulator); 
            callback(null, result);
            $mongodb.close();
         });
    });

    //Which course saw the largest increase in workload in any given year??
    diff.question('Which course saw the largest increase in workload in any given year?',
    ['$mongodb'], function($mongodb, callback) {
         $mongodb.collection('fcq').aggregate(
            [   
                { $project: {CourseTitle: 1, YearTerm: 1, Workload_Raw: 1}},
                { $sort: {CourseTitle: 1, YearTerm: 1}},
                { $group: {_id: {CourseTitle: "$CourseTitle", YearTerm: "$YearTerm"},
                  workload: { $first: "$Workload_Raw"}}} 
            ],
         function(err, result){
            if(err) throw err;
            results = [[]]
            for (var i = 0; i < result.length-1; i++){
                if (result[i]._id.CourseTitle == result[i+1]._id.CourseTitle)
                    debug(i)
                    //slice+'7' will compare a shift from the first half to last half of
                    //the year, as the items are grouped it should be effective enough. 
                    if(result[i]._id.YearTerm.slice(0,4)+'7' == result[i+1]._id.YearTerm){
                    workloadDiff = Number(result[i+1].workload) - Number(result[i].workload);
                    results.push([+ workloadDiff.toFixed(2), result[i]._id.CourseTitle]);
                    }
            }
            results.sort()
            results.reverse()
            debug(results)
            callback(null, results);
            $mongodb.close();
         });
    });
    //What is the average change in instructor rating pre and post tenure (assistant profe
    //ssor → associate professor)?
    diff.question('What is the average change in instructor rating pre and post tenure (assistant professor → associate professor)?',
    ['$mongodb'], function($mongodb, callback) {
         $mongodb.collection('fcq').aggregate(
                //Limit results to percent of  D or F > .50 for fast sorting (no disk)
            [   
                { $project: {CourseTitle: 1, insttl1: 1, AvgInstructor: 1, insname1: 1}}, 
                { $match: { $or: [{insttl1: "ASST PROFESSOR"}, 
                  {insttl1: "ASSOCIATE PROFESSOR"}]}}, 
                { $group: {_id: "$insname1", PositionsHeld: { $push: "$insttl1"}, AvgInstructor: {$push: "$AvgInstructor"}}},
            ],
         function(err, result){
            if(err) throw err;
            var avgPre = 0;
            var avgPost = 0;
            var itrPre = 0;
            var itrPost = 0; 
            for (i = 0; i < result.length; i++){
                if ((_.uniq(result[i].PositionsHeld).length)==2)    
                    for (j = 0; j < result[i].PositionsHeld.length; j++){
                         if (result[i].PositionsHeld[j] == "ASST PROFESSOR"){
                            avgPre += Number(result[i].AvgInstructor[j]);
                            itrPre += 1;
                         }
                         else{
                            avgPost += Number(result[i].AvgInstructor[j]);
                            itrPost += 1;
                         }
                    }
                }
            diff = (avgPost/itrPost)-(avgPre/itrPre);
            debug(diff) 
            callback(null, diff.toFixed(4));
            $mongodb.close();
         });
    });
}
module.exports = plugin
