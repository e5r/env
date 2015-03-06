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
    return 'cmd.env.help';
  }

  /**
   * Show usage information message
   */
  _.showUsage = function(){
    sys.log(sys.product.meta.getHeaderText());
    sys.log('Usage:', sys.product.cmd, 'env <action> [options...]');
    sys.log('      ', 'Try \'' + sys.product.cmd, 'help env\' for more information.');
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
        'value|version|v'
      ],
      [
        // Empty action
        [function(opt, args){
          _.showUsage();
        }],

        // Checks and installs the prerequisites for informed
        // environment
        ['boot', function(opt, args){
          _.plugin.createAndCheckCommand(_.env, 'env.boot', _.plugin.makeOptions(opt)).run(args);
        }],

        // Install a specific version of the environment
        ['install', function(opt, args){
          var _opt = _.plugin.makeOptions(opt),
              _cmd = _.plugin.createAndCheckCommand(_.env, 'env.install', _opt);

          if(!_opt.version)
            throw new Error('Param --version is required.');

          _cmd.run(_opt.version, args);
        }],

        // Uninstall a specific version of the environment
        ['uninstall', function(opt, args){
          var _opt = _.plugin.makeOptions(opt),
              _cmd = _.plugin.createAndCheckCommand(_.env, 'env.uninstall', _opt);

          if(!_opt.version)
            throw new Error('Param --version is required.');

          _cmd.run(_opt.version, args);
        }],

        // List all installed versions of the environment
        ['list', function(opt, args){
          _.plugin.createAndCheckCommand(_.env, 'env.list', _.plugin.makeOptions(opt)).run(args);
        }],

        // Sets a specific version of the environment for use in the
        // system
        ['use', function(opt, args){
          var _opt = _.plugin.makeOptions(opt),
              _cmd = _.plugin.createAndCheckCommand(_.env, 'env.use', _opt);

          if(!_opt.version)
            throw new Error('Param --version is required.');

          _cmd.run(_opt.version, args);
        }]
      ]);

    if(!act.run(args)){
      throw new Error('#CmdEnv: Action [' + args[0] + '] not found!');
    }
  }

  command.api = {
    setup: _.setup,
    getHelpFile: _.getHelpFile,
    run: _.run
  }
})({});
