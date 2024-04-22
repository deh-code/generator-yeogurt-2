'use strict';

const path = require('path');
const autoprefixer = require('autoprefixer');
const gulpif = require('gulp-if');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano');
const fancyLog = require('fancy-log');
const { args, config, taskTarget, browserSync } = require('../utils');

let dirs = config.directories;
let entries = config.entries;
let dest = path.join(taskTarget, dirs.styles.replace(/^_/, ''));

// Sass compilation
gulp.task('sass', () => {
  return gulp
    .src(entries.css, { cwd: path.join(dirs.source, dirs.styles) })
    .pipe(plumber())
    .pipe(gulpif(!args.production, sourcemaps.init({ loadMaps: true })))
    .pipe(
      require('gulp-sass')(require('sass'))({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: [
          path.join(dirs.source, dirs.styles),
          path.join(dirs.source, dirs.modules)
        ]
      })
    )
    .on('error', function(err) {
      fancyLog(err);
    })
    .pipe(postcss([autoprefixer()]))
    .pipe(
      rename(function(path) {
        // Remove 'source' directory as well as prefixed folder underscores
        // Ex: 'src/_styles' --> '/styles'
        path.dirname = path.dirname.replace(dirs.source, '').replace('_', '');
      })
    )
    .pipe(gulpif(args.production, cssnano({ rebase: false })))
    .pipe(gulpif(!args.production, sourcemaps.write('./')))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream({ match: '**/*.css' }));
});
