/*eslint no-process-exit:0 */

'use strict';

const gulpif = require('gulp-if');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const { config, browserSync } = require('../utils');

let dirs = config.directories;

// ESLint
gulp.task('eslint', () => {
  return gulp
    .src(
      [
        '../gulpfile.babel.js',
        '**/*.js',
        // Ignore all vendor folder files
        '!**/vendor/**/*'
      ],
      { cwd: dirs.source }
    )
    .pipe(browserSync.reload({ stream: true, once: true }))
    .pipe(
      eslint({
        useEslintrc: true
      })
    )
    .pipe(eslint.format())
    .pipe(gulpif(!browserSync.active, eslint.failAfterError()))
    .on('error', function() {
      if (!browserSync.active) {
        process.exit(1);
      }
    });
});
