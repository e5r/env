// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.web = sys.require('webutils.js');
  _.su = sys.require('sysutils.js');
  _.fs = sys.require('fsutils.js');

  _.getCmd = function(cmd, tech){
    var _path = _.fs.combine(sys.product.meta.installPath, (tech ? 'lib\\tech\\' + tech : 'command') + '\\{c}.js'.replace('{c}',cmd))
        _url = sys.product.meta.makeUrl((tech ? 'scripts/tech/' + tech : 'scripts/command') + '/{c}.js'.replace('{c}', cmd)),
        command = {},
        content;
    if(!_.fs.fileExists(_path)){
      _.web.download(_url, _path, function(error){
        sys.log('#' + error.name + ':', error.message, 'on get command <{c}>.'.replace('{c}', (tech ? tech + '/' + cmd : cmd)));
      })
    }
    if(_.fs.fileExists(_path)){
      content = _fso.OpenTextFile(_path, 1).ReadAll();
      eval(content);
    }
    return command.api;
  }

  /**
   * Checks the integrity of the plugin api
   *
   * @param {object} plugin Object of plugin, returned by _.getCmd
   *
   * @return TRUE if ok, throw exception if not ok
   */
  _.checkApi = function(plugin){
    if(typeof plugin != 'object')
      throw new Error('<cmdutils.checkApi>: Plugin must be an object.');

    if(typeof plugin.setup != 'function')
      throw new Error('<cmdutils.checkApi>: Plugin does not contain the [Setup] method.');

    if(typeof plugin.getHelpFile != 'function' && typeof plugin.getHelpFile != 'undefined')
      throw new Error('<cmdutils.checkApi>: Plugin does not contain the [GetHelpFile] method.');

    if(typeof plugin.run != 'function')
      throw new Error('<cmdutils.checkApi>: Plugin does not contain the [Run] method.');

    return true;
  }

  /**
   * Create a command actions runner descriptor.
   *
   * @param {array} options   List of options arguments
   *
   * Ex1:    ['value|version|v','value|path|p']
   *
   * Usage: e5r <cmd> -v 1.0       | e5r <cmd> --version 1.0
   *        e5r <cmd> -p "path/to" | e5r <cmd> --path "path/to"
   *
   *        {version:'1.0', path:null}
   *        {version:null, path:'path/to'}
   *
   * Ex2:   ['switch|test|t,T']
   *
   * Usage: e5r <cmd> --test --other "value param"
   *        e5r <cmd> --other "value param"
   *        e5r <cmd> --T
   *
   *        {test: true, other:'value param'}
   *        {test: false, other:'value param'}
   *        {test: true, other:null}
   *
   * @param {array} actions   List of actions to execute
   *
   * @return Command Action Descriptor object
   */
  _.createCmdActionsDescriptor = function(options, actions){
    if(!Array.isArray(options)){
      throw new Error('<sysutils.createCmdActionsDescriptor> #ArgumentException: @options must be an Array.');
    }
    if(!Array.isArray(actions)){
      throw new Error('<sysutils.createCmdActionsDescriptor> #ArgumentException: @actions must be an Array.');
    }
    for(var a in actions){
      if(!Array.isArray(actions[a])){
        throw new Error('<sysutils.createCmdActionsDescriptor> #ArgumentException: @actions['+a+'] must be an Array.');
      }
    }

    return {
      __options: options,
      __actions: actions,

      __getAction: function(act){
        for(var _act in this.__actions){
          var _actObj = this.__actions[_act],
              _actName = _actObj.length > 1 ? (_actObj[0]||null) : '',
              _actCbck = _actObj.length > 1 ? (_actObj[1]||null) : (_actObj[0]||null);
          if(typeof _actName != 'string' || typeof _actCbck != 'function')
            throw new Error('<sysutils.createCmdActionsDescriptor.getAction>: Invalid action signature.');
          if(_actName === act)
            return _actCbck;
        }
        return null;
      },

      __describe: function(n){
        for(var o in this.__options){
          var oArray = this.__options[o].split('|'),
              oType = (oArray[0]||null),
              oName = (oArray[1]||null),
              oAliases = (oArray[2]||'').split(','),
              _n = '',
              _isNamed = false;
          if(oType == null || oName == null){
            throw new Error('<sysutils.createCmdActionsDescriptor.__describe>: Invalid option syntax.');
          }
          for(var c = 0; c < n.length; c++){
            if(c < 2 && n.charAt(c)=='-') continue;
            _n += n.charAt(c);
          }
          _isNamed = (n.length == 2 && n.charAt(0) == '-' && n.charAt(1) != '-') ||
                     (n.length > 2 && n.charAt(0) == '-' && n.charAt(1) == '-');
          if(!_isNamed) continue;
          if(oName == _n || Array.contains(oAliases,_n)){
            return {
              type: oType.toLowerCase(),
              name: oName
            }
          }
        }
        return null;
      },

      run:function(args){
        var _opts = {},
            _args = [],
            _pIdx = 0;
        // Options informed in params
        while(_pIdx < args.length){
          var param = args[_pIdx],
              nextParam = (args[_pIdx+1]||null),
              descriptor = this.__describe(param);
          if(!descriptor){
            _args.push(param);
            _pIdx++;
            continue;
          }
          if(descriptor.type == 'switch'){
            _opts[descriptor.name] = true;
          }
          if(descriptor.type == 'value'){
            if(nextParam != null && nextParam.charAt(0) != '-'){
              _opts[descriptor.name] = nextParam;
              _pIdx++;
            }else{
              _opts[descriptor.name] = null;
            }
          }
          _pIdx++;
        }
        // Not informed options
        for(var _iO in this.__options){
          var _optObj = this.__options[_iO].split('|'),
              _optType = _optObj[0]||null,
              _optName = _optObj[1]||null;
          if(!(_optName in _opts))
            _opts[_optName] = _optType == 'switch' ? false : null;
        }
        // Detect action name and others parameters
        var _actionName = _args[0]||'',
            _actionCallback = this.__getAction(_actionName),
            _newArgs = [];
        if(_actionName) for(var a = 1; a < _args.length;a++)
          _newArgs.push(_args[a]);

        if(typeof _actionCallback == 'function'){
          _actionCallback(_opts, _newArgs);
          return true;
        }

        return false;
      }
    }
  }

  /**
   * Checks and make options data
   *
   * @param {object} opt  Original options
   *
   * @return Clone of opt with modified data
   */
  _.makeOptions = function(opt){
    var _opt = Object.copy(opt);

    if(!_opt.workdir) _opt.workdir = _.su.script.currentDirectory;

    if((_opt.workdir||'').length > 0 && (_opt.workdir||'').charAt(0) == '$'){
      var _home = _.su.getEnvironment('E5R_HOME', _.su.CONST.ENVTYPE_PROCESS);
      if(!_home) _home = sys.product.meta.userPath;
      _opt.workdir = _opt.workdir.replace('$', _home);
    }

    if(_opt.workdir) _opt.workdir = _.fs.absolutePath(_.su.buildEnvString(_opt.workdir));

    if(!_.fs.directoryExists(_opt.workdir)) _.fs.createDirectory(_opt.workdir);

    if(!_opt.tech){
      var _file = _.fs.absolutePath(_.fs.combine(_opt.workdir, '.e5r\\tech'));
      if(_.fs.fileExists(_file)) _opt.tech = _.fs.getTextFileContent(_file).trim();
    }

    if(!_opt.version){
      var _file = _.fs.absolutePath(_.fs.combine(_opt.workdir, '.e5r\\version'));
      if(_.fs.fileExists(_file)) _opt.version = _.fs.getTextFileContent(_file).trim();
    }

    return _opt;
  }

  /**
   * Create and check prerequisites for command
   *
   * @param {string} cmd  The command name
   * @param {object} opt  The options
   *
   * @return Command object
   */
  _.createAndCheckCommand = function(env, cmd, opt){
    if(!_.fs.directoryExists(opt.workdir))
      throw new Error('Work directory not found! See --workdir param.');

    if(!opt.tech)
      throw new Error('Param --tech is required.')

    var _pluginAction = _.getCmd(cmd, opt.tech)
    if(!_pluginAction){
      throw new Error('#CmdEnv: Action [' + cmd + '] not found! [--tech=' + opt.tech + ']');
    }
    if(_.checkApi(_pluginAction) && _pluginAction.setup(env)){
      return _pluginAction;
    }else{
      throw new Error('#CmdEnv: An error occurred in the action [' + cmd + '] preparation! [--tech=' + opt.tech + ']');
    }
  }

  module.exports = {
    getCmd: _.getCmd,
    checkApi: _.checkApi,
    cmdActions: _.createCmdActionsDescriptor,
    makeOptions: _.makeOptions,
    createAndCheckCommand: _.createAndCheckCommand
  }
})({});
