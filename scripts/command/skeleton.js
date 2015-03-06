// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.plugin = sys.require('cmdutils.js');

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
   * Return a name of Help file
   */
  _.getHelpFile = function(args){
    return 'cmd.skeleton.help';
  }

  /**
   * Show usage information message
   */
  _.showUsage = function(){
    sys.log(sys.product.meta.getHeaderText());
    sys.log('Usage:', sys.product.cmd, 'skeleton <action> [options...]');
    sys.log('      ', 'Try \'' + sys.product.cmd, 'help skeleton\' for more information.');
  }

  /**
   * Run command entry point
   */
  _.run = function(args){

    // Redirect to help action
    if((args[0]||'') == 'help'){
      _.env.helpers.showCmdHelp(_.env.meta.cmd, []);
      return;
    }

    var act = _.plugin.cmdActions(
      [
        'value|workdir|w',
        'value|tech|t',
        'value|license|l',
        'switch|replace|r',
        'value|pversion|V'
      ],
      [
        // Empty action
        [function(opt, args){
          _.showUsage();
        }],

        // Initializes a directory with the skeleton of a project
        ['init', function(opt, args){
          var _opt = _.plugin.makeOptions(opt);
          _.plugin.createAndCheckCommand(_.env, 'skeleton.init', _opt)
            .run(_opt, args);
        }]
      ]);

    act.run(args);
  }

  command.api = {
    setup: _.setup,
    getHelpFile: _.getHelpFile,
    run: _.run
  }
})({});
