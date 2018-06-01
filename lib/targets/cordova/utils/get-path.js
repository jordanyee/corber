const path          = require('path');

module.exports = function (projectRoot, excludeCordova = false) {
  let cordovaPath = path.join(projectRoot, 'corber');

  if (excludeCordova === false) {
    cordovaPath = path.join(cordovaPath, 'cordova');
  }

  return cordovaPath;
};
