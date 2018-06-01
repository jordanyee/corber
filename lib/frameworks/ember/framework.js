/* eslint-disable max-len */
const Framework        = require('../framework');
const Build            = require('./tasks/build');
const Serve            = require('./tasks/serve');
const RSVP             = require('rsvp');
const runValidators    = require('../../utils/run-validators');
const PortFinder       = require('portfinder');
const getPort          = RSVP.denodeify(PortFinder.getPort);
const _merge           = require('lodash').merge;

const UpdateWatchmanIgnore     = require('./tasks/update-watchman-config');
const ValidateLocationType     = require('./validators/location-type');
const ValidateRootUrl          = require('../../validators/root-url');
/* eslint-enable max-len */

module.exports = Framework.extend({
  name: 'ember',
  buildPath: '/dist',
  port: 4200,
  root: undefined,

  //TODO - glimmer should also be a framework
  isGlimmer: false,

  _buildValidators(options) {
    let validations = [];
    let projectConfig = this.project.config(options.environment);

    if (this.isGlimmer === true) { return validations; }

    validations.push(
      new ValidateRootUrl({
        config: projectConfig,
        rootProps: ['baseURL', 'rootURL', 'baseUrl', 'rootUrl'],
        path: 'config/environment.js',
        force: options.force
      }).run()
    );

    validations.push(
      new ValidateLocationType({
        config: projectConfig,
        force: options.force
      }).run()
    );

    return validations;
  },

  validateBuild(options) {
    let validations = this._buildValidators(options);
    return runValidators(validations);
  },

  build(options) {
    let emberBuild = new Build({
      project: this.project,
      environment: options.environment,
      outputPath: options.cordovaOutputPath
    });

    return emberBuild.run();
  },

  validateServe(options) {
    let validations = this._buildValidators(options);
    return runValidators(validations);
  },

  serve(options, ui) {
    let serve = new Serve({
      project: this.project,
      ui: ui
    });

    if (options.port === undefined) { options.port = this.port; }

    return this._autoFindLiveReloadPort(options).then((serveOpts) => {
      let config = this.project.config(serveOpts.environment);

      _merge(serveOpts, {
        baseURL: config.baseURL || '/',
        rootURL: config.rootURL || '/',
        project: this.project
      });

      return serve.run(serveOpts);
    });
  },

  afterInstall() {
    let updateWatchmanIgnore = new UpdateWatchmanIgnore({
      projectRoot: this.project.root,
    });

    return updateWatchmanIgnore.run();
  },

  //Taken from from ember-cli
  //https://github.com/ember-cli/ember-cli/blob/master/lib/commands/serve.js#L97-L117
  _autoFindLiveReloadPort(commandOptions) {
    return getPort({
      port: commandOptions.liveReloadPort,
      host: commandOptions.liveReloadHost
    }).then((foundPort) => {
      // if live reload port matches express port, try one higher
      if (foundPort === commandOptions.port) {
        commandOptions.liveReloadPort = foundPort + 1;
        return this._autoFindLiveReloadPort(commandOptions);
      }

      // port was already open
      if (foundPort === commandOptions.liveReloadPort) {
        return commandOptions;
      }

      // use found port as live reload port
      commandOptions.liveReloadPort = foundPort;

      return commandOptions;
    });
  }
});
