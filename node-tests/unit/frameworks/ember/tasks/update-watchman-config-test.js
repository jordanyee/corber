const WatchmanConfig = require('../../../../../lib/frameworks/ember/tasks/update-watchman-config');

const path           = require('path');
const td             = require('testdouble');
const Promise        = require('rsvp').Promise;

const expect         = require('../../../../helpers/expect');
const mockProject    = require('../../../../fixtures/corber-mock/project');
const fsUtils        = require('../../../../../lib/utils/fs-utils');

describe('Update Watchman Config Task', function() {
  let watchmanTask;

  beforeEach(function() {
    watchmanTask = new WatchmanConfig({
      projectRoot: mockProject.project.root
    });
  });

  afterEach(function() {
    td.reset();
  });

  it('reads .watchmanconfig', function() {
    let expectedPath = path.join(mockProject.project.root, '.watchmanconfig');
    let actualPath;

    td.replace(fsUtils, 'write');
    td.replace(fsUtils, 'read', function(path) {
      actualPath = path;
      return Promise.resolve();
    });

    watchmanTask.run();

    expect(actualPath).to.equal(expectedPath);
  });

  it('adds corber to existing ignore_dirs array', function() {
    let writeContents;
    let expectedWrite = '{"ignore_dirs":["tmp","dist","corber"]}';

    td.replace(fsUtils, 'read', function(path) {
      return Promise.resolve('\{"ignore_dirs": ["tmp", "dist"]\}');
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
    let writeContents;

    td.replace(fsUtils, 'read', function(path) {
      return Promise.resolve('\{\}');
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
    let writeContents;
    let expectedWrite = '{"ignore_dirs":["tmp","dist","corber"]}';

    td.replace(fsUtils, 'read', function(path) {
      return Promise.resolve('\{"ignore_dirs": ["tmp", "dist", "corber"]\}');
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
