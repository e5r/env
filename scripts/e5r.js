// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(main){ 'use strict'
  // DOC: https://technet.microsoft.com/pt-br/library/ff920171(v=ws.10).aspx
  if(typeof WScript != 'object') throw new Error('WSH not detected!');

  var sys = {
    include: function(filePath){
      var content = (new ActiveXObject("Scripting.FileSystemObject"))
        .OpenTextFile(filePath, 1)
        .ReadAll();
      eval(content);
    },
    require: function(filePath){
      var module = {},
          content = (new ActiveXObject("Scripting.FileSystemObject"))
            .OpenTextFile(filePath, 1)
            .ReadAll();
      eval(content);
      return module.exports;
    },
    log: function(){
      var msg = '';
      for(var arg = 0; arg < arguments.length; arg++){
        msg += msg.length > 0 ? ' ' : '';
        msg += arguments[arg];
      }
      WScript.Echo(msg);
    }
  };
  sys.console = {
    log: sys.log
  };

  if(typeof main == 'function'){
    main(sys, WScript.Arguments);
  }
})(function(sys, args){
  var web = sys.require('webutils.js'),
      _baseUrl = 'https://github.com/e5r/env/raw/migrate-to-javascript/',
      _basePath = './tmp/',
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
        {url: _baseUrl + 'resources/skeleton/aspnet.wres', file: _basePath + 'resources/skeleton/aspnet.wres'},
        {url: _baseUrl + 'resources/skeleton/common.wres', file: _basePath + 'resources/skeleton/common.wres'},
        {url: _baseUrl + 'resources/skeleton/common/README.md', file: _basePath + 'resources/skeleton/common/README.md'},
        {url: _baseUrl + 'resources/skeleton/common/build.cmd', file: _basePath + 'resources/skeleton/common/build.cmd'},
        {url: _baseUrl + 'resources/skeleton/aspnet/build.cmd', file: _basePath + 'resources/skeleton/aspnet/build.cmd'},
        {url: _baseUrl + 'resources/skeleton/aspnet/global.json', file: _basePath + 'resources/skeleton/aspnet/global.json'},
        {url: _baseUrl + 'resources/skeleton/aspnet/makefile.shade', file: _basePath + 'resources/skeleton/aspnet/makefile.shade'},
        {url: _baseUrl + 'resources/skeleton/aspnet/nuget.config', file: _basePath + 'resources/skeleton/aspnet/nuget.config'},
        {url: _baseUrl + 'resources/skeleton/aspnet/packages.config', file: _basePath + 'resources/skeleton/aspnet/packages.config'}
      ];
  for(var f in _files){
    sys.log('\nDownloading ', _files[f].url);
    sys.log('   To:', _files[f].file)
    web.getFile(_files[f].url, _files[f].file, function(error){
      sys.log('   #' + error.name + ': ' + error.description);
    });
  }
});
