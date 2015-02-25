// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(main){ 'use strict'
  // DOC: https://msdn.microsoft.com/pt-br/library/9bbdkx3k.aspx
  if(typeof WScript != 'object') throw new Error('WSH not detected!');

  var _fso = new ActiveXObject("Scripting.FileSystemObject"),
      _shell = new ActiveXObject("WScript.Shell"),
      _userPath = _shell.Environment('PROCESS')('USERPROFILE'),
      _productInfo = {
        name: 'E5R Environment',
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
          fileRepository: 'https://raw.githubusercontent.com/e5r/env/migrate-to-javascript',
          makeUrl: function(url){
            if(url.indexOf('/') != 0) url = '/' + url;
            return _productInfo.meta.fileRepository + url;
          },
          makePath: function(path){
            path = path.replace('/', '\\');
            if(path.indexOf('\\') != 0) path = '\\' + path;
            return _productInfo.meta.installPath + path;
          },
          copyright: '(C) 2014-2015, E5R Development Team. All rights reserved.',
          authors: [
            {name:'Erlimar Silva Campos', email:'erlimar@gmail.com', github:'erlimar'}
          ]
        }
      },
      _sys = {
        product: _productInfo,
        include: function(filePath){
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
  var fs = sys.require('fsutils.js'),
      web = sys.require('webutils.js'),
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
  sys.logTask('e5r [' + _cmd + '] run');

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
  }

  /**
   * Print main usage message
   */
  function _mainUsage(){
    sys.logTask('e5r usage');
  }

  /**
   * Print main help
   */
  function _mainHelp(){
    var _helpFile = 'e5r.help';
    _get(_helpFile, 'resources/help/{name}', 'help/{name}');
    if(!fs.fileExists(fs.combine(_helpPathBase,_helpFile))){
      sys.logTask(_helpFile, 'not found!');
    }
  }

  /**
   * Call command help action
   */
  function _cmdHelp(cmd, cmdArgs){
    sys.logTask('e5r help [' + cmd + ']');
  }

  function _get(name, url, path){
    var _url = sys.product.meta.makeUrl(url.replace('{name}', name)),
        _path = sys.product.meta.makePath(path.replace('{name}', name));
    if(!fs.fileExists(_path)){
      web.download(_url, _path, function(error){
        sys.log('#' + error.name + ':', error.message, 'on get resource', name);
      })
    }
  }
});
