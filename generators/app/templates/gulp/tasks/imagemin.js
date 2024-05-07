'use strict';

import path from 'path';
import gulpif from 'gulp-if';
import pngquant from 'imagemin-pngquant';
import gulp from 'gulp';
import { args, config, taskTarget, browserSync } from '../utils.js';
import imagemin, {svgo} from 'gulp-imagemin';
import changed from 'gulp-changed';

let dirs = config.directories;
let dest = path.join(taskTarget, dirs.images.replace(/^_/, ''));

// Imagemin
gulp.task('imagemin', () => {
  return gulp
    .src('**/*.{jpg,jpeg,gif,svg,png}', {
      cwd: path.join(dirs.source, dirs.images),
      encoding: false
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
