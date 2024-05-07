/*global describe, beforeEach, it*/
'use strict';

var assert = require('yeoman-assert');
var createAppGenerator = require('../helpers/create-generator')
  .createAppGenerator;
var createSubGenerator = require('../helpers/create-generator')
  .createSubGenerator;
describe('Static Site page sub-generator', function() {
  describe('Create page files when using Static Pug', function() {
    beforeEach(function() {
      return createAppGenerator().withPrompts({
        existingConfig: true,
        testFramework: 'jasmine',
        jsOption: 'browserify',
        cssOption: 'sass'
      });
    });
    describe('Using Browserify', function() {
      it('Using Jasmine', function() {
        // Filename
        var pageName = 'mypage';

        var filesToTest = ['src/' + pageName + '/' + 'index.pug'];
        var fileContentToTest = [
          ['src/' + pageName + '/' + 'index.pug', /extends/i]
        ];

        return createSubGenerator('page')
          .withArguments([pageName])
          .then(function() {
            assert.file(filesToTest);
            assert.fileContent(fileContentToTest);
          });
      });
      it('With custom layout', function() {
        // Filename
        var pageName = 'mypage';

        var filesToTest = ['src/' + pageName + '/' + 'index.pug'];
        var fileContentToTest = [
          ['src/' + pageName + '/' + 'index.pug', /extends/i],
          ['src/' + pageName + '/' + 'index.pug', /mypage/i]
        ];

        return createSubGenerator('page', { layout: pageName })
          .withArguments([pageName])
          .then(function() {
            assert.file(filesToTest);
            assert.fileContent(fileContentToTest);
          });
      });
    });
  });
});
