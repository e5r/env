// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(main){ 'use strict'
  // DOC: https://technet.microsoft.com/pt-br/library/ff920171(v=ws.10).aspx
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
            WScript.Echo('     >', msg);
          }
          _sys.log.apply(_sys.logSubTask, arguments);
        },
        logAction: function(){
          _sys.logAction.print = function(msg){
            WScript.Echo('      ', msg);
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
  var su = sys.require('sysutils.js'),
      fs = sys.require('fsutils.js'),
      web = sys.require('webutils.js'),
      hasError = false;

  sys.log(sys.product.name, 'v' + sys.product.version.toString());
  sys.log(sys.product.meta.copyright);

  function _downloadFile(name, url, path, force){
    var _url = sys.product.meta.makeUrl(url.replace('{name}', name)),
        _path = sys.product.meta.makePath(path.replace('{name}', name));
    if(force || !fs.fileExists(_path)){
      sys.logSubTask('Acquiring ' + name + '...');
      return web.download(_url, _path, function(error){
        hasError = true;
        sys.logAction('#' + error.name + ':', error.message);
      })
    }
  }

  sys.logTask('Installing dependencies');

  _downloadFile('e5r.cmd', 'scripts/{name}', 'bin/{name}', true);
  _downloadFile('cmdrunner.js', 'scripts/{name}', 'lib/{name}', true);
  _downloadFile('sysutils.js', 'scripts/{name}', 'lib/{name}', false);
  _downloadFile('fsutils.js', 'scripts/{name}', 'lib/{name}', false);
  _downloadFile('pkgutils.js', 'scripts/{name}', 'lib/{name}', true);
  _downloadFile('webutils.js', 'scripts/{name}', 'lib/{name}', false);

  if(hasError){
    sys.logTask('Errors occurred during installation');
    sys.logSubTask('look for technical support!');
  }else{
    sys.logTask('E5R Environment successfully installed!');
    sys.logAction('run the command `e5r help` and know how to use the environment.');
  }
});
