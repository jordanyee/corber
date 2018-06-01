const Task            = require('../../../tasks/-task');
const Promise         = require('rsvp').Promise;
const cordovaPath     = require('../utils/get-path');
const cordovaLib      = require('cordova-lib');
const cordovaProj     = cordovaLib.cordova;
const events          = cordovaLib.events;
const cordovaLogger   = require('cordova-common').CordovaLogger.get();
const logger          = require('../../../utils/logger');

module.exports = Task.extend({
  project: undefined,
  api: undefined,

  cordovaPromise(/* rawArgs */) {
    return cordovaProj[this.api].apply(null, arguments)
  },

  run() {
    let args = arguments;
    return new Promise((resolve, reject) => {
      let emberPath = process.cwd();
      let logLevel = logger.getLogLevel();
      let orgConsoleLog;
      process.chdir(cordovaPath(this.project.root));

      cordovaLogger.subscribe(events);
      // set cordova log level
      if (logLevel !== 'info') {
        // map default log level 'info' to cordova's default log level 'normal'
        cordovaLogger.setLevel(logLevel);
      }
      if (logLevel === 'error' && this.project.CORBER_PLATFORM === 'android') {
        // set gradle log level
        args['0'].options.argv.push('--gradleArg=--quiet');

        // cordova-lib does not use CordovaLogger for all log messages and
        // therefore ignores log level
        // overriding console.log as a dirty work-a-round until it has been
        // fixed upstream
        orgConsoleLog = console.log;
        console.log = function(message) {
          let messagesToBeFiltered = [
            /Subproject Path:/,
            /ANDROID_HOME=/,
            /JAVA_HOME=/,
          ];
          if (messagesToBeFiltered.some(function (filterRegExp) {
            return filterRegExp.test(message);
          })) {
            return;
          }
          orgConsoleLog(...arguments);
        };
      }

      //Much of cordova-lib has a hardcoded process.cwd()
      //This won't work for us
      return this.cordovaPromise.apply(this, args).then(function() {
        if (typeof orgConsoleLog === 'function') {
          console.log = orgConsoleLog;
        }
        process.chdir(emberPath);
        resolve();
      }).catch(function(err) {
        reject(err);
      });
    });
  }
});
