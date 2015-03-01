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
  function _run(version, args){
    //sys.logTask('Installing runtime', version,  'for ASPNET/5...');
    try {
      var _args = [
        'kvm.ps1',
        'install',
        version
      ].concat(args);

      var _job = su.exec('powershell', _args, function(line){
        sys.logAction(line);
      });

      // TODO: Update process PATH and user PATH

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
