// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

var fs = require('fsutils.js');

/**
 * Unpack Zip File using Shell.Application ActiveX Object
 *
 * @param {string} zipFile Zip file path
 * @param {string} outPath Destination path to unpack content
 */
function unzipFile(zipFile, outPath) {
  var _shell = new ActiveXObject("shell.application"),
      _zipFile = fs.absolutePath(zipFile),
      _outPath = fs.createDirectory(outPath);
  _shell.NameSpace(_outPath).CopyHere(_shell.NameSpace(_zipFile).Items(), 20);
  _shell = null;
}

module.exports = {
  unzip: unzipFile
}
