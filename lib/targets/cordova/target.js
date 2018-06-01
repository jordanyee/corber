const CoreObject              = require('core-object');
const { Promise }             = require('rsvp');
const path                    = require('path');
const Build                   = require('./tasks/build');
const ValidatePlugin          = require('./validators/plugin');
const ValidateSigningIdentity = require('../ios/validators/signing-identity');
const AllowNavigation         = require('./validators/allow-navigation');
const cordovaPath             = require('./utils/get-path');
const fsUtils                 = require('../../utils/fs-utils');
const getPackage              = require('../../utils/get-package');
const runValidators           = require('../../utils/run-validators');
const parseXml                = require('../../utils/parse-xml');

module.exports = CoreObject.extend({
  platform: undefined,
  project: undefined,
  signingIdentityValidation: undefined,
  cordovaOpts: {},

  _buildValidators(isServing, skipCordovaBuild = false) {
    let validators = [];

    validators.push(
      new AllowNavigation({
        project: this.project,
        rejectIfUndefined: isServing
      }).run()
    );

    if (this.platform === 'ios') {
      let validation = new ValidateSigningIdentity({
        project: this.project,
        buildConfigName: this.cordovaOpts.release ? 'release' : 'debug',
        logLevel: 'warn'
      });

      validators.push(validation.run());

      // build command will inspect this to show message after error code 65
      this.signingIdentityValidation = validation;
    }

    return validators;
  },

  validateBuild(skipCordovaBuild) {
    let validators = this._buildValidators(false, skipCordovaBuild);

    return runValidators(validators);
  },

  validateServe() {
    let validators = this._buildValidators(true);

    validators.push(
      new ValidatePlugin({
        project: this.project,
        platform: this.platform,
        pluginName: 'cordova-plugin-whitelist'
      }).run()
    );

    return runValidators(validators);
  },

  getInstalledPlatforms() {
    let packagePath = path.join(cordovaPath(this.project.root), 'package.json');
    if (fsUtils.existsSync(packagePath)) {
      let packageJSON = getPackage(packagePath);
      return Promise.resolve(packageJSON.cordova.platforms);
    }

    let configPath = path.join(cordovaPath(this.project.root), 'config.xml');
    if (fsUtils.existsSync(configPath)) {
      return parseXml(configPath).then((json) => {
        return json.widget.engine.map(p => p.$.name);
      });
    }

    return Promise.resolve([]);
  },

  build() {
    let cordovaBuild = new Build({
      project: this.project,
      platform: this.platform,
      cordovaOpts: this.cordovaOpts
    });

    return cordovaBuild.run();
  }
});
