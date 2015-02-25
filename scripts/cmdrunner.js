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
  var su = sys.require('sysutils.js');

  sys.log('Host: ' + su.host.name + ' v' + su.host.version + '(' + su.host.build + ')');
  sys.log(' > ExecPath: ' + su.host.execPath);
  sys.log(' > ExecDirectory: ' + su.host.execDirectory);

  sys.log('\nScript: ' + su.script.name);
  sys.log(' > File: ' + su.script.file );
  sys.log(' > Directory: ' + su.script.directory );

  sys.log('\n%USERPROFILE%: ' + su.buildEnvString('%USERPROFILE%'));

  sys.log('\nNet: ');
  sys.log(' > Domain: ' + su.net.domain);
  sys.log(' > User: ' + su.net.user);
  sys.log(' > Computer: ' + su.net.computer);
  sys.log(' > Drives: ' + (su.net.drives.length > 0 ? '' : '[no drives mapped]'));
  for(var d in su.net.drives){
    var _drive = su.net.drives[d];
    sys.log('   - Drive: ' + _drive.drive + ', Path: ' + _drive.path);
  }
  sys.log(' > Printers: ' + (su.net.printers.length > 0 ? '' : '[no printers mapped]'));
  for(var p in su.net.printers){
    var _printer = su.net.printers[p];
    sys.log('   - Id: ' + _printer.id + ', Name: ' + _printer.name);
  }

  sys.log('\nEnvironment:');
  sys.log(' > Process.MYVAR: ' + su.getEnvironment('MYVAR', su.CONST.ENVTYPE_PROCESS));
  sys.log(' > User.MYVAR: ' + su.getEnvironment('MYVAR', su.CONST.ENVTYPE_USER));
  sys.log(' > System.MYVAR: ' + su.getEnvironment('MYVAR', su.CONST.ENVTYPE_SYSTEM));
  sys.log(' > MYVAR: ' + su.getEnvironment('MYVAR'));
});
