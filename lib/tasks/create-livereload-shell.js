const Task             = require('./-task');
const Promise          = require('rsvp').Promise;

const cordovaPath      = require('../targets/cordova/utils/get-path');
const fsUtils          = require('../utils/fs-utils');

const path             = require('path');

module.exports = Task.extend({
  project: undefined,

  //Read in the shell index.html file
  getShellTemplate() {
    let shellPath = path.join(
      __dirname,
      '../templates/livereload-shell/index.html'
    );

    return fsUtils.read(shellPath, { encoding: 'utf8' });
  },

  createShell(outputPath, template, reloadUrl) {
    let regExp = new RegExp('{{liveReloadUrl}}', 'gi');
    template = template.replace(regExp, reloadUrl);
    return fsUtils.write(outputPath, template, 'utf8');
  },

  run(reloadUrl) {
    let project = this.project;

    return this.getShellTemplate()
      .then((html) => {
        let outputPath = path.join(cordovaPath(project.root), 'www/index.html');

        return this.createShell(outputPath, html, reloadUrl);
      })
      .catch(function(err) {
        return Promise.reject('Error moving index.html for livereload ' + err);
      });
  }
});
