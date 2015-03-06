// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.su = sys.require('sysutils.js');
  _.fs = sys.require('fsutils.js');

  // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
  // more information of environment API
  _.env;

  // ASPNET/5 information
  _.aspnetVersion = 'v1.0.0-beta3';
  _.kvmPathBase = _.fs.combine(sys.product.meta.userPath, '.k');
  _.kvmPathBin = _.fs.combine(_.kvmPathBase, 'bin');
  _.kvmPathCmd = _.fs.combine(_.kvmPathBin, 'kvm.cmd');
  _.kvmPathPs = _.fs.combine(_.kvmPathBin, 'kvm.ps1');
  _.kvmUrlBase = 'https://raw.githubusercontent.com/aspnet/Home/{v}/kvm.{t}'.replace('{v}', _.aspnetVersion);
  _.kvmUrlCmd = _.kvmUrlBase.replace('{t}', 'cmd');
  _.kvmUrlPs = _.kvmUrlBase.replace('{t}', 'ps1');
  _.toolsPath = _.fs.combine(sys.product.meta.installPath, 'tools', 'tech', 'aspnet');
  _.nugetFile = _.fs.combine(_.toolsPath, 'nuget.exe');
  _.sakePath = _.fs.combine(_.toolsPath,'Sake');
  _.sakeFile = _.fs.combine(_.sakePath, 'Sake.exe');

  /**
   * Set environment configuration
   */
  _.setup = function(env){
    _.env = env;
    return true;
  }

  /**
   * Checks if @value has in user or process PATH Environment variable
   *
   * @param {string} value Value check
   *
   * @return TRUE is in user or process PATH
   */
  _._hasInPath = function(value){
    var _result = false,
        _userPath = (_.su.getEnvironment('PATH', _.su.CONST.ENVTYPE_USER) || '').split(';'),
        _processPath = (_.su.getEnvironment('PATH', _.su.CONST.ENVTYPE_PROCESS) || '').split(';');
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
  _.run = function(args){
    var _kvmHasInPath = _._hasInPath(_.kvmPathBin),
        _toolsHasInPath = _._hasInPath(_.toolsPath),
        _sakeHasInPath = _._hasInPath(_.sakePath);

    sys.logTask('Booting environment ASPNET/5...');
    try {
      sys.logSubTask('Installing kvm...');
      {
        if(!_.fs.directoryExists(_.kvmPathBin)){
          sys.logAction('Creating directory', _.kvmPathBin);
          _.fs.createDirectory(_.kvmPathBin);
        }

        if(!_.fs.fileExists(_.kvmPathCmd)){
          sys.logAction('Downloading kvm.cmd');
          _.env.helpers.getWebFile('kvm.cmd', _.kvmUrlCmd, _.kvmPathCmd);
        }

        if(!_.fs.fileExists(_.kvmPathPs)){
          sys.logAction('Downloading kvm.ps1');
          _.env.helpers.getWebFile('kvm.ps1', _.kvmUrlPs, _.kvmPathPs);
        }

        if(!_.fs.fileExists(_.kvmPathCmd)){
          throw new Error('File kvm.cmd not found!');
        }

        if(!_.fs.fileExists(_.kvmPathPs)){
          throw new Error('File kvm.ps1 not found!');
        }
      }

      sys.logSubTask('Installing tools...');
      {
        if(!_.fs.directoryExists(_.toolsPath)){
          _.fs.createDirectory(_.toolsPath);
        }

        if(!_.fs.fileExists(_.nugetFile)){
          sys.logAction('Downloading nuget.exe');
          _.env.helpers.getWebFile('nuget.exe', "https://www.nuget.org/nuget.exe", _.nugetFile);
        }

        if(!_.fs.fileExists(_.fs.combine(_.sakePath, 'Sake.exe'))){
          sys.logAction('Downloading Sake.exe');
          var _nugetArgs = [
            'install', '-ExcludeVersion',
            '-OutputDirectory', '"' + _.toolsPath + '"',
            'Sake', '-Version', '0.2.0'];
          _.su.exec(_.nugetFile, _nugetArgs, function silent(){});
        }

        // Remove Sake/Sake.nupkg
        if(_.fs.fileExists(_.fs.combine(_.sakePath, 'Sake.nupkg'))){
          _.fs.deleteFile(_.fs.combine(_.sakePath, 'Sake.nupkg'));
        }

        // Move Sake/tools to Sake
        if(_.fs.directoryExists(_.fs.combine(_.sakePath, 'tools'))){
          _.fs.copyDirectory(_.fs.combine(_.sakePath, 'tools'), _.sakePath);
          _.fs.deleteDirectory(_.fs.combine(_.sakePath, 'tools'));
        }

        if(!_.fs.fileExists(_.nugetFile)){
          throw new Error('Tool nuget.exe not found!');
        }

        if(!_.fs.fileExists(_.sakeFile)){
          throw new Error('Tool Sake.exe not found!');
        }
      }

      if(!_kvmHasInPath || !_toolsHasInPath || !_sakeHasInPath) {
        sys.logSubTask('Updating environment variable PATH');

        var _userPath = _.su.getEnvironment('PATH', _.su.CONST.ENVTYPE_USER) || '',
            _processPath = _.su.getEnvironment('PATH', _.su.CONST.ENVTYPE_PROCESS) || '';

        if(!_kvmHasInPath){
          _userPath += (_userPath.length > 0 ? ';' : '') + _.kvmPathBin;
          _processPath += (_processPath.length > 0 ? ';' : '') + _.kvmPathBin;

          sys.logAction('Adding [' + _.kvmPathBin + '] to user PATH');
          _.su.setEnvironment('PATH', _userPath, _.su.CONST.ENVTYPE_USER);

          sys.logAction('Adding [' + _.kvmPathBin + '] to process PATH');
          _.su.setEnvironment('PATH', _processPath, _.su.CONST.ENVTYPE_PROCESS);
        }

        if(!_toolsHasInPath){
          _userPath += (_userPath.length > 0 ? ';' : '') + _.toolsPath;
          _processPath += (_processPath.length > 0 ? ';' : '') + _.toolsPath;

          sys.logAction('Adding [' + _.toolsPath + '] to user PATH');
          _.su.setEnvironment('PATH', _userPath, _.su.CONST.ENVTYPE_USER);

          sys.logAction('Adding [' + _.toolsPath + '] to process PATH');
          _.su.setEnvironment('PATH', _processPath, _.su.CONST.ENVTYPE_PROCESS);
        }

        if(!_sakeHasInPath){
          _userPath += (_userPath.length > 0 ? ';' : '') + _.sakePath;
          _processPath += (_processPath.length > 0 ? ';' : '') + _.sakePath;

          sys.logAction('Adding [' + _.sakePath + '] to user PATH');
          _.su.setEnvironment('PATH', _userPath, _.su.CONST.ENVTYPE_USER);

          sys.logAction('Adding [' + _.sakePath + '] to process PATH');
          _.su.setEnvironment('PATH', _processPath, _.su.CONST.ENVTYPE_PROCESS);
        }
      }

    }catch(error){
      sys.logTask('Could not initialize your ASPNET/5 environment.');
      throw error;
    }
    sys.logTask('Your ASPNET/5 environment is ready!');
  }

  command.api = {
    setup: _.setup,
    run: _.run
  }
})({});
