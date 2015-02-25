// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'
  var web = sys.require('webutils.js'),
      fs = sys.require('fsutils.js');

  function _getCmd(cmd){
    var _path = fs.combine(sys.product.meta.installPath, 'command', '{c}.js'.replace('{c}',cmd)),
        _url = sys.product.meta.makeUrl('/scripts/command/{c}.js'.replace('{c}', cmd));
        command = {},
        content;
    if(!fs.fileExists(_path)){
      web.download(_url, _path, function(error){
        sys.log('#' + error.name + ':', error.message, 'on get command <{c}>.'.replace('{c}', cmd));
      })
    }
    if(fs.fileExists(_path)){
      content = _fso.OpenTextFile(_path, 1).ReadAll();
      eval(content);
    }
    return command.api;
  }

  module.exports = {
    getCmd: _getCmd
  }
})();
