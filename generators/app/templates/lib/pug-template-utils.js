'use strict'

import fs from 'fs/promises';
import { readFileSync } from 'fs';
import { config } from '../gulp/utils';
import path from 'path';
import foldero from 'foldero';
import yaml from 'js-yaml';
import pug from 'pug'

const dirs = config.directories;
const dataPath = path.join(dirs.source, dirs.data);

export default {
  async getData(dataPath) {
    let siteData = {};

    try {
      fs.stat(dataPath)
    }
    catch(ex) {
      return siteData;
    }

    siteData = foldero(dataPath, {
      recurse: true,
      whitelist: '(.*/)*.+.(json|ya?ml)$',
      loader: function loadAsString(file) {
        let json = {};
        try {
          if (path.extname(file).match(/^.ya?ml$/)) {
            json = yaml.safeLoad(readFileSync(file, 'utf8'));
          } else {
            json = JSON.parse(readFileSync(file, 'utf8'));
          }
        } catch (e) {
        }
        return json;
      }
    });

    return siteData;
  },

  async getModuleDependencies(pathname){
    const content = (await fs.readFile(pathname)).toString();
    const matches = content.matchAll(/(?:^|\s+)(?:extends|include)\s+(\S+)/g);
    const includes = Array.from(matches).map(match => match[1]);

    return includes
  },

  async hasChanged(pathname, targetStat, { visited }) {
    let stat;

    try {
      stat = await fs.stat(pathname);
    }
    catch (ex) {
      return false;
    }

    if (stat && Math.floor(stat.mtimeMs) > (Math.floor(targetStat.mtimeMs))) {
      return true;
    }

    visited.set(pathname, true);

    const dependencies = await this.getModuleDependencies(pathname);
    const dirname = path.dirname(pathname);

    for (const dependency of dependencies) {
      const dependencyPath = path.join(dirname, dependency).replace(/\.[^.]+$/, '') + '.pug';

      if (!visited.has(dependencyPath) && await this.hasChanged(dependencyPath, targetStat, { visited })) {
        return true;
      }
    }

    return false;
  },

  async compile(templateFile, targetFile) {
    const start = Date.now();

    console.log('recompiling ' + templateFile);

    const siteData = await this.getData(dataPath);
    const content = await fs.readFile(templateFile);

    const compile = pug.compile(content, {
      filename: templateFile,
      config: config,
    });

    await fs.writeFile(targetFile, compile({
      config,
      debug: true,
      site: { data: siteData },
    }));

    console.log(`recompiled ${templateFile}: ${Date.now() - start}ms`);
  }
}
