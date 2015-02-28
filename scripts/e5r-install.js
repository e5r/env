// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(main){ 'use strict'
  // DOC: Windows Script Host   > https://msdn.microsoft.com/pt-br/library/9bbdkx3k.aspx
  //      JScript (ECMAScript3) > https://msdn.microsoft.com/en-us/library/hbxc2t98(v=vs.84).aspx
  //      Windows Scripting     > https://msdn.microsoft.com/en-us/library/bstcxhf7(v=vs.84).aspx
  if(typeof WScript != 'object') throw new Error('WSH not detected!');

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
  var su = sys.require('sysutils.js'),
      fs = sys.require('fsutils.js'),
      web = sys.require('webutils.js'),
      hasError = false,
      tasks = {
        stack: [],
        add: function(c,f){
          tasks.stack.push({category:c,func:f});
        },
        run:function(){
          if(tasks.stack.length < 1) return;
          var _running = 0,
              _category = tasks.stack[_running].category,
              _next = function(){
                if(++_running > tasks.stack.length - 1) return;
                var _task = tasks.stack[_running];
                if(_category != _task.category){
                  _category = _task.category;
                  sys.log();
                  sys.logSubTask(_category);
                }
                _task.func(_next);
              };
          sys.log();
          sys.logSubTask(_category);
          tasks.stack[_running].func(_next);
        }
      };

  tasks.add('Acquiring dependencies', function(next){
    if(_get('e5r.cmd', 'scripts/{name}', 'bin/{name}')){
      next();
    }
  });

  tasks.add('Acquiring dependencies', function(next){
    if(_get('e5r.ps1', 'scripts/{name}', 'bin/{name}')){
      next();
    }
  });

  tasks.add('Acquiring dependencies', function(next){
    if(_get('cmdrunner.js', 'scripts/{name}', 'lib/{name}')){
      next();
    }
  });

  tasks.add('Acquiring dependencies', function(next){
    if(_get('pkgutils.js', 'scripts/{name}', 'lib/{name}')){
      next();
    }
  });

  tasks.add('Acquiring dependencies', function(next){
    if(_get('cmdutils.js', 'scripts/{name}', 'lib/{name}')){
      next();
    }
  });

  tasks.add('Acquiring dependencies', function(next){
    if(_get('json2.js', 'third-party-lib/{name}', 'lib/third-party/{name}')){
      next();
    }
  });

  tasks.add('Updating environment variable PATH', function(next){
    sys.logAction('Cleaning previous installations...');
    var _userPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_USER) || '').split(';'),
        _processPath = (su.getEnvironment('PATH', su.CONST.ENVTYPE_PROCESS) || '').split(';')
        _userNewPath = '',
        _procesNewPath = '';
    for(var p in _userPath){
      var _v = _userPath[p];
      if(_v.indexOf(sys.product.meta.installPath) == 0) continue;
      _userNewPath += _userNewPath.length > 0 ? ';' : '';
      _userNewPath += _v;
    }
    for(var p in _processPath){
      var _v = _processPath[p];
      if(_v.indexOf(sys.product.meta.installPath) == 0) continue;
      _procesNewPath += _procesNewPath.length > 0 ? ';' : '';
      _procesNewPath += _v;
    }
    su.setEnvironment('PATH', _userNewPath, su.CONST.ENVTYPE_USER);
    su.setEnvironment('PATH', _procesNewPath, su.CONST.ENVTYPE_PROCESS);

    next();
  });

  tasks.add('Updating environment variable PATH', function(next){
    var _userPath = su.getEnvironment('PATH', su.CONST.ENVTYPE_USER) || '',
        _processPath = su.getEnvironment('PATH', su.CONST.ENVTYPE_PROCESS) || '';
    _userPath += (_userPath.length > 0 ? ';' : '') + sys.product.meta.binPath;
    _processPath += (_processPath.length > 0 ? ';' : '') + sys.product.meta.binPath;

    sys.logAction('Adding [' + sys.product.meta.binPath + '] to user PATH...');
    su.setEnvironment('PATH', _userPath, su.CONST.ENVTYPE_USER);

    sys.logAction('Adding [' + sys.product.meta.binPath + '] to process PATH...');
    su.setEnvironment('PATH', _processPath, su.CONST.ENVTYPE_PROCESS);

    next();
  });

  function _get(name, url, path){
    var _url = sys.product.meta.makeUrl(url.replace('{name}', name)),
        _path = sys.product.meta.makePath(path.replace('{name}', name));
    if(!fs.fileExists(_path)){
      sys.logAction(name);
      return web.download(_url, _path, function(error){
        hasError = true;
        sys.logAction('#' + error.name + ':', error.message, 'on acquiring', name);
      })
    }
    return true;
  }

  function _bootstrap(runner){
    var _thirdPartyPath = fs.combine(sys.product.meta.libPath, 'third-party');
    if(!fs.directoryExists(_thirdPartyPath)){
      fs.createDirectory(_thirdPartyPath);
    }
    if(typeof runner == 'function') runner();
  }

  _bootstrap(function(){
    sys.logTask('Installing ', sys.product.name, 'v' + sys.product.version.toString());
    sys.logAction(sys.product.meta.copyright);

    tasks.run();

    sys.log();
    if(hasError){
      sys.logSubTask('#Errors occurred during installation');
      sys.logAction('look for technical support!');
    }else{
      sys.logSubTask('E5R Environment successfully installed!');
      sys.logAction('run `e5r help` command to use environmental information.');
    }
  });
});
