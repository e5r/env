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
   * Run command entry point
   */
  function _run(args){

    // Redirect to help action
    if((args[0]||'') == 'help'){
      _env.helpers.showCmdHelp(_env.meta.cmd, []);
      return;
    }

    /**
     * Creates a new object based on another
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
          var _opt = _makeOptions(opt);

          if(!fs.directoryExists(_opt.workdir))
            throw new Error('Work directory not found! See --workdir param.');

          if(!_opt.tech)
            throw new Error('Param --tech is required.')

          var _url = 'scripts/tech/{t}/{name}'.replace('{t}', _opt.tech),
              _path = 'lib\\tech\\{t}\\{name}'.replace('{t}', _opt.tech);

          _env.helpers.getWebFile('boot.js', _url, _path);

          _path = sys.product.meta.makePath(_path.replace('{name}','boot.js'));

          if(!fs.fileExists(fs.absolutePath(_path))){
            throw new Error('Action [boot] not found! [--tech=' + _opt.tech + ']');
          }

          sys.logTask('Running', _path, args);
          var _pluginAction = plugin.getCmd(cmd, _opt.tech)
          if(!_pluginAction){
            sys.logTask('Action [env/boot] not found!');
            return;
          }
          if(plugin.checkApi(_pluginAction) && _cmdApi.setup(_env))
            _pluginAction.run(args);
        }],

        // Install a specific version of the environment
        ['install', function(opt, args){
          sys.logSubTask('INSTALL action');
          sys.log(_env.helpers.JSON.stringify(opt, null, 2));
          sys.log(_env.helpers.JSON.stringify(args, null, 2));
        }],

        // Uninstall a specific version of the environment
        ['uninstall', function(opt, args){
          sys.logSubTask('UNINSTALL action');
          sys.log(_env.helpers.JSON.stringify(opt, null, 2));
          sys.log(_env.helpers.JSON.stringify(args, null, 2));
        }],

        // List all installed versions of the environment
        ['list', function(opt, args){
          sys.logSubTask('LIST action');
          sys.log(_env.helpers.JSON.stringify(opt, null, 2));
          sys.log(_env.helpers.JSON.stringify(args, null, 2));
        }],

        // Sets a specific version of the environment for use in the
        // system
        ['use', function(opt, args){
          sys.logSubTask('USE action');
          sys.log(_env.helpers.JSON.stringify(opt, null, 2));
          sys.log(_env.helpers.JSON.stringify(args, null, 2));
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
