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
      _kvmUrlPs = _kvmUrlBase.replace('{t}', 'ps1'),
      _toolsPath = fs.combine(sys.product.meta.installPath, 'tools', 'tech', 'aspnet'),
      _nugetFile = fs.combine(_toolsPath, 'nuget.exe'),
      _sakePath = fs.combine(_toolsPath,'Sake','tools'),
      _sakeFile = fs.combine(_sakePath, 'Sake.exe');

  /**
   * Set environment configuration
   */
  function _setup(env){
    _env = env;
    return true;
  }

  /**
   * Checks if @value has in user or process PATH Environment variable
   *
   * @param {string} value Value check
   *
   * @return TRUE is in user or process PATH
   */
  function __hasInPath(value){
    var _result = false,
        _userPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_USER) || '').split(';'),
        _processPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_PROCESS) || '').split(';');
    for(var p in _userPath){
      if(_userPath[p] == value) {
        _result = true;
        break;
      }
    }
    for(var p in _processPath){
      if(_processPath[p] == value){
        _result = true;
        break;
      }
    }
    return _result;
  }

  /**
   * Run command entry point
   */
  function _run(args){
    var _kvmHasInPath = __hasInPath(_kvmPathBin),
        _toolsHasInPath = __hasInPath(_toolsPath),
        _sakeHasInPath = __hasInPath(_sakePath);

    sys.logTask('Booting environment ASPNET/5...');
    try {
      sys.logSubTask('Installing kvm...');
      {
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
      }

      sys.logSubTask('Installing tools...');
      {
        if(!fs.directoryExists(_toolsPath)){
          fs.createDirectory(_toolsPath);
        }

        if(!fs.fileExists(_nugetFile)){
          sys.logAction('Downloading nuget.exe');
          sys.log('#TODO: Remove NuGet of build script');
          _env.helpers.getWebFile('nuget.exe', "https://www.nuget.org/nuget.exe", _nugetFile);
        }

        if(!fs.fileExists()){
          sys.logAction('Downloading Sake.exe');
          sys.log('#TODO: Move aspnet/Sake/tools to aspnet/Sake and clean');
          sys.log('#TODO: Remove Sake of build script');
          var _nugetArgs = [
            'install',
            '-ExcludeVersion',
            '-OutputDirectory',
            '"' + _toolsPath + '"',
            'Sake',
            '-Version',
            '0.2.0'];
          su.exec(_nugetFile, _nugetArgs, function silent(){});
        }

        if(!fs.fileExists(_nugetFile)){
          throw new Error('Tool nuget.exe not found!');
        }

        if(!fs.fileExists(_sakeFile)){
          throw new Error('Tool Sake.exe not found!');
        }
      }

      if(!_kvmHasInPath || !_toolsHasInPath || !_sakeHasInPath) {
        sys.logSubTask('Updating environment variable PATH');

        var _userPath = su.getEnvironment('PATH', su.CONST.ENVTYPE_USER) || '',
            _processPath = su.getEnvironment('PATH', su.CONST.ENVTYPE_PROCESS) || '';

        if(!_kvmHasInPath){
          _userPath += (_userPath.length > 0 ? ';' : '') + _kvmPathBin;
          _processPath += (_processPath.length > 0 ? ';' : '') + _kvmPathBin;

          sys.logAction('Adding [' + _kvmPathBin + '] to user PATH');
          su.setEnvironment('PATH', _userPath, su.CONST.ENVTYPE_USER);

          sys.logAction('Adding [' + _kvmPathBin + '] to process PATH');
          su.setEnvironment('PATH', _processPath, su.CONST.ENVTYPE_PROCESS);
        }

        if(!_toolsHasInPath){
          _userPath += (_userPath.length > 0 ? ';' : '') + _toolsPath;
          _processPath += (_processPath.length > 0 ? ';' : '') + _toolsPath;

          sys.logAction('Adding [' + _toolsPath + '] to user PATH');
          su.setEnvironment('PATH', _userPath, su.CONST.ENVTYPE_USER);

          sys.logAction('Adding [' + _toolsPath + '] to process PATH');
          su.setEnvironment('PATH', _processPath, su.CONST.ENVTYPE_PROCESS);
        }

        if(!_sakeHasInPath){
          _userPath += (_userPath.length > 0 ? ';' : '') + _sakePath;
          _processPath += (_processPath.length > 0 ? ';' : '') + _sakePath;

          sys.logAction('Adding [' + _sakePath + '] to user PATH');
          su.setEnvironment('PATH', _userPath, su.CONST.ENVTYPE_USER);

          sys.logAction('Adding [' + _sakePath + '] to process PATH');
          su.setEnvironment('PATH', _processPath, su.CONST.ENVTYPE_PROCESS);
        }
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
