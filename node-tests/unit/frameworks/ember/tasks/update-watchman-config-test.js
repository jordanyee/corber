var td              = require('testdouble');
var expect          = require('../../../../helpers/expect');
var path            = require('path');
var mockProject     = require('../../../../fixtures/corber-mock/project');
var Promise         = require('rsvp').Promise;

var WatchmanConfig  = require('../../../../../lib/frameworks/ember/tasks/update-watchman-config');
var fsUtils         = require('../../../../../lib/utils/fs-utils');

describe('Update Watchman Config Task', function() {
  var watchmanTask;

  beforeEach(function() {
    watchmanTask = new WatchmanConfig({
      projectRoot: mockProject.project.root
    });
  });

  afterEach(function() {
    td.reset();
  });

  it('attempts to read watchmanconfig', function() {
    var actualPath;
    var expectedPath = path.join(mockProject.project.root, '.watchmanconfig');

    td.replace(fsUtils, 'write');
    td.replace(fsUtils, 'read', function(path) {
      actualPath = path;
      return Promise.resolve();
    });

    watchmanTask.run();

    expect(actualPath).to.equal(expectedPath);
  });

  it('adds corber to existing ignore_dirs array', function() {
    var writeContents;
    var expectedWrite = '{"ignore_dirs":["tmp","dist","corber"]}';

    td.replace(fsUtils, 'read', function(path) {
      return new Promise(function(resolve) {
        resolve('\{"ignore_dirs": ["tmp", "dist"]\}');
      });
    });

    td.replace(fsUtils, 'write', function(path, contents) {
      writeContents = contents;
      return Promise.resolve();
    });

    return watchmanTask.run().then(function() {
      expect(writeContents).to.equal(expectedWrite);
    });
  });

  it('creates an ignore_dirs array if it does not exist', function() {
    var writeContents;

    td.replace(fsUtils, 'read', function(path) {
      return new Promise(function(resolve) {
        resolve('\{\}');
      });
    });

    td.replace(fsUtils, 'write', function(path, contents) {
      writeContents = contents;
      return Promise.resolve();
    });

    return watchmanTask.run().then(function() {
      expect(writeContents).to.equal('{"ignore_dirs":["corber"]}');
    });
  });

  it('does not duplicate content', function() {
    var writeContents;
    var expectedWrite = '{"ignore_dirs":["tmp","dist","corber"]}';

    td.replace(fsUtils, 'read', function(path) {
      return new Promise(function(resolve) {
        resolve('\{"ignore_dirs": ["tmp", "dist", "corber"]\}');
      });
    });

    td.replace(fsUtils, 'write', function(path, contents) {
      writeContents = contents;
      return Promise.resolve();
    });

    return watchmanTask.run().then(function() {
      expect(writeContents).to.equal(expectedWrite);
    });
  });
});
