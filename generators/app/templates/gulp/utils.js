'use strict';

const browserSyncLib = require('browser-sync');
const minimist = require('minimist');
const pjson = require('../package.json');

<% if (testFramework !== 'none') { %>
// Create karma server
const KarmaServer = require('karma').Server;<% } %>

// Get package.json custom configuration
const config = Object.assign({}, pjson.config);

// Gather arguments passed to gulp commands
const args = minimist(process.argv.slice(2));

// Alias config directories
const dirs = config.directories;

// Determine gulp task target destinations
const taskTarget = args.production ? dirs.destination : dirs.temporary;

// Create a new browserSync instance
const browserSync = browserSyncLib.create();

module.exports = {
  <% if (testFramework !== 'none') { %>KarmaServer,<% } %>
  config,
  args,
  dirs,
  taskTarget,
  browserSync
}
