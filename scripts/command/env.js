// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'

  var su = sys.require('sysutils.js'),

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
   * Return a name of Help file
   */
  function _getHelpFile(args){
    return 'cmd.env.help';
  }

  /**
   * Show usage information message
   */
  function _showUsage(){
    sys.log(sys.product.meta.getHeaderText());
    sys.log('Usage:', sys.product.cmd, 'env <command> [options...]');
    sys.log('      ', 'Try \'' + sys.product.cmd, 'help env\' for more information.');
  }

  /**
   * Creates a new object based on another
   * TODO: Move to <sysutils>
   *
   * @param {object} object  Object to copy
   *
   * @return New Object
   */
  function _copyObject(obj){
    var _obj = {};
    for(var p in obj) _obj[p] = obj[p];
    return _obj;
  }

  /**
   * Checks and make options data
   * TODO: Move to <sysutils>
   *
   * @param {object} opt  Original options
   *
   * @return Clone of opt with modified data
   */
  function _makeOptions(opt){
    var _opt = _copyObject(opt);

    if(!_opt.workdir) _opt.workdir = su.script.currentDirectory;

    if((_opt.workdir||'').length > 0 && (_opt.workdir||'').charAt(0) == '$'){
      var _home = su.getEnvironment('E5R_HOME', su.CONST.ENVTYPE_PROCESS);
      if(!_home) _home = sys.product.meta.userPath;
      _opt.workdir = _opt.workdir.replace('$', _home);
    }

    if(_opt.workdir) _opt.workdir = fs.absolutePath(su.buildEnvString(_opt.workdir));

    if(!fs.directoryExists(_opt.workdir)) fs.createDirectory(_opt.workdir);

    if(!_opt.tech){
      var _file = fs.absolutePath(fs.combine(_opt.workdir, '.e5r\\tech'));
      if(fs.fileExists(_file)) _opt.tech = fs.getTextFileContent(_file).trim();
    }

    if(!_opt.version){
      var _file = fs.absolutePath(fs.combine(_opt.workdir, '.e5r\\version'));
      if(fs.fileExists(_file)) _opt.version = fs.getTextFileContent(_file).trim();
    }

    return _opt;
  }

  /**
   * Create and check prerequisites for command
   * TODO: Move to <sysutils>
   *
   * @param {string} cmd  The command name
   * @param {object} opt  The options
   *
   * @return Command object
   */
  function _createAndCheckCommand(cmd, opt){
    if(!fs.directoryExists(opt.workdir))
      throw new Error('Work directory not found! See --workdir param.');

    if(!opt.tech)
      throw new Error('Param --tech is required.')

    var _pluginAction = _env.helpers.plugin.getCmd(cmd, opt.tech)
    if(!_pluginAction){
      throw new Error('#CmdEnv: Action [' + cmd + '] not found! [--tech=' + opt.tech + ']');
    }
    if(_env.helpers.plugin.checkApi(_pluginAction) && _pluginAction.setup(_env)){
      return _pluginAction;
    }else{
      throw new Error('#CmdEnv: An error occurred in the action [' + cmd + '] preparation! [--tech=' + opt.tech + ']');
    }
  }

  /**
   * Run command entry point
   */
  function _run(args){

    // Redirect to help action
    if((args[0]||'') == 'help'){
      _env.helpers.showCmdHelp(_env.meta.cmd, []);
      return;
    }

    var act = su.cmdActions(
      [
        'value|workdir|w',
        'value|tech|t',
        'value|version|v'
      ],
      [
        // Empty action
        [function(opt, args){
          _showUsage();
        }],

        // Checks and installs the prerequisites for informed
        // environment
        ['boot', function(opt, args){
          _createAndCheckCommand('env.boot', _makeOptions(opt)).run(args);
        }],

        // Install a specific version of the environment
        ['install', function(opt, args){
          var _opt = _makeOptions(opt),
              _cmd = _createAndCheckCommand('env.install', _opt);

          if(!opt.version)
            throw new Error('Param --version is required.');

          _cmd.run(_opt.version, args);
        }],

        // Uninstall a specific version of the environment
        ['uninstall', function(opt, args){
          var _opt = _makeOptions(opt),
              _cmd = _createAndCheckCommand('env.uninstall', _opt);

          if(!opt.version)
            throw new Error('Param --version is required.');

          _cmd.run(_opt.version, args);
        }],

        // List all installed versions of the environment
        ['list', function(opt, args){
          _createAndCheckCommand('env.list', _makeOptions(opt)).run(args);
        }],

        // Sets a specific version of the environment for use in the
        // system
        ['use', function(opt, args){
          var _opt = _makeOptions(opt),
              _cmd = _createAndCheckCommand('env.use', _opt);

          if(!opt.version)
            throw new Error('Param --version is required.');

          _cmd.run(_opt.version, args);
        }]
      ]);

    act.run(args);
  }

  command.api = {
    setup: _setup,
    getHelpFile: _getHelpFile,
    run: _run
  }
})();
