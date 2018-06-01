const cordovaPath      = require('./get-path');
const parseXml         = require('../../../utils/parse-xml');
const path             = require('path');

module.exports = function getCordovaConfig(project) {
  let cdvPath = cordovaPath(project.root);
  let configPath = path.join(cdvPath, 'config.xml');

  return parseXml(configPath);
};
