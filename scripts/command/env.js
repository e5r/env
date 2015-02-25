// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'
  var _env;

  /**
   * Set environmente configuration
   */
  function _setup(env){
    sys.log('[env.js]._setup() called');
    _env = env;
  }

  /**
   * Return a name of Help file
   */
  function _getHelpFile(args){
    return 'cmd.env.help';
  }

  /**
   * Run command entry point
   */
  function _run(args){
    sys.log('[env.js]._run() called');
  }

  command.api = {
    setup: _setup,
    getHelpFile: _getHelpFile,
    run: _run
  }
})();
