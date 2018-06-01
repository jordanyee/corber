var cordovaPath     = require('../../../../../lib/targets/cordova/utils/get-path');
var editXml         = require('../../../../../lib/targets/cordova/utils/edit-xml');
var expect          = require('../../../../helpers/expect');
var mockProject     = require('../../../../fixtures/corber-mock/project');
var parseXml        = require('../../../../../lib/utils/parse-xml');
var path            = require('path');

describe('Edit XML Util', function() {
  var host = 'http://localhost:8080';

  beforeEach(function() {
    editXml.addNavigation(mockProject.project, host);
  });

  describe('addNavigation function', function() {
    it('add node to the xml file in addition to client nodes', function() {
      var cdvPath = cordovaPath(mockProject.project.root);
      var configPath = path.join(cdvPath, 'config.xml');
      var xml = parseXml(configPath);
      var nodes = xml._result.widget['allow-navigation'].length;

      expect(nodes).to.equal(3);
    });
  });

  describe('removeNavigation function', function() {
    beforeEach(function() {
      editXml.removeNavigation(mockProject.project);
    });

    describe('if nodes placed by util exist', function() {
      it('removes util placed nodes and keep client nodes', function() {
        var cdvPath = cordovaPath(mockProject.project.root);
        var configPath = path.join(cdvPath, 'config.xml');
        var xml = parseXml(configPath);
        var nodes = xml._result.widget['allow-navigation'].length;

        expect(nodes).to.equal(2);
      });
    });
  });
});
