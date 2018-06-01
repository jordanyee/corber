/* eslint-disable camelcase */
const Task             = require('../../../tasks/-task');
const Promise          = require('rsvp').Promise;

const path             = require('path');
const fsUtils          = require('../../../utils/fs-utils');
const logger           = require('../../../utils/logger');
const includes         = require('lodash').includes;

module.exports = Task.extend({
  projectRoot: undefined,

  run() {
    logger.info('corber: updating .watchmanconfig');

    let configPath = path.join(this.projectRoot, '.watchmanconfig')
    return fsUtils.read(configPath, { encoding: 'utf8' })
      .then(function(config) {
        let json = JSON.parse(config);
        let ignored;

        if (json.ignore_dirs) {
          ignored = json.ignore_dirs;
          if (includes(ignored, 'corber') === false) {
            ignored.push('corber');
          }
        } else {
          ignored = ['corber'];
        }

        json.ignore_dirs = ignored;

        let contents = JSON.stringify(json);

        return fsUtils.write(configPath, contents, 'utf8')
          .then(function() {
            logger.success('Added corber to watchman ignore');
          });
      }, function(err) {
        return Promise.reject(
          'corber: failed to update .watchmanconfig, err: ' + err
        );
      });
  }
});
/* eslint-enable camelcase */
