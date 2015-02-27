// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'
  var web = sys.require('webutils.js'),
      fs = sys.require('fsutils.js');

  function _getCmd(cmd, tech){
    var _path = fs.combine(sys.product.meta.installPath, (tech ? 'lib/tech/' + tech : 'command') + '/{c}.js'.replace('{c}',cmd))
        _url = sys.product.meta.makeUrl((tech ? 'scripts/tech/' + tech : 'scripts/command') + '/{c}.js'.replace('{c}', cmd)),
        command = {},
        content;
    if(!fs.fileExists(_path)){
      web.download(_url, _path, function(error){
        sys.log('#' + error.name + ':', error.message, 'on get command <{c}>.'.replace('{c}', (tech ? tech + '/' + cmd : cmd)));
      })
    }
    if(fs.fileExists(_path)){
      content = _fso.OpenTextFile(_path, 1).ReadAll();
      eval(content);
    }
    return command.api;
  }

  /**
   * Checks the integrity of the plugin api
   *
   * @param {object} plugin Object of plugin, returned by _getCmd
   *
   * @return TRUE if ok, throw exception if not ok
   */
  function _checkApi(plugin){
    if(typeof plugin != 'object')
      throw new Error('Plugin must be an object');

    if(typeof plugin.setup != 'function')
      throw new Error('Plugin does not contain the [Setup] method');

    if(typeof plugin.getHelpFile != 'function')
      throw new Error('Plugin does not contain the [GetHelpFile] method');

    if(typeof plugin.run != 'function')
      throw new Error('Plugin does not contain the [Run] method');

    return true;
  }

  module.exports = {
    getCmd: _getCmd,
    checkApi: _checkApi
  }
})();
