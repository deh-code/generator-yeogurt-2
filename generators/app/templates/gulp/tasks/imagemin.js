'use strict';

const path = require('path');
const gulpif = require('gulp-if');
const pngquant = require('imagemin-pngquant');
const gulp = require('gulp');
const { args, config, taskTarget, browserSync } = require('../utils');

let dirs = config.directories;
let dest = path.join(taskTarget, dirs.images.replace(/^_/, ''));

// Imagemin
gulp.task('imagemin', async () => {
  const { default: imagemin, svgo } = (await import('gulp-imagemin'));
  const changed = (await import('gulp-changed')).default;

  return gulp
    .src('**/*.{jpg,jpeg,gif,svg,png}', {
      cwd: path.join(dirs.source, dirs.images)
    })
    .pipe(changed(dest))
    .pipe(
      gulpif(
        args.production,
        imagemin(
          [
            svgo({ plugins: [{ removeViewBox: false }] })
          ],
          { use: [pngquant({ speed: 10 })] }
        )
      )
    )
    .pipe(gulp.dest(dest));
});
