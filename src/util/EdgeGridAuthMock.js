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
'use strict';

const EdgeGridAuth = require('../edge-grid-auth');
const Credential = require('../model/credential');

/**
 * EdgeGrid Authentication
 */
class EdgeGridAuthMock extends EdgeGridAuth {
  verify(fileName, section, debug, fileContentCallback) {
    if (!fileName) {
      throw new Error('Invalid File Name parameter');
    }
    this.fileExist(fileName);
    return new Promise((resolve, reject) => {
      try {
        const configFromFile = fileContentCallback();
        this.setConfigFromStrings(configFromFile.client_token, configFromFile.client_secret, configFromFile.access_token, configFromFile.host);
        let credentialResponse = new Credential(JSON.stringify(configFromFile));
        credentialResponse.set('name', 'Kirsten World Tour');
        resolve(credentialResponse);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Creates a config object from a set of parameters.
   *
   * @param {String} clientToken    The client token
   * @param {String} clientSecret   The client secret
   * @param {String} accessToken    The access token
   * @param {String} host            The host
   */
  setConfigFromStrings(clientToken, clientSecret, accessToken, host) {
    if (!this.validatedArgs([clientToken, clientSecret, accessToken, host])) {
      throw new Error('Insufficient Akamai credentials');
    }

    this.config = {
      client_token: clientToken,
      client_secret: clientSecret,
      access_token: accessToken,
      host: host.indexOf('https://') > -1 ? host : 'https://' + host,
    };
  };

  validatedArgs(args) {
    const expected = ['client_token', 'client_secret', 'access_token', 'host'];
    let valid = true;

    expected.forEach(function(arg, i) {
      if (!args[i]) {
        if (process.env.EDGEGRID_ENV !== 'test') {
          throw new Error('No defined ' + arg);
        }

        valid = false;
      }
    });

    return valid;
  }
}

module.exports = EdgeGridAuthMock;

