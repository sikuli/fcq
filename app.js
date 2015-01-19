var diff = require('./lib/diff')
var chalk = require('chalk')
var eyes = require('eyes')

// get keywords (ignore node app.js)
var keywords = process.argv.slice(2)

// ask questions containing the given keywords
diff.ask(keywords, function(error, results) {
    logResultsToConsole(results)
})

console.log('waiting for answers')

function logResultsToConsole(results) {
    results.forEach(function(result) {
        console.log(chalk.green.bold("Q: " + result.question))
        eyes.inspect(result)
    })

}
