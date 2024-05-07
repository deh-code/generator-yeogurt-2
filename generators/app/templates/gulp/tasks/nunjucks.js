'use strict';

import fs from 'fs';
import path from 'path';
import foldero from 'foldero';
import nunjucks from 'gulp-nunjucks-html';
import yaml from 'js-yaml';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import htmlmin from 'gulp-htmlmin';
import data from 'gulp-data';
import changed from 'gulp-changed';
import fancyLog from 'fancy-log';
import { args, config, taskTarget, browserSync } from '../utils.js';

let dirs = config.directories;
let dest = path.join(taskTarget);
let dataPath = path.join(dirs.source, dirs.data);

// Nunjucks template compile
gulp.task('nunjucks', () => {
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
      .src(['**/*.nunjucks'], { cwd: dirs.source, ignore: ['**/_*', '**/_*/**'] })
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
