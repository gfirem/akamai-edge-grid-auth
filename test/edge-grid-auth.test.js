// Copyright 2018 Akamai Technologies, Inc. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/* eslint-disable */
'use strict';

const {expect, assert} = require('chai');
const EdgeGridAuth = require('../src/edge-grid-auth');
const fs = require('fs');
const fileName = 'test.config';
const exec = require('child-process-promise').exec;
require('dotenv').config();
let fileContent = 'Lorem Ipsum Dolor';
let ini = require('ini');
let edgeGridAuth = new EdgeGridAuth();

describe('EdgeGridAuth', function() {
  after('Test for EdgeGridAuth', () => {
    exec('rm ' + fileName);
  });
  describe('Test for EdgeGridAuth RW config file', function() {
    it('create configuration file', function(done) {
      edgeGridAuth.createConfigFile(fileName)
        .then(() => {
          let fileExist = fs.existsSync(fileName);
          expect(fileExist, 'File ' + fileName + ' exist ' + fileExist).to.be.true;
          done();
        })
        .catch(done);
    });
    it('test create credentials Exception for no file name', function(done) {
      expect(function() {
        edgeGridAuth.createConfigFile()
      }).to.throw('Invalid File Name parameter');
      done();
    });
    it('write configuration file', function(done) {
      edgeGridAuth.writeConfigFile(fileName, fileContent)
        .then(() => {
          let fileExist = fs.existsSync(fileName);
          expect(fileExist, 'File ' + fileName + ' exist ' + fileExist).to.be.true;
          done();
        })
        .catch(done);
    });
    it('test write credentials Exception for no file name', function(done) {
      expect(function() {
        edgeGridAuth.writeConfigFile()
      }).to.throw('Invalid File Name parameter');
      done();
    });
    it('read configuration file', function(done) {
      edgeGridAuth.readConfigFile(fileName)
        .then((result) => {
          expect(result != undefined).to.be.true;
          done();
        })
        .catch(done);
    });
    it('test read credentials Exception for no file name', function(done) {
      expect(function() {
        edgeGridAuth.readConfigFile()
      }).to.throw('Invalid File Name parameter');
      done();
    });
  });

  describe('Test for EdgeGridAuth', function() {
    before('Test for EdgeGridAuth', () => {
      let config = [];
      config['default'] = {
        client_secret: process.env.client_secret,
        host: process.env.host,
        access_token: process.env.access_token,
        client_token: process.env.client_token,
      };
      fileContent = ini.stringify(config, {whitespace: true});
      edgeGridAuth.writeConfigFile(fileName, fileContent);
    });
    it('test verify credentials', function(done) {
      this.timeout(5000);
      edgeGridAuth.verify(fileName)
        .then((result) => {
          assert.isDefined(result.data);
          done();
        })
        .catch(done);
    });
    it('test verify credentials Exceptions', function(done) {
      expect(function() {
        edgeGridAuth.verify('')
      }).to.throw('Invalid File Name parameter');
      done();
    });
    it('test credentials', function(done) {
      this.timeout(5000);
      edgeGridAuth.verify(fileName)
        .then((result) => {
          expect(result.get('name')).to.equal('Kirsten World Tour');
          result.set('description', 'loremipsumdolor');
          expect(result.get('description')).to.equal('loremipsumdolor');
          done();
        })
        .catch(done);
    });
    it('test paste credentials', function(done) {
      const newOptions = {
        client_secret: 'loremipsumdolor',
        host: 'loremipsumdolor',
        access_token: 'loremipsumdolor',
        client_token: 'loremipsumdolor',
      };
      edgeGridAuth.paste(fileName, '', newOptions)
        .then((result) => {
          result = ini.parse(result.toString());
          expect(result['default'].client_secret).to.equal('loremipsumdolor');
          done();
        })
    });
    it('test paste credentials with overwrite', function(done) {
      const newOptions = {
        client_secret: 'loremipsumdolor',
        access_token: 'loremipsumdolor',
        client_token: 'loremipsumdolor',
      };
      edgeGridAuth.paste(fileName, 'default1', newOptions, true)
        .then((result) => {
          result = ini.parse(result.toString());
          expect(result['default1'].client_secret).to.equal('loremipsumdolor');
          expect(result['default']).to.be.undefined;

          done();
        })
    });
    it('test paste credentials to a new section', function(done) {
      const newOptions = {
        client_secret: 'loremipsumdolor',
        host: 'loremipsumdolor',
        access_token: 'loremipsumdolor',
        client_token: 'loremipsumdolor',
      };
      edgeGridAuth.paste(fileName, 'section2', newOptions)
        .then((result) => {
          result = ini.parse(result.toString());
          expect(result['section2'].client_secret).to.equal('loremipsumdolor');
          done();
        })
    });
    it('test paste credentials Exception for no file name', function(done) {
      expect(function() {
        edgeGridAuth.paste()
      }).to.throw('Invalid File Name parameter');
      done();
    });
    it('test paste credentials Exception for no options', function(done) {
      expect(function() {
        edgeGridAuth.paste(fileName)
      }).to.throw('Invalid set of new Options parameter');
      done();
    });
    it('test copy credentials', function(done) {
      edgeGridAuth.copy(fileName, 'section2', 'section1')
        .then((result) => {
          result = ini.parse(result.toString());
          expect(result['section1'].client_secret).to.equal('loremipsumdolor');
          done();
        })
    });
    it('test copy credentials Exception for no file name', function(done) {
      expect(function() {
        edgeGridAuth.copy()
      }).to.throw('Invalid File Name parameter');
      done();
    });
    it('test copy credentials Exception for form and to parameter', function(done) {
      expect(function() {
        edgeGridAuth.copy(fileName)
      }).to.throw('Invalid parameters from and to');
      done();
    });
    it('test setup credentials', function(done) {
      const newOptions = {
          client_secret: 'loremipsumdolor',
          host: 'loremipsumdolor',
          access_token: 'loremipsumdolor',
          client_token: 'loremipsumdolor',
        },
        config = {
          config: fileName,
          section: 'section2',
        };
      edgeGridAuth.setup(fileName, newOptions, config.section, ini.parse(fileContent))
        .then((result) => {
          result = ini.parse(result.toString());
          expect(result['section2'].client_secret).to.equal('loremipsumdolor');
          done();
        })
    });
    it('test setup credentials Exception for no file name', function(done) {
      expect(function() {
        edgeGridAuth.setup()
      }).to.throw('Invalid File Name parameter');
      done();
    });
    it('test setup credentials Exception for no options', function(done) {
      expect(function() {
        edgeGridAuth.setup(fileName)
      }).to.throw('Invalid new configuration in parameters');
      done();
    });
    it('test if file exist Exception', function(done) {
      expect(function() {
        edgeGridAuth.fileExist('sdf4334dsfsd')
      }).to.throw('The configuration file in sdf4334dsfsd not exist');
      done();
    });
  });
});


