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
    sys.logTask('Activate a runtime for ASPNET/5...');
    try {

    }catch(error){
      sys.logTask('A error ocurred on activate runtime.');
      throw error;
    }
  }

  command.api = {
    setup: _setup,
    run: _run
  }
})();
