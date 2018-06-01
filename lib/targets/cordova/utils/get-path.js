const path             = require('path');

module.exports = function cordovaPath(projectRoot, excludeCordova) {
  let cdvPath = path.join(projectRoot, 'corber');

  return excludeCordova ?
    cdvPath :
    path.join(cdvPath, 'cordova');
};
