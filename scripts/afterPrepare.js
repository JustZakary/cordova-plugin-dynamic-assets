#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ConfigParser = require('cordova-common').ConfigParser;

function sixCharHash(str) {
  var hash = 0;
  if (str.length == 0) return hash.toString(36).substring(0, 6);
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

module.exports = function (context) {
  const projectRoot = context.opts.projectRoot;
  const config = new ConfigParser(path.join(projectRoot, 'config.xml'));

  // Get the platforms
  const platforms = context.opts.platforms;

  platforms.forEach(function (platform) {
    //Get urls from config.xml
    var jsUrls = config.getPreference('JS_URLS', platform) || config.getPreference('JS_URLS');
    var cssUrls = config.getPreference('CSS_URLS', platform) || config.getPreference('CSS_URLS');
    jsUrls = jsUrls.split('|');
    cssUrls = cssUrls.split('|');

    // Get files and names
    scripts = [];
    jsUrls.forEach(function (jsUrl) {
      var jsName = jsUrl.split('/').pop();
      jsName = jsName.split('?')[0];
      jsName = jsName.split('#')[0];
      jsName = jsName.split('&')[0];
      jsName = jsName.split('=')[0];
      jsName = jsName.split('.')[0];
      jsName = jsName + '.js';
      jsName = sixCharHash(jsName) + '_' + jsName;
      scripts.push({url: jsUrl, name: jsName});
    });

    styles = [];
    cssUrls.forEach(function (cssUrl) {
      var cssName = cssUrl.split('/').pop();
      cssName = cssName.split('?')[0];
      cssName = cssName.split('#')[0];
      cssName = cssName.split('&')[0];
      cssName = cssName.split('=')[0];
      cssName = cssName.split('.')[0];
      cssName = cssName + '.css';
      cssName = sixCharHash(cssName) + '_' + cssName;
      styles.push({url: cssUrl, name: cssName});
    });

    //Double check all urls and names are valid
    var valid = true;
    scripts.forEach(function (script) {
      const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
      const namePattern = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*\.(js|css)$/i;

      if (!urlPattern.test(script.url) || !namePattern.test(script.name)) {
        valid = false;
        console.error(`Invalid URL or filename: ${script.url}, ${script.name}`);
      }
    });

    let platformWwwPath = path.join(projectRoot, 'platforms', platform, 'platform_www');
    let dynamicPath = path.join(platformWwwPath, 'dynamic');
    if (!fs.existsSync(dynamicPath)) {
      fs.mkdirSync(dynamicPath);
    }

    if (fs.existsSync(platformWwwPath)) {
      // Create dynamic_assets.json with the URLs and names
      const dynamicAssets = {scripts, styles};
      const destJsonPath = path.join(platformWwwPath, 'dynamic_assets.json');
      fs.writeFileSync(destJsonPath, JSON.stringify(dynamicAssets, null, 2), 'utf8');
      console.log(`Created dynamic_assets.json for platform ${platform}`);

      scripts.forEach(function (script) {
        let scriptPath = path.join(platformWwwPath, 'dynamic', script.name);

        if (fs.existsSync(scriptPath)) {
          fs.unlinkSync(scriptPath);
        }

        fetch(script.url)
          .then((res) => res.text())
          .then((data) => {
            fs.writeFileSync(scriptPath, data, 'utf8');
            console.log(`Created ${script.name} for platform ${platform}`);
          })
          .catch(() => {
            console.error(`Failed to fetch ${script.url}`);
          });
      });

      styles.forEach(function (style) {
        let stylePath = path.join(platformWwwPath, 'dynamic', style.name);

        if (fs.existsSync(stylePath)) {
          fs.unlinkSync(stylePath);
        }

        //Get styles from url and save them in platform www
        fetch(style.url)
          .then((res) => res.text())
          .then((data) => {
            fs.writeFileSync(stylePath, data, 'utf8');
            console.log(`Created ${style.name} for platform ${platform}`);
          })
          .catch(() => {
            console.error(`Failed to fetch ${style.url}`);
          });
      });
    } else {
      console.error(`Platform www path does not exist: ${platformWwwPath}`);
    }
  });
};
