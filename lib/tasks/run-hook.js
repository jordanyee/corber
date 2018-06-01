const Task             = require('./-task');
const Promise          = require('rsvp').Promise;
const logger           = require('../utils/logger');

const cordovaPath      = require('../targets/cordova/utils/get-path');
const fsUtils          = require('../utils/fs-utils');
const path             = require('path');

module.exports = Task.extend({
  project: undefined,

  run(hookName, options) {
    let projectPath, hookPath, hook, hookReturn;

    projectPath = cordovaPath(this.project.root, true);
    hookPath = path.join(projectPath, 'hooks', hookName + '.js');

    if (fsUtils.existsSync(hookPath)) {
      logger.info('Located hook for: ' + hookName);

      try {
        hook = require(hookPath);
        hookReturn = hook(options);

        logger.success('Ran hook for: ' + hookName);

        return Promise.resolve(hookReturn);
      } catch (e) {
        return Promise.reject(e);
      }

    } else {
      return Promise.resolve();
    }
  }
});
