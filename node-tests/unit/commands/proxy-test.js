const BashTask        = require('../../../lib/tasks/bash');
const VerifyInstall   = require('../../../lib/targets/cordova/validators/is-installed');
const CordovaCmd      = require('../../../lib/commands/proxy');
const logger          = require('../../../lib/utils/logger');

const td              = require('testdouble');
const Promise         = require('rsvp');

const mockProject     = require('../../fixtures/corber-mock/project');
const mockAnalytics   = require('../../fixtures/corber-mock/analytics');
const isObject        = td.matchers.isA(Object);
const contains        = td.matchers.contains;

describe('Cordova Command', function() {
  let setupCmd = function() {
    td.replace(VerifyInstall.prototype, 'run', function() {
      return Promise.resolve();
    });

    let cmd = new CordovaCmd({
      project: mockProject.project
    });
    cmd.analytics = mockAnalytics;

    return cmd;
  };

  afterEach(function() {
    td.reset();
  });

  it('warns if an corber command is used', function() {
    let logDouble = td.replace(logger, 'warn');
    let cmd = setupCmd();

    td.replace(cmd, 'run', function() {
      return Promise.resolve();
    });

    return cmd.validateAndRun(['build']).then(function() {
      td.verify(logDouble(contains('bypassed corber command')));
    });
  });

  it('warns if cordova command is unknown', function() {
    let logDouble = td.replace(logger, 'warn');
    let cmd = setupCmd();

    td.replace(cmd, 'run', function() {
      return Promise.resolve();
    });

    return cmd.validateAndRun(['foo']).then(function() {
      td.verify(logDouble(contains('unknown Cordova command')));
    });
  });

  it('proxies argument commands', function(done) {
    let bashDouble = td.replace(BashTask.prototype, 'runCommand');
    let cmd = setupCmd();

    cmd.validateAndRun(['plugin add foo']).then(function() {
      td.verify(bashDouble('cordova plugin add foo', isObject));
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});
