'use strict'

import fs from 'fs/promises';
import { readFileSync } from 'fs';
import { config } from '../gulp/utils.js';
import path from 'path';
import foldero from 'foldero';
import yaml from 'js-yaml';
import pug from 'pug';
import { cwd } from 'process';

const dirs = config.directories;
const dataPath = path.join(dirs.source, dirs.data);
const helpersPath = path.join(cwd(), 'gulp', 'helpers');

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

  async getModuleDependencies(content, pathname){
    const matches = content.matchAll(/(?:^|\s+)(?:extends|include)\s+(\S+)/g);
    const includes = Array.from(matches).map(match => match[1]);

    const dirname = path.dirname(pathname);
    return includes.map(dependency => path.join(dirname, dependency).replace(/\.[^.]+$/, '') + '.pug');
  },

  async getDataDependencies(content, pathname) {
    const matches = content.matchAll(/site\.data(?:\.|\[')([a-zA-z-]+)/g);
    const includes = Array.from(matches).map(match => match[1]);

    const dirname = path.join(cwd(), dirs.source, dirs.data);
    return includes.map(dependency => path.join(dirname, dependency) + '.json');
  },

  async getHelpers() {
    const helpers = {};
    const files = await fs.readdir(helpersPath);

    const loadHelper = async (file) => {
      const helperName = file.replace(/\.[^.]*$/, '');

      helpers[helperName] = (await import(path.join(helpersPath, file))).default;

      return;
    }

    const loadHelpers = files.map(loadHelper);

    await Promise.all(loadHelpers);

    return helpers;
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

    const content = (await fs.readFile(pathname)).toString();
    const getDependenciesTask = [this.getModuleDependencies(content, pathname), this.getDataDependencies(content, pathname)];
    const dependencies = (await Promise.all(getDependenciesTask)).flat();

    for (const dependency of dependencies) {
      if (!visited.has(dependency) && await this.hasChanged(dependency, targetStat, { visited })) {
        return true;
      }
    }

    return false;
  },

  async compile(templateFile, targetFile) {
    const start = Date.now();

    console.log('recompiling ' + templateFile);

    const siteData = await this.getData(dataPath);
    const helpers = await this.getHelpers();
    const content = await fs.readFile(templateFile);

    const compile = pug.compile(content, {
      filename: templateFile,
      config: config,
    });

    await fs.writeFile(targetFile, compile({
      config,
      debug: true,
      site: { data: siteData },
      ...helpers
    }));

    console.log(`recompiled ${templateFile}: ${Date.now() - start}ms`);
  }
}
