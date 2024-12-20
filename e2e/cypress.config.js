const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 5000,
  watchForFileChanges: false,
  video: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  env: {
    pluginVisualRegressionMaxDiffThreshold: 0.036,
  },
  e2e: {
    baseUrl: 'http://localhost:4000',
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
