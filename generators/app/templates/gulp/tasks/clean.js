'use strict';

import gulp from 'gulp';
import { config } from '../utils.js';
import { deleteSync } from 'del';

let dirs = config.directories;

// Clean
gulp.task('clean', (done) => {
  deleteSync([dirs.temporary, dirs.destination]);
  done();
});
