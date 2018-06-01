const RawTask         = require('../../../../../lib/targets/cordova/tasks/raw');
const td              = require('testdouble');
const expect          = require('../../../../helpers/expect');
const cordovaPath     = require('../../../../../lib/targets/cordova/utils/get-path');
const mockProject     = require('../../../../fixtures/corber-mock/project');
const Promise         = require('rsvp');
const cordovaLib      = require('cordova-lib');
const cordovaProj     = cordovaLib.cordova;
const events          = cordovaLib.events;
const cordovaLogger   = require('cordova-common').CordovaLogger.get();
const logger          = require('../../../../../lib/utils/logger');

describe('Cordova Raw Task', function() {
  let setupTask = function() {
    return new RawTask({
      api: 'platform',
      project: mockProject.project
    });
  };

  afterEach(function() {
    td.reset();
  });

  it('attempts to run a raw cordova call', function(done) {
    td.replace(cordovaProj, 'platform', function() {
      done();
    });

    let raw = setupTask();
    return raw.run();
  });

  describe('with a mock function', function() {
    let chdirDouble;

    beforeEach(function() {
      chdirDouble = td.replace(process, 'chdir');

      td.replace(RawTask.prototype, 'cordovaPromise', function() {
        return Promise.resolve();
      });
    });

    it('changes to cordova dir', function() {
      let cdvPath = cordovaPath(mockProject.project.root);
      let raw = setupTask();

      return raw.run().then(function() {
        td.verify(chdirDouble(cdvPath));
      });
    });

    it('inits a callback which resolves', function() {
      let raw = setupTask();

      return expect(raw.run()).to.eventually.be.fulfilled;
    });

    it('changes back to ember dir on compvarion', function() {
      let emberPath = process.cwd();
      let raw = setupTask();

      return expect(
        raw.run().then(function() {
          let args = td.explain(chdirDouble).calls[1].args[0];
          return args
        })
      ).to.eventually.equal(emberPath);
    });

    it('sets up Cordova logging', function() {
      td.replace(cordovaLogger, 'subscribe');
      let raw = setupTask();

      return raw.run().then(function() {
        td.verify(cordovaLogger.subscribe(events));
      });
    });

    it('passes log level to cordova logger', function() {
      td.replace(cordovaLogger, 'setLevel');
      td.when(td.replace(logger, 'getLogLevel')()).thenReturn('verbose');
      let raw = setupTask();

      return raw.run().then(function() {
        td.verify(cordovaLogger.setLevel('verbose'));
      });
    });
  });

  describe('when the raw task fails', function() {
    beforeEach(function() {
      td.replace(RawTask.prototype, 'cordovaPromise', function() {
        return Promise.reject(new Error('fail'));
      });
    });

    it('rejects run() with the failure', function() {
      let raw = setupTask();

      return expect(raw.run()).to.eventually.be.rejectedWith(/fail/);
    });
  });
});
