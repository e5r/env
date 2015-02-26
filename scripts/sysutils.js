// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'
  var _shell = new ActiveXObject("WScript.Shell"),
      _network = new ActiveXObject("WScript.Network"),
      _drivers = _network.EnumNetworkDrives(),
      _printers = _network.EnumPrinterConnections(),
      _consts = {
        ENVTYPE_PROCESS: 'PROCESS',
        ENVTYPE_USER: 'USER',
        ENVTYPE_SYSTEM: 'SYSTEM'
      },
      _host = {
        name: WScript.Name,
        version: WScript.Version,
        build: WScript.BuildVersion,
        execPath: WScript.FullName,
        execDirectory: WScript.Path
      },
      _script = {
        name: WScript.ScriptName,
        file: WScript.ScriptFullName,
        directory: _shell.CurrentDirectory
      },
      _net = {
        domain: _network.UserDomain,
        user: _network.UserName,
        computer: _network.ComputerName,
        drives: (function(){
          var _result = [];
          for(i = 0; i < _drivers.length; i += 2) {
            _result.push({drive: _drivers.Item(i), path: _drivers.Item(i+1)});
          }
          return _result;
        })(),
        printers: (function(){
          var _result = [];
          for(i = 0; i < _printers.length; i += 2) {
            _result.push({id: _printers.Item(i), name: _printers.Item(i+1)});
          }
          return _result;
        })()
      };

  /**
   * Get a maker for environment variables of process data
   *
   * @return function
   */
  function _getterProcessEnv(){
    return _shell.Environment(_consts.ENVTYPE_PROCESS);
  }

  /**
   * Get a maker for environment variables of user data
   *
   * @return function
   */
  function _getterUserEnvironment(){
    return _shell.Environment(_consts.ENVTYPE_USER);
  }

  /**
   * Get a maker for environment variables of system data
   *
   * @return function
   */
  function _getterSystemEnvironment(){
    return _shell.Environment(_consts.ENVTYPE_SYSTEM);
  }

  /**
   * Awaits X miliseconds
   *
   * @param {int} miliseconds Number of miliseconds to wait
   */
  function _sleep(miliseconds){
    WScript.Sleep(miliseconds);
  }

  /**
   * Build a string, expandding a environment variable names.
   *
   * @param {string} envString  String to expand
   *
   * @return New string with environment variable expandded.
   */
  function _buildEnvirementString(envString){
    return _shell.ExpandEnvironmentStrings(envString);
  }

  /**
   * Get a environment variable value.
   *
   * @param {string}  varName   Name of environment variable
   * @param {ENVTYPE} envType   Type of environment
   *
   * @return Value os variable or empty string if not found.
   */
  function _getEnvironment(varName, envType){
    var _getEnv,
        envType = envType || _consts.ENVTYPE_PROCESS;
    if(envType == _consts.ENVTYPE_SYSTEM){
      _getEnv = _getterSystemEnvironment();
    }else if(envType == _consts.ENVTYPE_USER){
      _getEnv = _getterUserEnvironment();
    }else{
      _getEnv = _getterProcessEnv();
    }
    return _getEnv(varName);
  }

  /**
   * Set a environment variable value.
   *
   * @param {string}  varName   Name of environment variable
   * @param {string}  varValue  Value os environment variable
   * @param {ENVTYPE} envType   Type of environment
   *
   * @return Value os variable or empty string if not found.
   */
  function _setEnvironment(varName, varValue, envType){
    var _getEnv,
        envType = envType || _consts.ENVTYPE_PROCESS;
    if(envType == _consts.ENVTYPE_SYSTEM){
      _getEnv = _getterSystemEnvironment();
    }else if(envType == _consts.ENVTYPE_USER){
      _getEnv = _getterUserEnvironment();
    }else{
      _getEnv = _getterProcessEnv();
    }
    _getEnv(varName) = varValue;
    return _getEnv(varName);
  }

  /**
   * Checks if @v is a valid Array object
   */
  function _isArray(v){
    return (v.length && typeof v != 'string');
  }

  /**
   * Checks if @a contains @v
   */
  function _inArray(a,v){
    for(var i in a){
      if(a[i] == v) return true;
    }
    return false;
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
  function _createCmdActionsDescriptor(options, actions){
    if(!_isArray(options)){
      throw new Error('<sysutils._createCmdActionsDescriptor> #ArgumentException: @options must be an Array.');
    }
    if(!_isArray(actions)){
      throw new Error('<sysutils._createCmdActionsDescriptor> #ArgumentException: @actions must be an Array.');
    }
    for(var a in actions){
      if(!_isArray(actions[a])){
        throw new Error('<sysutils._createCmdActionsDescriptor> #ArgumentException: @actions['+a+'] must be an Array.');
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
            throw new Error('<sysutils._createCmdActionsDescriptor.__getAction>: Invalid action signature.');
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
            throw new Error('<sysutils._createCmdActionsDescriptor.__describe>: Invalid option syntax.');
          }
          for(var c = 0; c < n.length; c++){
            if(c < 2 && n.charAt(c)=='-') continue;
            _n += n.charAt(c);
          }
          _isNamed = (n.length == 2 && n.charAt(0) == '-' && n.charAt(1) != '-') ||
                     (n.length > 2 && n.charAt(0) == '-' && n.charAt(1) == '-');
          if(!_isNamed) continue;
          if(oName == _n || _inArray(oAliases,_n)){
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

        if(typeof _actionCallback == 'function')
          _actionCallback(_opts, _newArgs);
      }
    }
  }

  module.exports = {
    CONST: _consts,
    stdErr: WScript.StdErr,
    stdIn: WScript.StdIn,
    stdOut: WScript.StdOut,

    host: _host,
    script: _script,
    net: _net,

    sleep: _sleep,
    buildEnvString: _buildEnvirementString,
    getEnvironment: _getEnvironment,
    setEnvironment: _setEnvironment,
    cmdActions: _createCmdActionsDescriptor
  }
})();
