/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
const { initPlugin } = require("@frsource/cypress-plugin-visual-regression-diff/plugins");
const cypressSplit = require('cypress-split');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  initPlugin(on, config);
  // Splits specs across CI shards via SPLIT / SPLIT_INDEX, balanced by timings.json.
  // Without SPLIT set it is a no-op, so local runs are unaffected.
  cypressSplit(on, config);
  // cypress-split mutates config, so it must be returned or the split silently no-ops
  return config;
}
