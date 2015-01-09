var debug = require('debug')('diff.main')
var async = require('async')
var _ = require('lodash')


///
// Private data
//

// store registered data providers
// TODO: use a custom object
var _dataProvidersStore = {}

// store registered questions
// TODO: use a custom object
var _questionStore = []

var plugin = function(diff) {

    //
    // Method to define a new question
    //
    diff.question = function(text, dependencies, callback) {
        _questionStore.push(new Question(text, dependencies, callback))
    }

    //
    // Method to define a new data provider
    //
    diff.dataProvider = function(name, callback) {
        _dataProvidersStore[name] = callback
    }


    //
    // Method to ask all the questions that contain some of the given words
    //
    diff.ask = function(words, callback) {

        if (words.length === 0) {

            diff.askAll(callback)

        } else {

            var simpleKeywordMatchFunc = function(question) {
                return _.any(words, function(word) {
                    return question.text.match(word)
                })
            }

            var questionsToAsk = _.filter(_questionStore, function(q) {
                return simpleKeywordMatchFunc(q)
            })

            askQuestionsAsync(questionsToAsk, callback)
        }
    }

    function askQuestionsAsync(questions, callback) {
        // array to collect all the answers
        var answers = []

        // ask each question
        async.eachSeries(questions, function(question, asyncCallback) {

                debug('asking: %s', question.text)

                // lookup dependencies
                // in the current prototoype, we pick only the first one
                var depName = question.dependencies[0] // TODO: support multiple dependencies
                var dep = _dataProvidersStore[depName] // TODO: handels dep not found error

                dep(function(error, data) {

                    question.callback(data, function(error, result) {
                        if (error) {
                            debug(error)
                            asyncCallback(null, error)
                        }

                        var answer = new Answer(question.text, result);
                        debug('got: ', answer)
                        answers.push(answer)
                        asyncCallback(null, answer)
                    })

                })
            },
            // this callback is invoked after all the questions in the series are finished
            function(error) {
                if (error)
                    callback(error)
                else
                    callback(null, answers)
            })
    }

    //
    // Method to 'ask' all questions asynchronously
    //
    diff.askAll = function(callback) {
        askQuestionsAsync(_questionStore, callback)
    }

}

module.exports = plugin

//
// Class: Answer
//

function Answer(question, answer) {
    this.question = question;
    this.answer = answer;
}

Answer.prototype = {
    constructor: Answer,

    toString: function() {
        if (_.isArray(this.answer)) {
            return this.answer.map(function(d, i) {
                return "(" + (i + 1) + ") " + d.join('\t')
            }).join('\n')
        } else {
            return this.answer
        }
    }
}

function Question(text, dependencies, callback) {
    this.text = text
    this.dependencies = dependencies
    this.callback = callback
}