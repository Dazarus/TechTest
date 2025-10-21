module.exports = {
  default: {
    require: ['support/**/*.ts', 'features/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1
  }
};