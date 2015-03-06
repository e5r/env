// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.shell = new ActiveXObject("WScript.Shell");
  _.network = new ActiveXObject("WScript.Network");
  _.drivers = _.network.EnumNetworkDrives();
  _.printers = _.network.EnumPrinterConnections();
  _.CONSTS = {
    ENVTYPE_PROCESS: 'PROCESS',
    ENVTYPE_USER: 'USER',
    ENVTYPE_SYSTEM: 'SYSTEM'
  };
  _.host = {
    name: WScript.Name,
    version: WScript.Version,
    build: WScript.BuildVersion,
    execPath: WScript.FullName,
    execDirectory: WScript.Path
  };
  _.script = {
    name: WScript.ScriptName,
    file: WScript.ScriptFullName,
    currentDirectory: _.shell.CurrentDirectory
  };
  _.net = {
    domain: _.network.UserDomain,
    user: _.network.UserName,
    computer: _.network.ComputerName,
    drives: (function(){
      var _result = [];
      for(i = 0; i < _.drivers.length; i += 2) {
        _result.push({drive: _.drivers.Item(i), path: _.drivers.Item(i+1)});
      }
      return _result;
    })(),
    printers: (function(){
      var _result = [];
      for(i = 0; i < _.printers.length; i += 2) {
        _result.push({id: _.printers.Item(i), name: _.printers.Item(i+1)});
      }
      return _result;
    })()
  };
  // Minimalist copy of <fsutils.js>.
  // You are here not to cause circular reference, because <fsutils.js>
  // refers to <sysutils.js>.
  _.fs = {
    absolutePath: function(path){
      return _fso.GetAbsolutePathName(path);
    },
    createTextFile: function(path, overwrite, unicode){
      overwrite = overwrite || false;
      unicode = unicode || false;
      return _fso.CreateTextFile(this.absolutePath(path), overwrite, unicode);
    },
    fileExists: function(path){
      var _path = this.absolutePath(path);
      return _fso.FileExists(_path);
    },
    getArrayFileContent: function(path){
      var _file = _fso.OpenTextFile(this.absolutePath(path), 1),
          _content = [];
      while(!_file.AtEndOfStream)
        _content.push(_file.ReadLine());
      _file.Close();
      return _content;
    }
  };

  /**
   * Get a maker for environment variables of process data
   *
   * @return function
   */
  _.getterProcessEnv = function(){
    return _.shell.Environment(_.CONSTS.ENVTYPE_PROCESS);
  }

  /**
   * Get a maker for environment variables of user data
   *
   * @return function
   */
  _.getterUserEnvironment = function(){
    return _.shell.Environment(_.CONSTS.ENVTYPE_USER);
  }

  /**
   * Get a maker for environment variables of system data
   *
   * @return function
   */
  _.getterSystemEnvironment = function(){
    return _.shell.Environment(_.CONSTS.ENVTYPE_SYSTEM);
  }

  /**
   * Awaits X miliseconds
   *
   * @param {int} miliseconds Number of miliseconds to wait
   */
  _.sleep = function(miliseconds){
    WScript.Sleep(miliseconds);
  }

  /**
   * Build a string, expandding a environment variable names.
   *
   * @param {string} envString  String to expand
   *
   * @return New string with environment variable expandded.
   */
  _.buildEnvirementString = function(envString){
    return _.shell.ExpandEnvironmentStrings(envString);
  }

  /**
   * Get a environment variable value.
   *
   * @param {string}  varName   Name of environment variable
   * @param {ENVTYPE} envType   Type of environment
   *
   * @return Value os variable or empty string if not found.
   */
  _.getEnvironment = function(varName, envType){
    var _getEnv,
        envType = envType || _.CONSTS.ENVTYPE_PROCESS;
    if(envType == _.CONSTS.ENVTYPE_SYSTEM){
      _getEnv = _.getterSystemEnvironment();
    }else if(envType == _.CONSTS.ENVTYPE_USER){
      _getEnv = _.getterUserEnvironment();
    }else{
      _getEnv = _.getterProcessEnv();
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
  _.setEnvironment = function(varName, varValue, envType){
    var _getEnv,
        envType = envType || _.CONSTS.ENVTYPE_PROCESS;
    if(envType == _.CONSTS.ENVTYPE_SYSTEM){
      _getEnv = _.getterSystemEnvironment();
    }else if(envType == _.CONSTS.ENVTYPE_USER){
      _getEnv = _.getterUserEnvironment();
    }else if(envType == _.CONSTS.ENVTYPE_PROCESS){
      _getEnv = _.getterProcessEnv();
    }else{
      throw new Error('<sysutils.setEnvironment> #ArgumentException: Invalid @envType.');
    }
    _getEnv(varName) = varValue;

    // Creating a POSTFILE to update environment on parent process
    if(envType == _.CONSTS.ENVTYPE_PROCESS){
      function __(fileType, tmplSearch, tmplReplace, key, value){
        var _path = sys.product.meta.hotEnvVarsFileName.replace('{type}', fileType),
            _fileContent = [],
            _tmpContent,
            _file;
        if(_.fs.fileExists(_path)){
          _tmpContent = _.fs.getArrayFileContent(_path);
          for(var l in _tmpContent){
            var _line = _tmpContent[l];
            if(_line.indexOf(tmplSearch.replace('{k}', key)) == 0) continue;
            _fileContent.push(_line);
          }
        }
        _fileContent.push(tmplReplace.replace('{k}', key).replace('{v}', value));
        _file = _.fs.createTextFile(_path, true);
        for(var l in _fileContent){
          _file.WriteLine(_fileContent[l]);
        }
        _file.Close();
      }
      __('cmd', 'set {k}=', 'set {k}={v}', varName, varValue);
      __('ps1', '$env:{k}=', '$env:{k}="{v}"', varName, varValue.replace(/"/g, '`"'));
    }
    return _getEnv(varName);
  }

  /**
   * Exec a program
   *
   * @param {string}    program   A program name
   * @param {array}     args      Argument list
   * @param {function}  output    Callback to execute on output line
   *
   * @return Exit code
   */
  _.exec = function(program, args, output){
    var _process,
        _output = [],
        _strArgs = '';
    for(var _a in args){
      _strArgs += _strArgs.length > 0 ? ' ' : '';
      if(args[_a].indexOf(' ') >= 0)
        _strArgs += "'" + args[_a] + "'";
      else
        _strArgs += args[_a];
    }
    _process = _.shell.Exec('{p} {a}'.replace('{p}', program).replace('{a}', _strArgs));
    while(true){
      if(!_process.StdOut.AtEndOfStream){
        var _line = _process.StdOut.ReadLine();
        if(typeof output == 'function') output(_line);
        _output.push(_line);
      }else{
        break;
      }
    }
    return _process.ExitCode;
  }

  module.exports = {
    CONST: _.CONSTS,
    stdErr: WScript.StdErr,
    stdIn: WScript.StdIn,
    stdOut: WScript.StdOut,

    host: _.host,
    script: _.script,
    net: _.net,

    sleep: _.sleep,
    buildEnvString: _.buildEnvirementString,
    getEnvironment: _.getEnvironment,
    setEnvironment: _.setEnvironment,
    exec: _.exec
  }
})({});
