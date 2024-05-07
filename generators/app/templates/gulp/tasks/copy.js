'use strict';

import path from 'path';
import gulp from 'gulp';
import { config, taskTarget } from '../utils.js';
import changed from 'gulp-changed';

let dirs = config.directories;
let dest = path.join(taskTarget);

// Copy
gulp.task('copy', () => {
  return gulp.src([
      '**/*'
    ], {
      cwd: dirs.source,
      encoding: false,
      ignore: [
        '**/\_*',
        '**/\_*/**',
        '*.md',
        '**/*.pug'
      ]})
    .pipe(changed(dest))
    .pipe(gulp.dest(dest))
});
