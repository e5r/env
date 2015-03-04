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
    return 'cmd.skeleton.help';
  }

  /**
   * Show usage information message
   */
  function _showUsage(){
    sys.log(sys.product.meta.getHeaderText());
    sys.log('Usage:', sys.product.cmd, 'skeleton <command> [options...]');
    sys.log('      ', 'Try \'' + sys.product.cmd, 'help skeleton\' for more information.');
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

    // 1. Se --workdir não existe, usa o diretório atual
    if(!_opt.workdir) _opt.workdir = su.script.currentDirectory;

    // 2. Se --workdir inicia com '$', substituir pelo diretório %E5R_HOME% ou %USERPROFILE%
    if((_opt.workdir||'').length > 0 && (_opt.workdir||'').charAt(0) == '$'){
      var _home = su.getEnvironment('E5R_HOME', su.CONST.ENVTYPE_PROCESS);
      if(!_home) _home = sys.product.meta.userPath;
      _opt.workdir = _opt.workdir.replace('$', _home);
    }

    // 3. Expandir --workdir
    if(_opt.workdir) _opt.workdir = fs.absolutePath(su.buildEnvString(_opt.workdir));

    // 4. Se diretório --workdir não existir, Criar
    if(!fs.directoryExists(_opt.workdir)) fs.createDirectory(_opt.workdir);

    // 5. Se --tech não existe, procura pelo conteúdo do arquivo --workdir/.e5r/tech
    if(!_opt.tech){
      var _file = fs.absolutePath(fs.combine(_opt.workdir, '.e5r\\tech'));
      if(fs.fileExists(_file)) _opt.tech = fs.getTextFileContent(_file);
    }

    // 6. Se --version não existe, procura pelo conteúdo do arquivo --workdir/.e5r/version
    if(!_opt.version){
      var _file = fs.absolutePath(fs.combine(_opt.workdir, '.e5r\\version'));
      if(fs.fileExists(_file)) _opt.version = fs.getTextFileContent(_file);
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
        'value|license|l'
      ],
      [
        // Empty action
        [function(opt, args){
          _showUsage();
        }],

        // Initializes a directory with the skeleton of a project
        ['init', function(opt, args){
          var _opt = _makeOptions(opt);
          _createAndCheckCommand('skeleton.init', _opt)
            .run(_opt, args);
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
