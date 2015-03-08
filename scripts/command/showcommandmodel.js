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
    return 'e5r.help';
  }

  /**
   * Show usage information message
   */
  _.showUsage = function(){
    sys.log(sys.product.meta.getHeaderText());
    sys.log('Usage:', sys.product.cmd, 'showcommandmodel', '<action>');
    sys.log('      ', 'Try \'' + sys.product.cmd, 'help showcommandmodel\' for more information.');
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
        'switch|test|T'
      ],
      [
        // Empty action
        [function(opt, args){
          _.showUsage();
          sys.log('\n');
        }],

        // Show test message
        ['test', function(opt, args){
          var _opt = _.plugin.makeOptions(opt);
          if(_opt.test){
            sys.log('You reported the test parameter.');
          }else{
            sys.log('you did not inform the test parameter.')
          }
          sys.log();
          sys.log('--workdir:', _opt.workdir);
          sys.log('--tech:', _opt.tech);
          sys.log('--test:', _opt.test);
        }]
      ]);

    if(!act.run(args)){
      throw new Error('#CmdShowCommandModel: Action [' + args[0] + '] not found!');
    }
  }

  command.api = {
    setup: _.setup,
    getHelpFile: _.getHelpFile,
    run: _.run
  }
})({});
