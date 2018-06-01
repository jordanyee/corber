const getCordovaConfig = require('./get-config');
const getCordovaPath   = require('./get-path');
const fsUtils          = require('../../../utils/fs-utils');

const Promise          = require('rsvp').Promise;
const chalk            = require('chalk');
const path             = require('path');

const NOT_IN_CONFIGXML = 'Not found in config.xml. ';
const NOT_IN_FETCHJSON = 'Not found in fetch.json. ';
const NOT_IN_DIR       = 'Dir not found. ';
const NOT_IN_PLATFORMJSON = 'Not found in platform.json. ';

const nameIsMatch = function(node, name) {
  return node.$.name === name;
};

const isArray = function(v) {
  return Object.prototype.toString.call(v) === '[object Array]';
};

//type == platform || plugin
//name == 'ios', 'android', 'cordova-plugin-camera'
const hasByName = function(json, name, type) {
  if (json && json.widget) {
    let nodes = json.widget[type];

    if (!!nodes && isArray(nodes)) {
      for (let i = 0; i < nodes.length; i++) {
        if (nameIsMatch(nodes[i], name)) {
          return true;
        }
      }
    }
  }

  return false;
};

function CordovaValidator(opts) {
  this.project = opts.project;
  this.desiredKeyName = opts.desiredKeyName;
  this.platform = opts.platform;
  this.type = opts.type;
  this.dir = opts.dir;
  this.jsonPath = opts.jsonPath;
}

/* eslint-disable max-len */
CordovaValidator.prototype.makeError = function(error) {
  let message = chalk.red('* cordova ' + this.type + ' ' +  this.desiredKeyName + ' is missing or not installed: \n');
  message += chalk.grey('You probably need to run corber' + this.type + ' add ' + this.desiredKeyName + '. ');
  message += chalk.grey('cordova error: ' + error + '\n');
  return message;
};
/* eslint-enable max-len */

CordovaValidator.prototype.validateCordovaConfig = function() {
  let validator = this;

  return getCordovaConfig(validator.project)
    .then(function(cordovaConfig) {
      if (!hasByName(cordovaConfig, validator.desiredKeyName, validator.type)) {
        return Promise.reject(validator.makeError(NOT_IN_CONFIGXML));
      } else {
        return Promise.resolve();
      }
    });
};

CordovaValidator.prototype.validateCordovaJSON = function() {
  let validator = this;
  let cordovaPath = getCordovaPath(validator.project.root);
  let fetchPath = path.join(cordovaPath, validator.jsonPath);

  try {
    let fetchJSON = require(fetchPath);
    let items = Object.keys(fetchJSON);

    if (items.indexOf(validator.desiredKeyName) < 0) {
      return Promise.reject(validator.makeError(NOT_IN_FETCHJSON));
    }

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(validator.makeError(NOT_IN_FETCHJSON));
  }
};

//Is only run for plugins, there is no equivalent for platform
CordovaValidator.prototype.validatePluginJSON = function() {
  let validator = this;
  let cordovaPath = getCordovaPath(validator.project.root);
  let platformPath = path.join(
    cordovaPath,
    'plugins/' + validator.platform + '.json'
  );

  try {
    let platformJSON = require(platformPath);
    let plugins = Object.keys(platformJSON.installed_plugins);

    if (plugins.indexOf(validator.desiredKeyName) < 0) {
      return Promise.reject(validator.makeError(NOT_IN_PLATFORMJSON));
    }

    return Promise.resolve();
  } catch (e) {
    return Promise.reject(validator.makeError(NOT_IN_PLATFORMJSON));
  }
};

CordovaValidator.prototype.validateDirExists = function() {
  let validator = this;
  let cordovaPath = getCordovaPath(validator.project.root);
  let filePath = path.join(
    cordovaPath,
    validator.dir,
    validator.desiredKeyName
  );

  if (fsUtils.existsSync(filePath)) {
    return Promise.resolve();
  } else {
    return Promise.reject(validator.makeError(NOT_IN_DIR));
  }
};

module.exports = CordovaValidator;
