const Command          = require('./-command');
const cordovaPath      = require('../targets/cordova/utils/get-path');
const Lint             = require('../tasks/lint-index');
const path             = require('path');

module.exports = Command.extend({
  name: 'lint-index',
  description: 'Lints index.html for attributes with paths relative to root.',

  availableOptions: [{
    name: 'source',
    type: String,
    default: 'www/index.html'
  }],

  run(options) {
    this._super.apply(this, arguments);

    let lint = new Lint({
      source: path.join(cordovaPath(this.project.root), options.source)
    });

    return lint.run();
  }
});
