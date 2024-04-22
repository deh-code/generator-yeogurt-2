'use strict';

const fs = require('fs');
const path = require('path');
const foldero = require('foldero');
const nunjucks = require('gulp-nunjucks-html');
const yaml = require('js-yaml');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const htmlmin = require('gulp-htmlmin');
const data = require('gulp-data');
const fancyLog = require('fancy-log');
const { args, config, taskTarget, browserSync } = require('../utils');

let dirs = config.directories;
let dest = path.join(taskTarget);
let dataPath = path.join(dirs.source, dirs.data);

// Nunjucks template compile
gulp.task('nunjucks', async () => {
  const changed = (await import('gulp-changed')).default;

  let siteData = {};
  if (fs.existsSync(dataPath)) {
    // Convert directory to JS Object
    siteData = foldero(dataPath, {
      recurse: true,
      whitelist: '(.*/)*.+.(json|ya?ml)$',
      loader: function loadAsString(file) {
        let json = {};
        try {
          if (path.extname(file).match(/^.ya?ml$/)) {
            json = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
          } else {
            json = JSON.parse(fs.readFileSync(file, 'utf8'));
          }
        } catch (e) {
          fancyLog(`Error Parsing DATA file: ${file}`);
          fancyLog('==== Details Below ====');
          fancyLog(e);
        }
        return json;
      }
    });
  }

  // Add --debug option to your gulp task to view
  // what data is being loaded into your templates
  if (args.debug) {
    fancyLog('==== DEBUG: site.data being injected to templates ====');
    fancyLog(siteData);
    fancyLog('\n==== DEBUG: package.json config being injected to templates ====');
    fancyLog(config);
  }

  return (
    gulp
      // Ignore underscore prefix folders/files (ex. _custom-layout.nunjucks)
      .src(['**/*.nunjucks', '!{**/_*,**/_*/**}'], { cwd: dirs.source })
      .pipe(changed(dest))
      .pipe(plumber())
      .pipe(
        data({
          config: config,
          debug: !args.production,
          site: {
            data: siteData
          }
        })
      )
      .pipe(
        nunjucks({
          searchPaths: [dirs.source],
          ext: '.html'
        }).on('error', function(err) {
          fancyLog(err);
        })
      )
      .on('error', function(err) {
        fancyLog(err);
      })
      .pipe(
        htmlmin({
          collapseBooleanAttributes: true,
          conservativeCollapse: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true
        })
      )
      .pipe(gulp.dest(dest))
      .on('end', browserSync.reload)
  );
});
