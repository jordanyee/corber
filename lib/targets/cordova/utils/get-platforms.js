const getCordovaPath   = require('../utils/get-path');
//const existsSync      = require('../../../utils/fs-utils').existsSync;
const path             = require('path');

module.exports = function(project) {
  let cordovaPath = getCordovaPath(project.root);
  let platformsPath = path.join(cordovaPath, 'platforms/platforms.json');
  let packagePath = path.join(cordovaPath, 'package.json');

  let moduleExists = path => {
    try {
      require(path);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  let getFromPlatforms = () => {
    return Object.keys(require(platformsPath));
  };

  let getFromPackage = () => {
    return require(packagePath).cordova.platforms;
  };

  try {
    return moduleExists(platformsPath) ? getFromPlatforms() : getFromPackage();
  } catch (e) {
    if (!e.message.match(/Cannot find module/)) { throw e; }
    return [];
  }
}
