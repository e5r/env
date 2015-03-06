// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.fs = sys.require('fsutils.js');

  /**
   * Unpack Zip File using Shell.Application ActiveX Object
   *
   * @param {string} zipFile Zip file path
   * @param {string} outPath Destination path to unpack content
   */
  _.unzipFile = function(zipFile, outPath) {
    var _shell = new ActiveXObject("shell.application"),
        _zipFile = _.fs.absolutePath(zipFile),
        _outPath = _.fs.createDirectory(outPath);
    _shell.NameSpace(_outPath).CopyHere(_shell.NameSpace(_zipFile).Items(), 20);
    _shell = null;
  }

  module.exports = {
    unzip: _.unzipFile
  }
})({});
