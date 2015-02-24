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
    getEnvironment: _getEnvironment
  }
})();
