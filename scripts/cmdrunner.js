// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(main){ 'use strict'
  // DOC: Windows Script Host   > https://msdn.microsoft.com/pt-br/library/9bbdkx3k.aspx
  //      JScript (ECMAScript3) > https://msdn.microsoft.com/en-us/library/hbxc2t98(v=vs.84).aspx
  //      Windows Scripting     > https://msdn.microsoft.com/en-us/library/bstcxhf7(v=vs.84).aspx
  //      FileSystemObject      > https://msdn.microsoft.com/en-us/library/6kxy1a51(v=vs.84).aspx
  if(typeof WScript != 'object') throw new Error('WSH not detected!');

  // Common prototypes

  // String.trim()
  String.prototype.trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g,'');
  }

  var _fso = new ActiveXObject("Scripting.FileSystemObject"),
      _shell = new ActiveXObject("WScript.Shell"),
      _userPath = _shell.Environment('PROCESS')('USERPROFILE'),
      _productInfo = {
        name: 'E5R Environment',
        cmd: 'e5r',
        version: {
          major: 0,
          minor: 1,
          patch: 0,
          label: 'alpha-2',
          toString:function(){
            return '{MAJOR}.{MINOR}.{PATCH}.{LABEL}'
              .replace('{MAJOR}', this.major)
              .replace('{MINOR}', this.minor)
              .replace('{PATCH}', this.patch)
              .replace('{LABEL}', this.label);
          }
        },
        meta: {
          userPath: _userPath,
          installPath: _userPath + '\\.e5r',
          binPath: _userPath + '\\.e5r\\bin',
          libPath: _userPath + '\\.e5r\\lib',
          hotEnvVarsFileName: _userPath + '\\.e5r\\tmp-hot-envvars.{type}',
          fileRepository: 'https://raw.githubusercontent.com/e5r/env/migrate-to-javascript',
          copyright: '(C) 2014-2015, E5R Development Team. All rights reserved.',
          authors: [
            {name:'Erlimar Silva Campos', email:'erlimar@gmail.com', github:'erlimar'}
          ],
          makeUrl: function(url){
            if(url.indexOf('/') != 0) url = '/' + url;
            return _productInfo.meta.fileRepository + url;
          },
          makePath: function(path){
            path = path.replace('/', '\\');
            if(path.indexOf('\\') != 0) path = '\\' + path;
            return _productInfo.meta.installPath + path;
          },
          getHeaderText: function(){
            var _h = '';
            _h += _productInfo.name + ' v' + _productInfo.version.toString();
            _h += '\n' + _productInfo.meta.copyright;
            _h += '\n';
            return _h;
          }
        }
      },
      _sys = {
        product: _productInfo,
        include: function(fileName){
          var _filePath = _productInfo.meta.libPath + '\\' + fileName,
              content = _fso.OpenTextFile(_filePath, 1).ReadAll(),
              sys = _sys;
          eval(content);
        },
        require: function(fileName){
          var _filePath = _productInfo.meta.libPath + '\\' + fileName,
              module = {},
              content = _fso.OpenTextFile(_filePath, 1).ReadAll(),
              sys = _sys;
          eval(content);
          return module.exports;
        },
        log: function(){
          var _msg = '';
          for(var arg = 0; arg < arguments.length; arg++){
            _msg += _msg.length > 0 ? ' ' : '';
            _msg += arguments[arg];
          }
          if(this === _sys.logTask || this === _sys.logSubTask || this === _sys.logAction){
            this.print(_msg);
            return;
          }
          WScript.Echo(_msg);
        },
        logTask: function(msg){
          _sys.logTask.print = function(msg){
            WScript.Echo('\n----->', msg);
          }
          _sys.log.apply(_sys.logTask, arguments);
        },
        logSubTask: function(){
          _sys.logSubTask.print = function(msg){
            WScript.Echo('     *', msg);
          }
          _sys.log.apply(_sys.logSubTask, arguments);
        },
        logAction: function(){
          _sys.logAction.print = function(msg){
            WScript.Echo('       >', msg);
          }
          _sys.log.apply(_sys.logAction, arguments);
        }
      };

  if(typeof main == 'function'){
    var _args = [];
    for(var a = 0; a < WScript.Arguments.length; a++){
      _args.push(WScript.Arguments.Item(a));
    }
    main(_sys, _args);
  }
})(function(sys, args){

  // Runner Plugin Environment API
  // ---------------------------------------------------------------------------
  // {
  //   helpers: {
  //     getWebFile: function(name, url, path),
  //     showCmdHelp: function(cmd, cmdArgs),
  //     JSON: {
  //       stringify: function(value, replacer, space),
  //       parse: function(text, reviver)
  //     },
  //     plugin: {
  //       getCmd: function(cmd),
  //       checkApi: function(plugin)
  //     }
  //   },
  //   meta: {
  //     cmd: string,
  //     subCmd: string,
  //     cmdPathBase: string,
  //     cmdFilePath: string,
  //     helpPathBase: string
  //   }
  // }
  // ---------------------------------------------------------------------------

  sys.include('third-party/json2.js');

  var fs = sys.require('fsutils.js'),
      web = sys.require('webutils.js'),
      plugin = sys.require('cmdutils.js'),
      _cmd = (args[0]||'').toLowerCase(),
      _subCmd = (args[1]||'').toLowerCase(),
      _cmdArgs = args.concat(),
      _cmdPathBase = fs.combine(sys.product.meta.installPath, 'command'),
      _helpPathBase = fs.combine(sys.product.meta.installPath, 'help');

  _bootstrap();

  // Main usage
  if(!_cmd){
    _mainUsage();
    return;
  }

  // Main help
  if(_cmd == 'help' && !_subCmd){
    _mainHelp();
    return;
  }

  // Command help
  if(_cmd == 'help' && _subCmd){
    _cmdHelp(_subCmd, _cmdArgs);
    return;
  }

  // Command run
  _cmdRun(_cmd, _cmdArgs);

  /**
   * Prepare requirements
   */
  function _bootstrap(){
    _cmdArgs.splice(0, _cmd == 'help' ? 2 : 1);
    if(!fs.directoryExists(_cmdPathBase)){
      fs.createDirectory(_cmdPathBase);
    }
    if(!fs.directoryExists(_helpPathBase)){
      fs.createDirectory(_helpPathBase);
    }
    // Remove previous Hot Environment Variables files
    var hevCmd = sys.product.meta.hotEnvVarsFileName.replace('{type}','cmd'),
        hevPs = sys.product.meta.hotEnvVarsFileName.replace('{type}','ps1');
    if(fs.fileExists(hevCmd)) fs.deleteFile(hevCmd);
    if(fs.fileExists(hevPs)) fs.deleteFile(hevPs);
  }

  /**
   * Print a program header message
   */
  function _printHeader(){
    sys.log(sys.product.meta.getHeaderText());
  }

  /**
   * Print main usage message
   */
  function _mainUsage(){
    _printHeader();
    sys.log('Usage: e5r <command> [options...]');
    sys.log('       Try \'e5r help\' or \'e5r help <command>\' for more information');
  }

  /**
   * Print main help
   */
  function _mainHelp(){
    var _helpFile = 'e5r.help',
        _helpFilePath = fs.combine(_helpPathBase,_helpFile);
    _get(_helpFile, 'resources/help/{name}', 'help/{name}');
    if(!fs.fileExists(_helpFilePath)){
      sys.logTask(_helpFile, 'not found!');
      return;
    }
    var _helpContent = fs.getTextFileContent(_helpFilePath);
    _printHeader();
    sys.log(_helpContent);
  }

  /**
   * Call command help action
   */
  function _cmdHelp(cmd, cmdArgs){
    var _cmdApi = plugin.getCmd(cmd);
    if(!_cmdApi){
      sys.logTask('Command ', cmd, 'not found!');
      return;
    }
    if(plugin.checkApi(_cmdApi)){
      if(typeof _cmdApi.getHelpFile != 'function'){
        throw new Error('Command [' + cmd + '] has no help information!');
        return;
      }
      var _helpFile = _cmdApi.getHelpFile(),
          _helpFilePath = fs.combine(_helpPathBase,_helpFile);
      _get(_helpFile, 'resources/help/{name}', 'help/{name}');
      if(!fs.fileExists(_helpFilePath)){
        throw new Error(_helpFile + ' not found!');
        return;
      }
      var _helpContent = fs.getTextFileContent(_helpFilePath);
      _printHeader();
      sys.log(_helpContent);
    }
  }

  /**
   * Run the command
   */
  function _cmdRun(cmd, cmdArgs){
    var _cmdApi = plugin.getCmd(cmd),
        _runnerEnv = {
          helpers: {
            getWebFile: _get,
            showCmdHelp: _cmdHelp,
            JSON: JSON,
            plugin: plugin
          },
          meta: {
            cmd: _cmd,
            subCmd: _subCmd,
            cmdPathBase: _cmdPathBase,
            cmdFilePath: fs.combine(_cmdPathBase, '{c}.js'.replace('{c}', cmd)),
            helpPathBase: _helpPathBase
          }
        };
    if(!_cmdApi){
      sys.logTask('Command ', cmd, 'not found!');
      return;
    }
    if(plugin.checkApi(_cmdApi) && _cmdApi.setup(_runnerEnv))
      _cmdApi.run(cmdArgs);
  }

  /**
   * Get a web file
   */
  function _get(name, url, path){
    var _url = url,
        _path = path;
    if(_url.indexOf('http') != 0){
      _url = sys.product.meta.makeUrl(url.replace('{name}', name)),
      _path = sys.product.meta.makePath(path.replace('{name}', name));
    }
    if(!fs.fileExists(_path)){
      web.download(_url, _path, function(error){
        sys.log('#' + error.name + ':', error.message, 'on get resource', name);
      })
    }
  }
});
