const Command          = require('./-command');
const splashTask       = require('splicon/dist/splash-task');
const getPlatforms     = require('../targets/cordova/utils/get-platforms');
const logger           = require('../utils/logger');

const includes         = require('lodash').includes;
const pull             = require('lodash').pull;

module.exports = Command.extend({
  name: 'make-splashes',
  aliases: [ 'splashes' ],
  description: 'Generates cordova splash files and updates config',
  works: 'insideProject',

  availableOptions: [{
    name: 'source',
    type: String,
    default: 'ember-cordova/splash.svg'
  }, {
    name: 'platform',
    type: Array,
    values: [
      'added',
      'ios',
      'android'
    ],
    default: ['added']
  }],

  run(options) {
    this._super.apply(this, arguments);

    if (includes(options.platform, 'added')) {
      let addedPlatforms = getPlatforms(this.project);

      if (addedPlatforms.length === 0) {
        /* eslint-disable max-len */
        throw new Error('ember-cordova: No added platforms to generate icons for');
        /* eslint-enable max-len */
      }

      options.platform = options.platform.concat(addedPlatforms);

      pull(options.platform, 'added');
    }

    /* eslint-disable max-len */
    logger.info('ember-cordova: Generating splashes for ' + options.platform.join(', '));
    /* eslint-enable max-len */

    return splashTask({
      source: options.source,
      platforms: options.platform,
      projectPath: 'ember-cordova/cordova'
    }).then(function() {
      logger.success('ember-cordova: splashes generated');
    }).catch(function(err) {
      logger.error(err);
    });
  }
});