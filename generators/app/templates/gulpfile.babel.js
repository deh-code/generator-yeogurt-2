'use strict';
<% if (testFramework !== 'none') { %>import { KarmaServer, args } from './gulp/utils.js'; <% } %>

import gulp from 'gulp';
import './gulp/tasks/clean.js';
import './gulp/tasks/rev.js';
import './gulp/tasks/browserSync.js';
import './gulp/tasks/copy.js';
import './gulp/tasks/pug.js';<% if (cssOption === 'postcss') { %>
import './gulp/tasks/postcss.js';<% } else if (cssOption === 'sass') { %>
import './gulp/tasks/sass.js';<% } %>
import './gulp/tasks/browserify.js';
import './gulp/tasks/eslint.js';
import './gulp/tasks/imagemin.js';
import './gulp/tasks/watch.js';

// Build production-ready code
gulp.task('build', gulp.series(
  gulp.parallel(
    'copy',
    'imagemin',
    'pug'<% if (cssOption === 'postcss') { %>,
    'postcss'<% } else if (cssOption === 'sass') { %>,
    'sass'<% } %>,
    'browserify'
  ),
  'rev'
));

// Server tasks with watch
gulp.task('serve', gulp.series(
  gulp.parallel(
    'imagemin',
    'copy'<% if (cssOption === 'postcss') { %>,
    'postcss'<% } %><% if (cssOption === 'sass') { %>,
    'sass'<% } %>,
    'browserify',
    'browserSync',
    'watch'
  )
));

// Default task
gulp.task('default', gulp.series('clean', 'build'));

// Testing
gulp.task('test', gulp.series('eslint'<% if (testFramework === 'none') { %>));<% } else { %>, (done) => {
  new KarmaServer({
    configFile: path.join(__dirname, '/karma.conf.js'),
    singleRun: !args.watch,
    autoWatch: args.watch
  }, done).start();
}));<% } %>
