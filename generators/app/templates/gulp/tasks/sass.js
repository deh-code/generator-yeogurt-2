'use strict';

import path from 'path';
import autoprefixer from 'autoprefixer';
import gulpif from 'gulp-if';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import cssnano from 'gulp-cssnano';
import fancyLog from 'fancy-log';
import { args, config, taskTarget, browserSync } from '../utils.js';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';

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
      gulpSass(sass)({
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
