'use strict'

const fs = require('fs/promises');
const { readFileSync } = require('fs');
const { config } = require('../gulp/utils');
const path = require('path');
const foldero = require('foldero');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

const dirs = config.directories;
const dataPath = path.join(dirs.source, dirs.data);

module.exports = {
  async getData(dataPath) {
    let siteData = {};

    try {
      fs.stat(dataPath);
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
    const matches = content.matchAll(/(?:^|\s+)(?:extends|import)\s+['"](\S+)/g);
    const includes = Array.from(matches).map(match => match[1]);

    return includes;
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
      const dependencyPath = path.join(dirname, dependency).replace(/\.[^.]+$/, '') + '.nunjucks';

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

    var loader = new nunjucks.FileSystemLoader([dirs.source], {
      watch: false,
      noCache: false
    });

    var env = new nunjucks.Environment(loader, {
      autoescape: false
    });

    await new Promise((resolve) => {
      env.renderString(content.toString(), siteData, async function(err, res) {

        if (err) {
          console.error(err);
          return;
        }

        await fs.writeFile(targetFile, res);
        resolve();
      });
    })


    console.log(`recompiled ${templateFile}: ${Date.now() - start}ms`);
  }
}
