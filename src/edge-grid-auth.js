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

let untildify = require('untildify');
let ini = require('ini');
let merge = require('merge');
let EdgeGrid = require('edgegrid');
const Credential = require('./model/credential');
const fs = require('fs');
const DefaultSection = 'default';

/**
 * EdgeGrid Authentication
 */
class EdgeGridAuth {
  /**
   * Verify existing credentials
   *
   * @param {string} fileName
   * @param {string} section
   * @param debug
   *
   * @returns {Promise<Credential>}
   */
  verify(fileName, section, debug) {
    if (!fileName) {
      throw new Error('Invalid File Name parameter');
    }
    section = section || DefaultSection;
    debug = debug || false;
    this.edgeGrid = new EdgeGrid({
      path: untildify(fileName),
      section: section,
      debug: debug,
    });
    return new Promise((resolve) => {
      let request = {
        method: 'GET',
        path: '/-/client-api/active-grants/implicit',
      };
      this.edgeGrid.auth(request);

      this.edgeGrid.send(function(data, response) {
        if (!response) {
          let errorMessage = 'An error occurred, empty or invalid response from the request';
          if (data instanceof Error) {
            errorMessage = 'An error occurred, with the message ' + data.message;
          }
          throw new Error(errorMessage);
        }
        let credential = new Credential(response.body);
        resolve(credential);
      });
    });
  }

  /**
   * Paste in a formatted credential block. If the section in the options exist it will be overwrite.
   *
   * @param fileName
   * @param section
   * @param newOptions
   * @param overwrite
   * @returns {PromiseLike<string>}
   */
  paste(fileName, section, newOptions, overwrite) {
    if (!fileName) {
      throw new Error('Invalid file name parameter');
    }
    if (!newOptions) {
      throw new Error('Invalid set of new options parameter');
    }
    return new Promise((resolve) => {
      this.readConfigFile(fileName)
        .then((config) => {
          overwrite = overwrite || false;
          section = section || 'default';
          let newConfig = {};
          newConfig[section] = newOptions;
          if (!overwrite) {
            config = merge(config, newConfig);
          } else {
            config = newConfig;
          }
          resolve(this.writeConfigFile(fileName, ini.stringify(config, {whitespace: true})));
        });
    });
  }

  /**
   * Copy credentials from one section to a new one
   *
   * @param {string} fileName
   * @param {string} from
   * @param {string} to
   * @returns {Promise<{config: object, options: Promise<string>}>}
   */
  copy(fileName, from, to) {
    if (!fileName) {
      throw new Error('Invalid file name');
    }
    if (!from || !to) {
      throw new Error('Invalid parameters from and to');
    }
    return this.readConfigFile(fileName)
      .then(config => {
        if (!config[from]) {
          throw new Error('Error! the from config item not exist');
        }
        config[to] = config[from];
        return this.writeConfigFile(fileName, ini.stringify(config, {whitespace: true}));
      });
  }

  /**
   * Setup authentication for Akamai. This function will override the section if exist.
   *
   * @param {string} fileName
   * @param {object} newConfig
   * @param {string} section
   * @param {object} currentConfig
   *
   * @returns {Promise<any>}
   */
  setup(fileName, newConfig, section, currentConfig) {
    if (!fileName) {
      throw new Error('Invalid file name');
    }
    if (!newConfig) {
      throw new Error('Invalid new configuration in parameters');
    }
    section = section || 'default';
    let list = ['client_secret', 'client_token', 'access_token', 'host'];
    let config = currentConfig || {};
    config[section] = {};
    for (let field of list) {
      config[section][field] = newConfig[field];
    }
    return this.writeConfigFile(fileName, ini.stringify(config, {whitespace: true}), {});
  }

  /**
   * Create the configuration file, if exist is open to append data
   *
   * @param {string} fileName
   *
   * @returns {Promise<any>}
   */
  createConfigFile(fileName) {
    if (!fileName) {
      throw new Error('Invalid file name');
    }
    let contents = '';
    let options = {'flag': 'a'};
    return this.writeConfigFile(fileName, contents, options);
  }

  /**
   * Write the configuration file. If not exist will be created
   *
   * @param {string} fileName
   * @param {string} contents
   * @param {object|string} options @see https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
   *
   * @returns {Promise<any>}
   */
  writeConfigFile(fileName, contents, options) {
    options = options || {};
    return new Promise(function(resolve) {
      contents = contents.replace(/['"]+/g, '');

      fs.writeFile(untildify(fileName), contents, options, function(error) {
        if (error) {
          throw error;
        } else {
          resolve(contents);
        }
      });
    });
  }

  /**
   * Read a configuration file
   *
   * @param {string} fileName
   * @param {string} section
   * @param {object|string} options @see https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
   *
   * @returns {Promise<any>}
   */
  readConfigFile(fileName, section, options) {
    return new Promise(function(resolve) {
      fs.readFile(untildify(fileName), options, function(error, result) {
        if (error) {
          throw error;
        } else {
          let configObject = ini.parse(result.toString());
          if (section) {
            resolve(configObject[section]);
          } else {
            resolve(configObject);
          }
        }
      });
    });
  }
}

module.exports = EdgeGridAuth;
