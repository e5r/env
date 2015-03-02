// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'

  var su = sys.require('sysutils.js'),
      fs = sys.require('fsutils.js'),

      // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
      // more information of environment API
      _env,

      // ASPNET/5 information
      _kvmPathBase = fs.combine(sys.product.meta.userPath, '.k'),
      _kvmPathRuntimes = fs.combine(_kvmPathBase, 'runtimes');

  /**
   * Set environment configuration
   */
  function _setup(env){
    _env = env;
    return true;
  }

  /**
   * Run command entry point
   */
  function _run(version, args){
    //sys.logTask('Installing runtime', version,  'for ASPNET/5...');
    try {
      var _args = [
        'kvm.ps1',
        'install',
        version
      ].concat(args);

      var _job = su.exec('powershell', _args, function(line){
        if(line && line.length > 0) sys.logAction(line);
        // Update process PATH and user PATH
        var _matchProcess = /Adding\s(.+)\sto process PATH/g.exec(line),
            _matchUser = /Adding\s(.+)\sto user PATH/g.exec(line),
            _processPath = _matchProcess != null && _matchProcess.length > 1 ? _matchProcess[1] : '',
            _userPath = _matchUser != null && _matchUser.length > 1 ? _matchUser[1] : '';
        if(_processPath){
          var _pPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_PROCESS) || '').split(';')
              _pNewPath = '';
          for(var p in _pPath){
            var _v = _pPath[p];
            if(_v.indexOf(_kvmPathRuntimes) == 0) continue;
            _pNewPath += _pNewPath.length > 0 ? ';' : '';
            _pNewPath += _v;
          }
          _pNewPath = _processPath + ';' + _pNewPath;
          su.setEnvironment('PATH', _pNewPath, su.CONST.ENVTYPE_PROCESS);
        }
        if(_userPath){
          var _uPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_USER) || '').split(';'),
              _uNewPath = '';
          for(var p in _uPath){
            var _v = _uPath[p];
            if(_v.indexOf(_kvmPathRuntimes) == 0) continue;
            _uNewPath += _uNewPath.length > 0 ? ';' : '';
            _uNewPath += _v;
          }
          _uNewPath = _userPath + ';' + _uNewPath;
          su.setEnvironment('PATH', _uNewPath, su.CONST.ENVTYPE_USER);
        }
      });

    }catch(error){
      sys.logTask('Runtime', version, 'could not installed.');
      throw error;
    }
    //sys.logTask('Runtime', version, 'successfuly installed!');
  }

  command.api = {
    setup: _setup,
    run: _run
  }
})();
