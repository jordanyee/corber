const Command          = require('./-command');
const Bash             = require('../tasks/bash');
const cordovaPath      = require('../targets/cordova/utils/get-path');
const logger           = require('../utils/logger');
const Promise          = require('rsvp').Promise;

let ValidateCordova = require('../targets/cordova/validators/is-installed');

module.exports = Command.extend({
  name: 'proxy',
  description: 'Passes commands to Cordova CLI',

  supportedCommands: [
    'build',
    'platform',
    'platforms',
    'plugin',
    'plugins',
    'prepare'
  ],

  knownCordovaCommands: [
    'run',
    'emulate'
  ],

  validateAndRun(rawArgs) {
    let warning;

    if (this.supportedCommands.indexOf(rawArgs[0]) >= 0) {
      warning = rawArgs +
        ' run in cordova, but bypassed corber command.' +
        ' Consider running ember cdv:' + rawArgs + ' instead';

    } else if (this.knownCordovaCommands.indexOf(rawArgs[0]) === -1) {
      warning = rawArgs +
        ' passed to Cordova, but is an unknown Cordova command';

    }

    if (warning !== undefined) {
      logger.warn(warning);
    }

    return this.run({}, rawArgs);
  },

  run(options, rawArgs) {
    this._super.apply(this, arguments);

    let isInstalled = new ValidateCordova({
      project: this.project
    });

    return new Promise((resolve, reject) => {
      isInstalled.run().then(() => {
        let joinedArgs = rawArgs.join(' ');
        let cdvCommand = 'cordova ' + joinedArgs;

        let msg = 'Running \'cordova ' + joinedArgs + '\'';
        logger.success(msg);

        return new Bash({
          command: cdvCommand,
          options: {
            cwd: cordovaPath(this.project.root)
          }
        }).run();
      }).then(resolve).catch(function(e) {
        logger.error(e);
        reject(e);
      });
    });
  }
});
