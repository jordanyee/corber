const cordovaPath      = require('./get-path');
const fs               = require('fs');
const parseXml         = require('../../../utils/parse-xml');
const path             = require('path');
const xml2js           = require('xml2js');

const builder = new xml2js.Builder({
  renderOpts: {
    'pretty': true,
    'indent': '    ',
    'newline': '\n'
  }
});

module.exports = {
  addNavigation(project, host) {
    let cdvPath = cordovaPath(project.root);
    let configPath = path.join(cdvPath, 'config.xml');

    return parseXml(configPath).then(function(json) {
      let navOptions = { $: { href: host, name: 'ec-nav' }};

      if (!json.widget['allow-navigation']) {
        json.widget['allow-navigation'] = [];
      }

      json.widget['allow-navigation'].push(navOptions);

      let xml = builder.buildObject(json);

      fs.writeFileSync(configPath, xml);
    });
  },

  removeNavigation(project, host) {
    let cdvPath = cordovaPath(project.root);
    let configPath = path.join(cdvPath, 'config.xml');

    parseXml(configPath).then(function(json) {
      let clientNavs = [];

      json.widget['allow-navigation'].forEach(function(nav) {
        if (nav.$.name !== 'ec-nav') {
          clientNavs.push(nav);
        }
      });

      json.widget['allow-navigation'] = [];

      clientNavs.forEach(function(nav) {
        json.widget['allow-navigation'].push(nav);
      });

      let xml = builder.buildObject(json);

      fs.writeFileSync(configPath, xml);
    });
  }
};
