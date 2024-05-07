'use strict';

import browserSyncLib from 'browser-sync';
import minimist from 'minimist';
import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

const pjson = JSON.parse(fs.readFileSync(path.resolve(cwd(), 'package.json')));

<% if (testFramework !== 'none') { %>
// Create karma server
export const KarmaServer = require('karma').Server;<% } %>

// Get package.json custom configuration
export const config = Object.assign({}, pjson.config);

// Gather arguments passed to gulp commands
export const args = minimist(process.argv.slice(2));

// Alias config directories
export const dirs = config.directories;

// Determine gulp task target destinations
export const taskTarget = args.production ? dirs.destination : dirs.temporary;

// Create a new browserSync instance
export const browserSync = browserSyncLib.create();
