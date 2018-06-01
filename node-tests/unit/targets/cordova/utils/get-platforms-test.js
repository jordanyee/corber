const td              = require('testdouble');
const expect          = require('../../../../helpers/expect');
const getCordovaPath  = require('../../../../../lib/targets/cordova/utils/get-path');

const path            = require('path');

const mockProject     = require('../../../../fixtures/corber-mock/project');

describe('Get Added Platforms Util', function() {
  context('when project has platforms.json, use it over package.json', function() {
    let subject;

    beforeEach(function() {
      let cordovaPath = getCordovaPath(mockProject.project.root);
      let platformsPath = path.join(cordovaPath, 'platforms/platforms.json');
      let packagePath = path.join(cordovaPath, 'package.json');

      td.replace(platformsPath, { 'ios': '4.3.1' });
      td.replace(packagePath, { 'cordova': { 'platforms': ['android'] } });

      let getAddedPlatforms = require('../../../../../lib/targets/cordova/utils/get-platforms');

      subject = getAddedPlatforms(mockProject.project);
    });

    afterEach(function() {
      td.reset();
    });

    it('returns its keys', function() {
      expect(subject).to.deep.equal(['ios']);
    });
  });

  context('fallback to package.json when project has no platforms.json', function() {
    let subject;

    beforeEach(function() {
      let cordovaPath = getCordovaPath(mockProject.project.root);
      let packagePath = path.join(cordovaPath, 'package.json');

      td.replace(packagePath, { 'cordova': { 'platforms': ['android'] } });

      // Context relies on mockProject not including a platform.json.
      let getAddedPlatforms = require('../../../../../lib/targets/cordova/utils/get-platforms');

      subject = getAddedPlatforms(mockProject.project);
    });

    afterEach(function() {
      td.reset();
    });

    it('returns an empty array', function() {
      expect(subject).to.deep.equal(['android']);
    });
  });

  context('when project has no platforms.json or package.json', function() {
    let subject;

    beforeEach(function() {
      // Context relies on mockProject not including a platform.json.
      let getAddedPlatforms = require('../../../../../lib/targets/cordova/utils/get-platforms');

      subject = getAddedPlatforms(mockProject.project);
    });

    it('returns an empty array', function() {
      expect(subject).to.be.empty;
    });
  });
});
