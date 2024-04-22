'use strict';

const path = require('path');
const { glob } = require('glob');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const browserify = require('browserify');
const watchify = require('watchify');
const envify = require('envify');
const babelify = require('babelify');
const vsource = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gulpif = require('gulp-if');
const fancyLog = require('fancy-log');
const { args, config, taskTarget, browserSync } = require('../utils');

let dirs = config.directories;
let entries = config.entries;

let browserifyTask = (files, done) => {
  return files.map(entry => {
    let dest = path.resolve(taskTarget);

    // Options
    let customOpts = {
      entries: [entry],
      debug: true,
      transform: [
        babelify, // Enable ES6 features
        envify // Sets NODE_ENV for better optimization of npm packages
      ],
      plugins: [
        ['@babel/plugin-transform-regenerator']
      ]
    };

    let bundler = browserify(customOpts);

    if (!args.production) {
      // Setup Watchify for faster builds
      let opts = Object.assign({}, watchify.args, customOpts);
      bundler = watchify(browserify(opts));
    }

    let rebundle = function() {
      let startTime = new Date().getTime();
      bundler
        .bundle()
        .on('error', function(err) {
          fancyLog(
            'Browserify compile error:',
            '\n',
            err.stack,
            '\n'
          );
          this.emit('end');
        })
        .pipe(vsource(entry))
        .pipe(buffer())
        .pipe(
          gulpif(!args.production, sourcemaps.init({ loadMaps: true }))
        )
        .pipe(gulpif(args.production, uglify()))
        .pipe(
          rename(function(filepath) {
            // Remove 'source' directory as well as prefixed folder underscores
            // Ex: 'src/_scripts' --> '/scripts'
            filepath.dirname = filepath.dirname
              .replace(dirs.source, '')
              .replace('_', '');
          })
        )
        .pipe(gulpif(!args.production, sourcemaps.write('./')))
        .pipe(gulp.dest(dest))
        // Show which file was bundled and how long it took
        .on('end', function() {
          let time = (new Date().getTime() - startTime) / 1000;
          fancyLog(
            entry +
            ' was browserified: ' +
            time + 's'
          );
          done();
          return browserSync.reload('*.js');
        });
    };

    if (!args.production) {
      bundler.on('update', rebundle); // on any dep update, runs the bundler
      bundler.on('log', fancyLog); // output build logs to terminal
    }
    return rebundle();
  });
};

// Browserify Task
gulp.task('browserify', done => {
  glob(`${path.join(dirs.source, dirs.scripts)}/${entries.js}`, function(
    err,
    files
  ) {
    if (err) {
      throw new Error(err);
    }

    return browserifyTask(files, done);
  });
});
