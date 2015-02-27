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
    sys.log('[skeleton.js]._setup() called');
    return true;
  }

  /**
   * Return a name of Help file
   */
  function _getHelpFile(args){
    return 'cmd.skeleton.help';
  }

  /**
   * Run command entry point
   */
  function _run(args){
    sys.log('[skeleton]._run() called');
    sys.logTask('Environment information:');
    sys.log(_env.helpers.JSON.stringify(_env, null, 4));
    sys.logTask('Product information:');
    sys.log(_env.helpers.JSON.stringify(sys.product, null, 4));
  }

  command.api = {
    setup: _setup,
    getHelpFile: _getHelpFile,
    run: _run
  }
})();
