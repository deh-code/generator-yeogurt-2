'use strict';

const path = require('path');
const gulp = require('gulp');
const { config, taskTarget } = require('../utils');

let dirs = config.directories;
let dest = path.join(taskTarget);

// Copy
gulp.task('copy', async () => {
  const changed = (await import('gulp-changed')).default;

  return await new Promise((done) => {
    gulp.src([
      '**/*'
    ], { cwd: dirs.source, ignore: [
      '**/\_*',
      '**/\_*/**',
      '*.md'<% if (htmlOption === 'nunjucks') { %>,
      '**/*.nunjucks'<% } else if (htmlOption === 'pug') { %>,
      '**/*.pug'<% } %>]})
    .pipe(changed(dest))
    .pipe(gulp.dest(dest))
    .on('end', done);
  });
});
