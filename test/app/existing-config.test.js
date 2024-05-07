/*global describe, beforeEach, it*/
'use strict';

var assert = require('yeoman-assert');
var createAppGenerator = require('../helpers/create-generator')
  .createAppGenerator;

describe('Yeogurt generator using existing configuration', function() {
  it('Creates expected files with expected content (Pug)', function() {
    var expected = ['.yo-rc.json'];

    return createAppGenerator()
      .withPrompts({ existingConfig: true })
      .then(function() {
        assert.file(expected);
      });
  });
});
