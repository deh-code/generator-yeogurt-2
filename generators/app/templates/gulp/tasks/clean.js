'use strict';

const gulp = require('gulp');
const { config } = require('../utils');

let dirs = config.directories;

// Clean
gulp.task('clean', async () => {
  const del = (await import('del')).deleteAsync;
  return del([dirs.temporary, dirs.destination])
});
