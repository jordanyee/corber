'use strict';

var td              = require('testdouble');
var expect          = require('../../helpers/expect');
var Promise         = require('rsvp');
var path            = require('path');

var CdvBuildTask    = require('../../../lib/targets/cordova/tasks/build');
var BashTask        = require('../../../lib/tasks/bash');
var HookTask        = require('../../../lib/tasks/run-hook');
var LRloadShellTask = require('../../../lib/tasks/create-livereload-shell');
var editXml         = require('../../../lib/targets/cordova/utils/edit-xml');
var parseXml        = require('../../../lib/utils/parse-xml');
var cordovaPath     = require('../../../lib/targets/cordova/utils/get-path');

var mockProject     = require('../../fixtures/corber-mock/project');
var mockAnalytics   = require('../../fixtures/corber-mock/analytics');

var ValidatePlugin          = require('../../../lib/targets/cordova/validators/plugin');
var ValidateAllowNavigation = require('../../../lib/targets/cordova/validators/allow-navigation');

describe('Serve Command', function() {
  var serveCmd;
  var tasks = [];

  afterEach(function() {
    editXml.removeNavigation(mockProject.project);
    td.reset();
  });

  beforeEach(function() {
    mockTasks();

    var ServeCmd = require('../../../lib/commands/serve');
    td.replace(ServeCmd, '_serveHang', function() {
      return Promise.resolve();
    });

    serveCmd = new ServeCmd({
      project: mockProject.project
    });

    serveCmd.analytics = mockAnalytics;
    serveCmd.project.config = function() {
      return {
        locationType: 'hash',

      };
    };
  });

  function mockTasks() {
    tasks = [];

    td.replace('../../../lib/utils/require-framework', function() {
      return {
        validateServe: function() {
          tasks.push('framework-validate-serve');
          return Promise.resolve();
        },

        serve: function() {
          tasks.push('framework-serve');
          return Promise.resolve();
        }
      };
    });

    td.replace(HookTask.prototype, 'run', function(hookName, options) {
      expect(options, `${hookName} options`).to.be.an('object');
      tasks.push('hook ' + hookName);
      return Promise.resolve();
    });

    td.replace(ValidatePlugin.prototype, 'run', function() {
      tasks.push('validate-plugin');
      return Promise.resolve();
    });

    td.replace(ValidateAllowNavigation.prototype, 'run', function() {
      tasks.push('validate-allow-navigation');
      return Promise.resolve();
    });


    td.replace(LRloadShellTask.prototype, 'run', function() {
      tasks.push('create-livereload-shell');
      return Promise.resolve();
    });

    td.replace(CdvBuildTask.prototype, 'run', function() {
      tasks.push('cordova-build');
      return Promise.resolve();
    });

    td.replace(BashTask.prototype, 'run', function() {
      tasks.push('serve-bash');
      return Promise.resolve();
    });
  }

  it('exits cleanly', function() {
    return expect(function() {
      serveCmd.run({});
    }).not.to.throw(Error);
  });

  it('sets vars for webpack livereload', function() {
    return serveCmd.run({platform: 'ios'}).then(function() {
      let project = mockProject.project;
      expect(project.targetIsCordova).to.equal(true);
      expect(project.targetIsCordovaLivereload).to.equal(true);
      expect(project.CORBER_PLATFORM).to.equal('ios');
    });
  });

  it('runs tasks in the correct order', function() {
    return serveCmd.run({}).then(function() {
      expect(tasks).to.deep.equal([
        'hook beforeBuild',
        'validate-allow-navigation',
        'validate-plugin',
        'framework-validate-serve',
        'create-livereload-shell',
        'cordova-build',
        'hook afterBuild',
        'framework-serve'
      ]);
    });
  });

  it('add reloadUrl to the xml file', function() {
    return serveCmd.run({
      reloadUrl: 'test-url'
    }).then(function() {
      var cdvPath = cordovaPath(mockProject.project.root);
      var configPath = path.join(cdvPath, 'config.xml');
      var xml = parseXml(configPath);
      var node = xml._result.widget['allow-navigation'].pop().$.href;

      expect(node).to.equal('test-url');
    });
  });

  it('skips emer & cordova builds with --skip flags', function() {
    return serveCmd.run({
      skipFrameworkBuild: true,
      skipCordovaBuild: true
    }).then(function() {
      expect(tasks).to.deep.equal([
        'hook beforeBuild',
        'validate-allow-navigation',
        'validate-plugin',
        'framework-validate-serve',
        'create-livereload-shell',
        'hook afterBuild'
      ]);
    });
  });
});
