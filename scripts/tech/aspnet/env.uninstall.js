// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'

  // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
  // more information of environment API
  var _env;

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
    sys.logTask('[kvm] does not support uninstall');
  }

  command.api = {
    setup: _setup,
    run: _run
  }
})();
