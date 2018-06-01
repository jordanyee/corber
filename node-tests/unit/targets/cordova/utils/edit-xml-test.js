const cordovaPath     = require('../../../../../lib/targets/cordova/utils/get-path');
const editXml         = require('../../../../../lib/targets/cordova/utils/edit-xml');
const expect          = require('../../../../helpers/expect');
const mockProject     = require('../../../../fixtures/corber-mock/project');
const parseXml        = require('../../../../../lib/utils/parse-xml');
const path            = require('path');

describe('Edit XML Util', function() {
  let host = 'http://localhost:8080';

  beforeEach(function() {
    editXml.addNavigation(mockProject.project, host);
  });

  describe('addNavigation function', function() {
    it('adds node to the xml file in addition to client nodes', function() {
      let cdvPath = cordovaPath(mockProject.project.root);
      let configPath = path.join(cdvPath, 'config.xml');
      let xml = parseXml(configPath);
      let nodes = xml._result.widget['allow-navigation'].length;

      expect(nodes).to.equal(3);
    });
  });

  describe('removeNavigation function', function() {
    beforeEach(function() {
      editXml.removeNavigation(mockProject.project);
    });

    describe('if nodes placed by util exist', function() {
      it('removes util placed nodes and keep client nodes', function() {
        let cdvPath = cordovaPath(mockProject.project.root);
        let configPath = path.join(cdvPath, 'config.xml');
        let xml = parseXml(configPath);
        let nodes = xml._result.widget['allow-navigation'].length;

        expect(nodes).to.equal(2);
      });
    });
  });
});
