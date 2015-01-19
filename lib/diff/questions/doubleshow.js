var debug = require('debug')('diff.questions.doubleshow'),
    _ = require('lodash'),
    stat = require('numbers').statistic,
    sum = require('compute-sum')

var plugin = function(diff) {

    diff.question('how many rows?', ['$json'], function($json, callback) {
        var answer = $json.length - 1

        callback(null, answer)
    })

    diff.question('how many different instructors?', ['$json'], function($json, callback) {

        var data = $json

        var names = _.pluck(data, 'insname1')
            .concat(_.pluck(data, 'insname2'))

        debug('%d names found', names.length)

        var unique_names = _.unique(names)
        debug('%d are unique', unique_names.length)

        callback(null, unique_names.length)
    })

    diff.question('which 10 instructor taught the most courses?', ['$json'], function($json, callback) {

        var data = $json
        var n = 10

        var counts = {}
        data.forEach(function(record) {

            var insnames = _(record).pick(['insname1', 'insname2']).values().compact().value()

            insnames.forEach(function(name) {
                counts[name] = (counts[name] || 0) + 1
            })

        })

        var firstN = _(counts).pairs().sortBy(1).reverse().first(n).value()
        debug(firstN)
        callback(null, firstN)
    })

    diff.question('How does the university’s average GPA change over the years, rise, steady, or fall?', ['$json'], function($json, callback) {

        var data = $json

        // Group
        var terms = _(data)
            .groupBy('YearTerm').value()

        // Compute Average of AVG_GRD per group
        var rawArray = []
        _.forEach(terms, function(term, key) {

            var gpas = _(term).pluck('AVG_GRD').compact().map(function(x) {
                return Number(x)
            }).value()

            rawArray.push({
                yearTerm: key,
                averageGrade: stat.mean(gpas)
            })
        })

        // Compute diff over time
        var diffArray = []
        _.zip(_.rest(rawArray), _.initial(rawArray)).forEach(function(dd) {
            var a = dd[0]
            var b = dd[1]

            var diff = {
                yearTerm: a.yearTerm + '->' + b.yearTerm,
                averageGrade: b.averageGrade - a.averageGrade
            }

            diffArray.push(diff)
        })

        callback(null, {
            raw: rawArray,
            diff: diffArray
        })
    })

    diff.question('Which department is more aggressive in failing students?', ['$json'], function($json, callback) {

        var data = $json

        // Group by Department
        var depts = _(data)
            .groupBy('CrsPBADept').value()

        // Compute Average of AVG_GRD per group
        var rawArray = []
        _.forEach(depts, function(values, dept) {

            var numberOfStudentsWhoFailedOverCourses = _(values).map(function(x) {
                var percentageOfStudentsWhoFailed = Number(x['PCT_F'].replace('%', ''))
                var numbOfStudents = Number(x['N_ENROLL'])
                var numberOfStudentsWhoFailed = Math.round(percentageOfStudentsWhoFailed * numbOfStudents / 100)
                return numberOfStudentsWhoFailed
            }).value()

            var numberOfStudentsOverCourses = _(values).map(function(x) {
                return Number(x['N_ENROLL'])
            }).value()

            var totalNumberOfStudents = sum(numberOfStudentsOverCourses)
            var totalNumberOfFailingStduents = sum(numberOfStudentsWhoFailedOverCourses)

            // debug("%s %d / %d (%d%) failed",
            //     dept,
            //     totalNumberOfFailingStduents,
            //     totalNumberOfStudents,
            //     totalNumberOfFailingStduents * 100 / totalNumberOfStudents)

            rawArray.push({
                dept: dept,
                failed: totalNumberOfFailingStduents,
                total: totalNumberOfStudents,
                ratio: totalNumberOfFailingStduents / totalNumberOfStudents
            })
        })

        var sortedArrayByRatio = _.sortBy(rawArray, function(x) {
            return x.ratio
        }).reverse()

        var sortedArrayByTotal = _.sortBy(rawArray, function(x) {
            return x.failed
        }).reverse()

        var answer = {
            byRatio: _.first(sortedArrayByRatio,3),
            byTotal: _.first(sortedArrayByTotal,3)
        }

        callback(null, answer)

    })

}
module.exports = plugin