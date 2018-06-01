const CoreObject       = require('core-object');

const bootEm           = require('./tasks/boot-emulator');
const installAppEm     = require('./tasks/install-app-emulator');
const installAppDevice = require('./tasks/install-app-device');
const launchApp        = require('./tasks/launch-app');
const getApkPath       = require('./utils/apk-path');

const CordovaTarget    = require('../cordova/target');
const cdvConfig        = require('../cordova/utils/get-config');
const cdvPath          = require('../cordova/utils/get-path');

module.exports = CoreObject.extend({
  device: undefined,
  packageName: undefined,
  project: undefined,
  isDebug: true,

  init() {
    this._super(...arguments);
    return cdvConfig(this.project).then((config) => {
      this.packageName = config.widget.$.id;
    });
  },

  build() {
    let cdvTarget = new CordovaTarget({
      platform: 'android',
      project: this.project
    });

    return cdvTarget.build();
  },

  run() {
    let device = this.device;
    let projectRoot = cdvPath(this.project.root);

    return getApkPath(projectRoot, this.isDebug).then(apkPath => {
      if (device.deviceType === 'emulator') {
        return bootEm(device)
          .then(() => installAppEm(apkPath, device))
          .then(() => launchApp(this.packageName));
      } else {
        return installAppDevice(device.uuid, apkPath)
          .then(() => launchApp(this.packageName));
      }
    });
  }
});
