// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.su = sys.require('sysutils.js');
  _.fs = sys.require('fsutils.js');

  // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
  // more information of environment API
  _.env;

  // ASPNET/5 information
  _.kvmPathBase = _.fs.combine(sys.product.meta.userPath, '.k'),
  _.kvmPathRuntimes = _.fs.combine(_.kvmPathBase, 'runtimes');

  /**
   * Set environment configuration
   */
  _.setup = function(env){
    _.env = env;
    return true;
  }

  /**
   * Run command entry point
   */
  _.run = function(version, args){
    try {
      var _args = [
        'kvm.ps1',
        'install',
        version
      ].concat(args);

      var _job = _.su.exec('powershell', _args, function(line){
        if(line && line.length > 0) sys.logAction(line);
        // Update process PATH and user PATH
        var _matchProcess = /Adding\s(.+)\sto process PATH/g.exec(line),
            _matchUser = /Adding\s(.+)\sto user PATH/g.exec(line),
            _processPath = _matchProcess != null && _matchProcess.length > 1 ? _matchProcess[1] : '',
            _userPath = _matchUser != null && _matchUser.length > 1 ? _matchUser[1] : '';
        if(_processPath){
          var _pPath = (_.su.getEnvironment('PATH', _.su.CONST.ENVTYPE_PROCESS) || '').split(';')
              _pNewPath = '';
          for(var p in _pPath){
            var _v = _pPath[p];
            if(_v.indexOf(_.kvmPathRuntimes) == 0) continue;
            _pNewPath += _pNewPath.length > 0 ? ';' : '';
            _pNewPath += _v;
          }
          _pNewPath = _processPath + ';' + _pNewPath;
          _.su.setEnvironment('PATH', _pNewPath, _.su.CONST.ENVTYPE_PROCESS);
        }
        if(_userPath){
          var _uPath = (_.su.getEnvironment('PATH', _.su.CONST.ENVTYPE_USER) || '').split(';'),
              _uNewPath = '';
          for(var p in _uPath){
            var _v = _uPath[p];
            if(_v.indexOf(_.kvmPathRuntimes) == 0) continue;
            _uNewPath += _uNewPath.length > 0 ? ';' : '';
            _uNewPath += _v;
          }
          _uNewPath = _userPath + ';' + _uNewPath;
          _.su.setEnvironment('PATH', _uNewPath, _.su.CONST.ENVTYPE_USER);
        }
      });
    }catch(error){
      sys.logTask('A error ocurred on activate runtime.');
      throw error;
    }
  }

  command.api = {
    setup: _.setup,
    run: _.run
  }
})({});
