// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'

  var su = sys.require('sysutils.js'),
      fs = sys.require('fsutils.js'),

      // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
      // more information of environment API
      _env,

      // ASPNET/5 information
      _aspnetVersion = 'v1.0.0-beta3',
      _kvmPathBase = fs.combine(sys.product.meta.userPath, '.k'),
      _kvmPathBin = fs.combine(_kvmPathBase, 'bin'),
      _kvmPathCmd = fs.combine(_kvmPathBin, 'kvm.cmd'),
      _kvmPathPs = fs.combine(_kvmPathBin, 'kvm.ps1'),
      _kvmUrlBase = 'https://raw.githubusercontent.com/aspnet/Home/{v}/kvm.{t}'.replace('{v}', _aspnetVersion),
      _kvmUrlCmd = _kvmUrlBase.replace('{t}', 'cmd'),
      _kvmUrlPs = _kvmUrlBase.replace('{t}', 'ps1');

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
  function _run(args){
    sys.logTask('Booting environment ASPNET/5...');
    try {
      if(!fs.directoryExists(_kvmPathBin)){
        sys.logAction('Creating directory', _kvmPathBin);
        fs.createDirectory(_kvmPathBin);
      }

      if(!fs.fileExists(_kvmPathCmd)){
        sys.logAction('Downloading kvm.cmd');
        _env.helpers.getWebFile('kvm.cmd', _kvmUrlCmd, _kvmPathCmd);
      }

      if(!fs.fileExists(_kvmPathPs)){
        sys.logAction('Downloading kvm.ps1');
        _env.helpers.getWebFile('kvm.ps1', _kvmUrlPs, _kvmPathPs);
      }

      if(!fs.fileExists(_kvmPathCmd)){
        throw new Error('File kvm.cmd not found!');
      }

      if(!fs.fileExists(_kvmPathPs)){
        throw new Error('File kvm.ps1 not found!');
      }

      sys.logSubTask('Cleaning previous installations');
      {
        var _userPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_USER) || '').split(';'),
            _processPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_PROCESS) || '').split(';')
            _userNewPath = '',
            _procesNewPath = '';
        for(var p in _userPath){
          var _v = _userPath[p];
          if(_v.indexOf(_kvmPathBase) == 0) continue;
          _userNewPath += _userNewPath.length > 0 ? ';' : '';
          _userNewPath += _v;
        }
        for(var p in _processPath){
          var _v = _processPath[p];
          if(_v.indexOf(_kvmPathBase) == 0) continue;
          _procesNewPath += _procesNewPath.length > 0 ? ';' : '';
          _procesNewPath += _v;
        }
        su.setEnvironment('PATH', _userNewPath, su.CONST.ENVTYPE_USER);
        su.setEnvironment('PATH', _procesNewPath, su.CONST.ENVTYPE_PROCESS);
      }
      sys.logSubTask('Updating environment variable PATH');
      {
        var _userPath = su.getEnvironment('PATH', su.CONST.ENVTYPE_USER) || '',
            _processPath = su.getEnvironment('PATH', su.CONST.ENVTYPE_PROCESS) || '';
        _userPath += (_userPath.length > 0 ? ';' : '') + _kvmPathBin;
        _processPath += (_processPath.length > 0 ? ';' : '') + _kvmPathBin;

        sys.logAction('Adding [' + _kvmPathBin + '] to user PATH');
        su.setEnvironment('PATH', _userPath, su.CONST.ENVTYPE_USER);

        sys.logAction('Adding [' + _kvmPathBin + '] to process PATH');
        su.setEnvironment('PATH', _processPath, su.CONST.ENVTYPE_PROCESS);
      }

    }catch(error){
      sys.logTask('Could not initialize your ASPNET/5 environment.');
      throw error;
    }
    sys.logTask('Your ASPNET/5 environment is ready!');
  }

  command.api = {
    setup: _setup,
    run: _run
  }
})();
