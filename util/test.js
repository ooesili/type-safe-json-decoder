var Jasmine = require('jasmine')
var jasmine = new Jasmine()

jasmine.loadConfig({
  spec_dir: 'dist/spec',
  spec_files: [
    '**/*[sS]pec.js'
  ],
  helpers: [
    'helpers/**/*.js'
  ],
  showColors: true,
  stopSpecOnExpectationFailure: false,
  random: false
})
jasmine.configureDefaultReporter({
  showColors: true
})
jasmine.execute()
