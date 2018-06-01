const path         = require('path');
const Task         = require('../../../tasks/-task');
const getAppName   = require('../../cordova/utils/get-app-name');
const getPath      = require('../../cordova/utils/get-path');
const logger       = require('../../../utils/logger');
const parsePbxproj = require('../utils/parse-pbxproj');

module.exports = Task.extend({
  buildConfigName: 'debug',
  failed: undefined,
  project: undefined,
  logLevel: 'error',

  run() {
    this.failed = false;
    return getAppName(this.project).then((appName) => {
      let pbxprojPath = this._buildPbxprojPath(this.project, appName);
      let config;
      try {
        config = parsePbxproj(pbxprojPath, appName);
      } catch (err) {
        return this._fail(err);
      }

      if (config.provisioningStyle === 'automatic' && !config.developmentTeam) {
        return this._fail('xcode project is configured for automatic signing,'
          + ' but no development team has been selected');
      }

      if (config.provisioningStyle === 'manual') {
        let buildConfig = config.buildConfigurations[this.buildConfigName];
        if (!buildConfig.provisioningProfile) {
          return this._fail('xcode project is configured for manual signing,'
            + ' but no provisioning profile has been selected');
        }
      }
    });
  },

  _buildPbxprojPath(project, appName) {
    return path.join(
      getPath(project.root),
      'platforms',
      'ios',
      `${appName}.xcodeproj`,
      'project.pbxproj'
    );
  },

  _fail(message) {
    this.failed = true;
    if (this.logLevel === 'warn') {
      message += '; project may build, but archive will fail.';
      return logger.warn(message);
    }
    throw `${message}.`;
  }
});
