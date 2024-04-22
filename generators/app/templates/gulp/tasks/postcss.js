'use strict';

const path = require('path');
const autoprefixer = require('autoprefixer');
const gulpif = require('gulp-if');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano');
const postCssImport = require('postcss-import');
const fancyLog = require('fancy-log');
const { args, config, taskTarget, browserSync } = require('../utils');

let dirs = config.directories;
let entries = config.entries;
let dest = path.join(taskTarget, dirs.styles.replace(/^_/, ''));
var postCssPlugins = [
  postCssImport({
    path: [
      path.join(dirs.source, dirs.styles),
      path.join(dirs.source, dirs.modules)
    ]
  }),
  autoprefixer()
];

// PostCSS compilation
gulp.task('postcss', () => {
  return gulp
    .src(entries.css, { cwd: path.join(dirs.source, dirs.styles) })
    .pipe(plumber())
    .pipe(gulpif(!args.production, sourcemaps.init({ loadMaps: true })))
    .pipe(postcss(postCssPlugins))
    .on('error', function(err) {
      fancyLog(err);
    })
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
