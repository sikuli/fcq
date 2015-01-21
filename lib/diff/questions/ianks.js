var debug = require('debug')('diff.questions.ianks');
var _ = require('lodash');

Array.prototype.findYear = function(year, collection) {
    return _.find(this, function(datum) {
        return datum.year == year;
    });
};

var plugin = function(diff) {
    diff.question('Which course(s) failed the most number of students?',
                  ['$mongodb'], function($mongodb, callback) {
        var fcq = $mongodb.collection('fcq');

        fcq.aggregateAsync([
            {
                $group : {
                    _id : {
                        subject: "$Subject",
                        course: "$Course",
                        courseTitle : "$CourseTitle"
                    },
                    failedPercentage : { $avg : "$PCT_C_MINUS_OR_BELOW" }
                }
            },
            {
                $sort : { failedPercentage : -1 }
            },
            {
                $limit : 10
            }
        ]).then(function(result){
            callback(null, result);

            // FIXME: This resource should be managed using disposer, but the
            // current implementation is hindering that.
            $mongodb.close();
        }).catch(function(err) {
            debug(err);
        });
    });

    diff.question('Which year saw the largest drop (from the previous year) ' +
                  'in total students taught among all the CS courses?',
                  ['$mongodb'], function($mongodb, callback) {
        var fcq = $mongodb.collection('fcq');

        fcq.aggregateAsync([
            {
                $match : { "Subject" : "CSCI" }
            },
            {
                $project : {
                    "YearTerm" : { $substr: [ "$YearTerm", 0, 4 ] },
                    "N_ENROLL" : "$N_ENROLL"
                }
            },
            {
                $group : {
                    _id : {
                        year : "$YearTerm",
                    },
                    totalEnrolled : { $sum : "$N_ENROLL" }
                }
            },
            {
                $sort : { _id : -1 }
            }
        ]).then(function(result){
            callback(null, result);
            $mongodb.close();
        }).catch(function(err) {
            debug(err);
        });
    });

    diff.question('Which department had the most significant improvement in ' +
                  'instructors?',
                  ['$mongodb'], function($mongodb, callback) {
        var fcq = $mongodb.collection('fcq');

        fcq.aggregateAsync([
            {
                $match : {
                    "YearTerm" : { $regex: new RegExp("(2012|2013)") }
                }
            },
            {
                $project : {
                    "AvgInstructor" : "$AvgInstructor",
                    "Subject" : "$Subject",
                    "YearTerm" : { $substr: [ "$YearTerm", 0, 4 ] }
                }
            },
            {
                $group : {
                    _id : {
                        year : "$YearTerm",
                        dept : "$Subject"
                    },
                    AvgInstructor : { $avg : "$AvgInstructor" }
                }
            },
            {
                $group : {
                    _id : "$_id.dept",
                    years : {
                        $push: {
                            year :"$_id.year",
                            avgInstructor : "$AvgInstructor"
                        }
                    }
                }
            }
        ]).then(function(result) {
            var cleaned = _.select(result, function(object){
                var realInstructorRating = _.every(object.years, function(n) {
                    return n.avgInstructor > 0;
                });

                var includesBothYears = object.years.length == 2;

                return realInstructorRating && includesBothYears;
            });

            var sorted = _.sortBy(cleaned, function(object){
                var twentyThirteen = object.years.findYear('2013');
                var twentyTwelve = object.years.findYear('2012');

                return -Math.abs(
                    twentyThirteen.avgInstructor - twentyTwelve.avgInstructor
                );
            });

            callback(null, sorted);
            $mongodb.close();
        }).catch(function(err) {
            debug(err);
        });
    });


    diff.question('Which majors are shrinking in size?',
                  ['$mongodb'], function($mongodb, callback) {
        var fcq = $mongodb.collection('fcq');

        fcq.aggregateAsync([
            {
                $project : {
                    "Subject" : "$Subject",
                    "YearTerm" : { $substr: [ "$YearTerm", 0, 4 ] },
                    "N_ENROLL" : "$N_ENROLL"
                }
            },
            {
                $match : { "YearTerm" : new RegExp("201.") }
            },
            {
                $group : {
                    _id : {
                        year : "$YearTerm",
                        dept : "$Subject"
                    },
                    totalEnrolled : { $sum : "$N_ENROLL" }
                }
            },
            {
                $group : {
                    _id : {
                        dept : "$_id.dept",
                    },
                    years : {
                        $push : {
                            year : "$_id.year",
                            totalEnrolled : "$totalEnrolled"
                        }
                    }
                }
            }
        ]).then(function(result){
            callback(null, result);
            $mongodb.close();
        }).catch(function(err) {
            debug(err);
        });
    });
}

module.exports = plugin
