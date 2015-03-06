// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
  // more information of environment API
  _.env;

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
  _.run = function(args){
    sys.logTask('[kvm] does not support uninstall');
  }

  command.api = {
    setup: _.setup,
    run: _.run
  }
})({});
