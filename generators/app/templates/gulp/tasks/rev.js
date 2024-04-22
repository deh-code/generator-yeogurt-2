'use strict';

const path = require('path');
const gulp = require('gulp');
const { config, taskTarget } = require('../utils');

let dirs = config.directories;
let dest = path.join(taskTarget);

// Copy
gulp.task('rev', async () => {
  const gulpFilter = (await import('gulp-filter')).default;
  const gulpRev = (await import('gulp-rev')).default;
  const gulpRevDel = (await import('gulp-rev-delete-original')).default;
  const gulpRevRewrite = (await import('gulp-rev-rewrite')).default;

  // gulp-rev-rewrite will mangle binary files (images, etc), so ignore them
  const binaryAssetFilter = gulpFilter(
    ['**', '!**/*.{ico,png,jpg,jpeg,gif,webp}'],
    { restore: true }
  );
  const htmlFilter = gulpFilter(['**', '!**/*.html'], { restore: true });
  return gulp
    .src(`**/*.{js,css,html}`, { cwd: dirs.destination })
    .pipe(htmlFilter)
    .pipe(gulpRev())
    .pipe(htmlFilter.restore)
    .pipe(binaryAssetFilter)
    .pipe(gulpRevRewrite())
    .pipe(binaryAssetFilter.restore)
    .pipe(gulp.dest(dest))
    .pipe(gulpRevDel())
    .pipe(gulpRev.manifest())
    .pipe(gulp.dest(dest));
});
