// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(main){ 'use strict'
  // DOC: https://technet.microsoft.com/pt-br/library/ff920171(v=ws.10).aspx
  if(typeof WScript != 'object') throw new Error('WSH not detected!');

  var _fso = new ActiveXObject("Scripting.FileSystemObject"),
      _sys = {
        include: function(filePath){
          var content = _fso.OpenTextFile(filePath, 1).ReadAll();
          eval(content);
        },
        require: function(filePath){
          var module = {},
              content = _fso.OpenTextFile(filePath, 1).ReadAll();
          eval(content);
          return module.exports;
        },
        log: function(){
          var msg = '';
          for(var arg = 0; arg < arguments.length; arg++){
            msg += msg.length > 0 ? ' ' : '';
            msg += arguments[arg];
          }
          WScript.Echo(msg);
        }
      };
  _sys.console = {
    log: _sys.log
  };

  if(typeof main == 'function'){
    main(_sys, WScript.Arguments);
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
