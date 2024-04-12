'use strict';

import gulp from 'gulp';
import { plugins, args, config, taskTarget, browserSync } from '../utils';
import path from 'path';
import { cwd, hrtime } from 'process';
import fs from 'fs/promises';
import templateUtils from '../../lib/template-utils';

let dirs = config.directories;
let dataPath = path.join(dirs.source, dirs.data);

// BrowserSync
gulp.task('browserSync', () => {
  return browserSync.init({
    open: args.open ? 'local' : false,
    startPath: config.baseUrl,
    port: config.port || 3000,
    server: {
      baseDir: taskTarget,
      routes: (() => {
        let routes = {};

        // Map base URL to routes
        routes[config.baseUrl] = taskTarget;

        return routes;
      })()
    },
    middleware: [
      async function (req, res, next) {
        let pathname;

        try {
          const url = new URL('http://localhost' + req.url);
          pathname = url.pathname;
        }
        catch(ex) {
          console.warn(`Failed to parse URL ${'http://localhost' + req.url}`);
        }

        // pathname ends with filename which is not html
        if (!pathname || /\.(?:(?!html).)+$/.test(pathname)) {
          next();
          return;
        }

        // the relative path to file without extension
        const filename = pathname.endsWith('/') ? pathname + 'index' : pathname.replace(/\.[^.]*$/, '');

        const templateFile =  path.join(cwd(), config.directories.source, filename + '.<%= htmlOption %>');

        try {
          await fs.stat(templateFile);
        }
        catch(ex) {
          next();
          return;
        }

        const targetFile = path.join(cwd(), taskTarget, filename + '.html');
        let hasChanged = false;

        try {
          const targetStat = await fs.stat(targetFile);
          const visited = new Map();

          hasChanged = await templateUtils.hasChanged(templateFile, targetStat, { visited });
        }
        catch(ex) {
          hasChanged = true;
          await fs.mkdir(path.dirname(targetFile), {recursive: true});
        }

        if (hasChanged) {
          await templateUtils.compile(templateFile, targetFile);
        }

        next();
      },
    ]
  });
});
