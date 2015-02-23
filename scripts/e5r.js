// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

if(typeof WScript != 'object') throw new Error('WSH not detected!');

var include = function(filePath){
      var content = (new ActiveXObject("Scripting.FileSystemObject"))
        .OpenTextFile(filePath, 1)
        .ReadAll();
      eval(content);
    },
    require = function(filePath){
      var module = {},
          content = (new ActiveXObject("Scripting.FileSystemObject"))
            .OpenTextFile(filePath, 1)
            .ReadAll();
      eval(content);
      return module.exports;
    },
    log = function(){
      var msg = '';
      for(var arg = 0; arg < arguments.length; arg++){
        msg += msg.length > 0 ? ' ' : '';
        msg += arguments[arg];
      }
      WScript.Echo(msg);
    },
    console = {log:log};

main(WScript.Arguments);

function main(args){
  var web = require('webutils.js'),
      _baseUrl = 'https://github.com/e5r/env/raw/master/',
      _basePath = './TmpDownloads/',
      _files = [
        {url: _baseUrl + 'resources/license/AGPL-3.0.md', file: _basePath + 'resources/license/AGPL-3.0.md'},
        {url: _baseUrl + 'resources/license/APACHE-2.0.md', file: _basePath + 'resources/license/APACHE-2.0.md'},
        {url: _baseUrl + 'resources/license/ARTISTIC-2.0.md', file: _basePath + 'resources/license/ARTISTIC-2.0.md'},
        {url: _baseUrl + 'resources/license/BSD-2-CLAUSE.md', file: _basePath + 'resources/license/BSD-2-CLAUSE.md'},
        {url: _baseUrl + 'resources/license/BSD-3-CLAUSE.md', file: _basePath + 'resources/license/BSD-3-CLAUSE.md'},
        {url: _baseUrl + 'resources/license/CC0.md', file: _basePath + 'resources/license/CC0.md'},
        {url: _baseUrl + 'resources/license/EPL-1.0.md', file: _basePath + 'resources/license/EPL-1.0.md'},
        {url: _baseUrl + 'resources/license/GPL-2.0.md', file: _basePath + 'resources/license/GPL-2.0.md'},
        {url: _baseUrl + 'resources/license/GPL-3.0.md', file: _basePath + 'resources/license/GPL-3.0.md'},
        {url: _baseUrl + 'resources/license/ISC.md', file: _basePath + 'resources/license/ISC.md'},
        {url: _baseUrl + 'resources/license/LGPL-2.1.md', file: _basePath + 'resources/license/LGPL-2.1.md'},
        {url: _baseUrl + 'resources/license/LGPL-3.0.md', file: _basePath + 'resources/license/LGPL-3.0.md'},
        {url: _baseUrl + 'resources/license/MIT.md', file: _basePath + 'resources/license/MIT.md'},
        {url: _baseUrl + 'resources/license/MPL-2.0.md', file: _basePath + 'resources/license/MPL-2.0.md'},
        {url: _baseUrl + 'resources/license/UNLICENSE.md', file: _basePath + 'resources/license/UNLICENSE.md'},
        {url: _baseUrl + 'skeleton/aspnet.wres', file: _basePath + 'skeleton/aspnet.wres'},
        {url: _baseUrl + 'skeleton/common.wres', file: _basePath + 'skeleton/common.wres'},
        {url: _baseUrl + 'skeleton/common/README.md', file: _basePath + 'skeleton/common/README.md'},
        {url: _baseUrl + 'skeleton/common/build.cmd', file: _basePath + 'skeleton/common/build.cmd'},
        {url: _baseUrl + 'skeleton/aspnet/build.cmd', file: _basePath + 'skeleton/aspnet/build.cmd'},
        {url: _baseUrl + 'skeleton/aspnet/global.json', file: _basePath + 'skeleton/aspnet/global.json'},
        {url: _baseUrl + 'skeleton/aspnet/makefile.shade', file: _basePath + 'skeleton/aspnet/makefile.shade'},
        {url: _baseUrl + 'skeleton/aspnet/nuget.config', file: _basePath + 'skeleton/aspnet/nuget.config'},
        {url: _baseUrl + 'skeleton/aspnet/packages.config', file: _basePath + 'skeleton/aspnet/packages.config'}
      ];
  for(var f in _files){
    log('\nDownloading ', _files[f].url);
    log('   To:', _files[f].file)
    web.getFile(_files[f].url, _files[f].file);
  }
};
