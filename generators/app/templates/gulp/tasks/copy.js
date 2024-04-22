'use strict';

const path = require('path');
const gulp = require('gulp');
const { config, taskTarget } = require('../utils');

let dirs = config.directories;
let dest = path.join(taskTarget);

// Copy
gulp.task('copy', async () => {
  const changed = (await import('gulp-changed')).default;

  return gulp.src([
    '**/*',
    '!{**/\_*,**/\_*/**,*.md}'<% if (htmlOption === 'nunjucks') { %>,
    '!**/*.nunjucks'<% } else if (htmlOption === 'pug') { %>,
    '!**/*.pug'<% } %>
  ], { cwd: dirs.source })
  .pipe(changed(dest))
  .pipe(gulp.dest(dest));
});
