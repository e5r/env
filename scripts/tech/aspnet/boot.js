// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'

  var su = sys.require('sysutils.js'),
      fs = sys.require('fsutils.js'),

      // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
      // more information of environment API
      _env;

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
      var _aspnetVersion = 'v1.0.0-beta3',
          _kvmPathBase = fs.combine(sys.product.meta.userPath, '.k', 'bin'),
          _kvmPathCmd = fs.combine(_kvmPathBase, 'kvm.cmd'),
          _kvmPathPs = fs.combine(_kvmPathBase, 'kvm.ps1'),
          _kvmUrlBase = 'https://raw.githubusercontent.com/aspnet/Home/{v}/kvm.{t}'.replace('{v}', _aspnetVersion),
          _kvmUrlCmd = _kvmUrlBase.replace('{t}', 'cmd'),
          _kvmUrlPs = _kvmUrlBase.replace('{t}', 'ps1');

      if(!fs.directoryExists(_kvmPathBase)){
        sys.logAction('Creating directory', _kvmPathBase + '...');
        fs.createDirectory(_kvmPathBase);
      }

      if(!fs.fileExists(_kvmPathCmd)){
        sys.logAction('Downloading kvm.cmd...');
        _env.helpers.getWebFile('kvm.cmd', _kvmUrlCmd, _kvmPathCmd);
      }

      if(!fs.fileExists(_kvmPathPs)){
        sys.logAction('Downloading kvm.ps1...');
        _env.helpers.getWebFile('kvm.ps1', _kvmUrlPs, _kvmPathPs);
      }

      if(!fs.fileExists(_kvmPathCmd)){
        throw new Error('File kvm.cmd not found!');
      }

      if(!fs.fileExists(_kvmPathPs)){
        throw new Error('File kvm.ps1 not found!');
      }

      sys.logAction('#TODO: Atualizar PATH para todos os processos pais');

    }catch(error){
      sys.logSubTask('Could not initialize your ASPNET/5 environment.');
      throw error;
    }
    sys.logSubTask('Your ASPNET/5 environment is ready!');
  }

  command.api = {
    setup: _setup,
    run: _run
  }
})();
