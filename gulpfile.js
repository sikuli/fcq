'use strict';

var gulp     = require('gulp'),
    csv2     = require('csv2'),
    through2 = require('through2'),
    _        = require('lodash'),
    rename   = require('gulp-rename'),
    process  = require('child_process'),
    fs       = require('fs');

gulp.task('csv2json', function() {

    var src = './data/fcq.csv'
    var dest  = './data'

    return gulp.src(src, {
            buffer: false   // assuming the input data file is large, open it as a stream
        })
        .pipe(through2.obj(function(file, enc, callback) {

            var header
            // modify the file contents to be a stream of JSON strings
            file.contents = file.contents
                .pipe(csv2())
                .pipe(through2.obj(function(record, enc, callback) {

                    if (!header) {
                        // take the first record as the header
                        header = record

                    } else {

                        var obj = _.zipObject(header, record)
                        this.push(JSON.stringify(obj) + '\n')
                    }

                    callback()
                }))

            this.push(file)
            callback()

        }))
        .pipe(rename(function(path) {
            path.extname = ".json"
        }))
        .pipe(gulp.dest(dest))
});

gulp.task('import', function() {
    var database = 'sikuli';
    var collection = 'fcq';

    var args = [
        '--type', 'json',
        '-d', database,
        '-c', collection,
        '--file', 'data/fcqFiltered.json'
    ];

    var mongoimport = process.spawn('mongoimport', args);

    mongoimport.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    mongoimport.stderr.on('data', function (data) {
        console.error(data.toString());
    });
});

gulp.task('sanitize', function() {
    var readFile = function(file) {
        return fs.readFileSync(file, 'utf8');
    };

    var splitLines = function(data) {
        var output = data.split("\n");
        return output.splice(0, output.length - 1);
    };

    var parseJSON = function(collection) {
        return _.map(collection, JSON.parse);
    };

    var sanitizeOutputs = function(collection) {
        // Check to see if it is a percentage
        var isMatch = function(val) { return val.search("%") != -1; };

        // Coerce percentage to float
        var coerceToFloat = function(val) {
            return val.match(/[0-9]+/) / 100;
        };

        // Coerce when we have a percentage, otherwise do nothing
        var coerceIfPercentage = function(val) {
            return isMatch(val) ? coerceToFloat(val) : val;
        };

        // Map over collection and each object, coercing if percentage
        return _.map(collection, function(obj) {
            return _.mapValues(obj, coerceIfPercentage);
        });
    };

    // Since Mongo is not very friendly with JSON arrays, we newline each entry
    var mongoifyOutputToFile = function(collection) {
        var outputFile = 'data/fcqFiltered.json';
        var appendFile = _.partial(fs.appendFileSync, outputFile);

        _.each(collection, function(val) {
            appendFile(JSON.stringify(val) + "\n");
        });

        console.log('Successfully wrote to file.');

        return;
    };

    // Compostion chain, moves bottom up
    var filterData = _.compose(
        mongoifyOutputToFile,
        sanitizeOutputs,
        parseJSON,
        splitLines,
        readFile
    );

    // Run the task
    filterData('data/fcq.json');
});
