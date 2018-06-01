const Task             = require('../../../tasks/-task');
const fsUtils          = require('../../../utils/fs-utils');
const logger           = require('../../../utils/logger');
const camelize         = require('../../../utils/string.js').camelize;

const Promise          = require('rsvp');
const cordovaProj      = require('cordova-lib').cordova;

module.exports = Task.extend({
  id: undefined,
  name: undefined,
  templatePath: undefined,
  cordovaPath: undefined,

  run() {
    if (!fsUtils.existsSync(this.cordovaPath)) {
      let id = camelize(this.id);
      let name = camelize(this.name);

      let config = {
        lib: {
          www: { url: 'ember-cordova-template', template: true }
        }
      };

      if (this.templatePath !== undefined) {
        config.lib.www.url = this.templatePath;
      }

      return cordovaProj.create(this.cordovaPath, id, name, config);
    } else {
      logger.warn('Cordova dir already exists, please ensure it is valid');
      return Promise.resolve();
    }
  }
});
