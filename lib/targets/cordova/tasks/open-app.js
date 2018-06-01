const Task             = require('../../../tasks/-task');
const Bash             = require('../../../tasks/bash');
const Promise          = require('rsvp').Promise;
const logger           = require('../../../utils/logger');

const path             = require('path');
const getOpenCommand   = require('../../../utils/open-app-command');
const cordovaPath      = require('../utils/get-path');
const getConfig        = require('../utils/get-config');
const fsUtils          = require('../../../utils/fs-utils');

module.exports = Task.extend({
  application: undefined,
  platform: undefined,
  project: undefined,

  getProjectPath(platform, project) {
    let cdvPath = cordovaPath(project.root);

    if (platform === 'ios') {
      return getConfig(project).then((config) => {
        let appName = config.widget.name[0];

        let workspacePath = path.join(
          cdvPath,
          `platforms/ios/${appName}.xcworkspace`
        );
        if (fsUtils.existsSync(workspacePath)) {
          return Promise.resolve(workspacePath);
        } else {
          return Promise.resolve(path.join(
            cdvPath,
            `platforms/ios/${appName}.xcodeproj`
          ));
        }
      });
    } else {
      return Promise.reject(`Open is not supported for ${platform}`);
    }
  },

  run() {
    let open, command;

    return this.getProjectPath(this.platform, this.project)
      .then((projectPath) => {
        logger.success('Opening app for ' + this.platform);
        command = getOpenCommand(projectPath, this.application);
        open = new Bash({
          command: command,
          options: {
            cwd: this.project.root
          }
        });
        return open.run();
      });
  }
});
