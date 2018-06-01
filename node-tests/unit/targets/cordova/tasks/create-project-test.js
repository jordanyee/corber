const td              = require('testdouble');

const fsUtils         = require('../../../../../lib/utils/fs-utils');
const logger          = require('../../../../../lib/utils/logger');

const cordovaProj     = require('cordova-lib').cordova;
const mockProject     = require('../../../../fixtures/corber-mock/project');
const cordovaPath     = require('../../../../../lib/targets/cordova/utils/get-path');
const camelize        = require('../../../../../lib/utils/string').camelize;
const isObject        = td.matchers.isA(Object);
const isString        = td.matchers.isA(String);
const contains        = td.matchers.contains;

describe('Cordova Create Project Task', function() {
  let create, rawDouble;

  let setupCreateTask = function() {
    //TODO - factor me out
    rawDouble = td.replace(cordovaProj, 'create');

    let CreateCdvTask = require('../../../../../lib/targets/cordova/tasks/create-project');

    create = new CreateCdvTask({
      id: 'io.corber.' + camelize(mockProject.name),
      name: mockProject.name,
      cordovaPath: cordovaPath(mockProject.project.root, false),
      ui: mockProject.ui
    });
  };

  beforeEach(function() {
    td.replace(fsUtils, 'existsSync', function() {
      return false;
    });
  });

  afterEach(function() {
    td.reset();
  });


  it('calls cordova.create.raw', function() {
    setupCreateTask();
    create.run();
    td.verify(rawDouble(isString, isString, isString, isObject));
  });

  it('forces camelcased ids and names', function() {
    setupCreateTask();
    create.id = 'corber-app';
    create.name = 'corber-app';

    create.run();

    td.verify(rawDouble(isString, 'corberApp', 'corberApp', isObject));
  });

  it('raises a warning if cordova project already exists', function() {
    // We can't replace existsSync again here without resetting the previous
    // replacement from beforeEach. Doing so will store the beforeEach
    // version as the "real" function and leak into other tests.
    td.reset();
    td.replace(fsUtils, 'existsSync', function() {
      return true;
    });
    let logDouble = td.replace(logger, 'warn');

    setupCreateTask();
    return create.run().then(function() {
      td.verify(logDouble(contains('dir already exists')));
    });
  });

  it('defaults to the ember-cordova-template template', function() {
    setupCreateTask();
    create.run();

    let matcher = td.matchers.contains({
      lib: {
        www: {
          url: 'ember-cordova-template'
        }
      }
    });

    td.verify(rawDouble(isString, isString, isString, matcher));
  });

  it('builds with a template when provided', function() {
    setupCreateTask();
    create.templatePath = 'templatePath';
    create.run();

    let matcher = td.matchers.contains({lib: { www: { url: 'templatePath'}}});
    td.verify(rawDouble(isString, isString, isString, matcher));
  });
});
