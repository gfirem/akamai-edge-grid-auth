/* eslint-disable */
'use strict';
const expect = require('chai').expect;
const Utils = require('../src/utils/utils');
const fs = require('fs');
const fileName = 'test.config';
const fileContent = 'Lorem Ipsum Dolor';
const exec = require('child-process-promise').exec;

describe('test utils helpers', function() {
  after(() => {
    exec('rm ' + fileName);
  });
  it('sleep for n secons', function(done) {
    const begin = Date.now();
    Utils.sleep(1000)
      .then(() => {
        const end = Date.now();
        const timeSpent = ((end - begin) / 1000).toPrecision(1);
        expect(timeSpent).to.equal('1');
        done();
      });
  });
  it('create configuration file', function(done) {
    Utils.createConfigFile(fileName)
      .then(() => {
        let fileExist = fs.existsSync(fileName);
        expect(fileExist, 'File ' + fileName + ' exist ' + fileExist).to.be.true;
        done();
      })
      .catch(done);
  });
  it('write configuration file', function(done) {
    Utils.writeConfigFile(fileName, fileContent)
      .then(() => {
        let fileExist = fs.existsSync(fileName);
        expect(fileExist, 'File ' + fileName + ' exist ' + fileExist).to.be.true;
        done();
      })
      .catch(done);
  });
  it('read configuration file', function(done) {
    Utils.readConfigFile(fileName)
      .then((result) => {
        expect(result != undefined).to.be.true;
        done();
      })
      .catch(done);
  });

});
