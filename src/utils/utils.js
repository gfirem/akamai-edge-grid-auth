'use strict';

const fs = require('fs');
let ini = require('ini');

class Utils {
  static sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static readConfigFile(filename, section) {
    return new Promise(function(resolve, reject) {
      fs.readFile(filename, section, function(error, result) {
        if (error) {
          reject(error);
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

  static writeConfigFile(filename, contents) {
    return new Promise(function(resolve, reject) {
      contents = contents.replace(/['"]+/g, '');

      fs.writeFile(filename, contents, function(error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static createConfigFile(filename) {
    return new Promise(function(resolve, reject) {
      let contents = '';

      fs.writeFile(filename, contents, {'flag': 'a'}, function(error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = Utils;
