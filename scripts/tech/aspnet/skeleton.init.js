// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'

  var su = sys.require('sysutils.js'),
      fs = sys.require('fsutils.js'),
      web = sys.require('webutils.js'),

      // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
      // more information of environment API
      _env,

      // Skeleton
      _skelUrlBase = sys.product.meta.fileRepository + '/resources/skeleton',
      _skelPathBase = sys.product.meta.installPath + '\\resources\\skeleton',
      _licenseUrlBase = sys.product.meta.fileRepository + '/resources/license',
      _licensePathBase = sys.product.meta.installPath + '\\resources\\license',
      _skelPath = fs.combine(_skelPathBase, '{resource}'),
      _skelLocalFile = fs.combine(_skelPathBase, '{resource}.wres'),
      _skelWebPath = _skelUrlBase + '/{resource}',
      _skelWebFile = _skelUrlBase + '/{resource}.wres';

  /**
   * Set environment configuration
   */
  function _setup(env){
    _env = env;
    return true;
  }

  function _makeWebResource(resourceName){
    var _localPath = _skelPath.replace('{resource}', resourceName),
        _localFile = _skelLocalFile.replace('{resource}', resourceName),
        _webUrl = _skelWebPath.replace('{resource}', resourceName),
        _webFile = _skelWebFile.replace('{resource}', resourceName),
        __clearLocalPath = function(){
          try{
            fs.deleteDirectory(_localPath);
          }catch(e){
            sys.log('#LOG:',
              '<skeleton.init._makeWebResource>: Error clearing directory [',
              _localPath + ' ].');
          }
        };

    if(!fs.directoryExists(_skelPathBase)){
      fs.createDirectory(_skelPathBase);
    }

    if(!fs.fileExists(_localFile)){
      sys.logAction('Downloading Web Resource', resourceName + '...');
      web.download(_webFile, _localFile, function silent(){});
    }

    if(!fs.fileExists(_localFile)){
      throw new Error('Web Resource ' + resourceName + ' not found!');
    }

    // Percorrendo linha por linha
    var _fileContent = fs.getArrayFileContent(_localFile);
    for(var _line = 0; _line < _fileContent.length; _line++){
      var _lineValue = '.'.replace('.',_fileContent[_line]).trim();

      // Comments
      if(_lineValue.length < 1 || _lineValue.charAt(0) == '#') continue;

      var _parts = _lineValue.split(':');

      // sys.logSubTask('#' + (_line+1), _lineValue, '-->', _parts);

      // Directory
      if(_parts.length === 2 && _parts[0] === 'd'){
        var _directory = fs.combine(_localPath, _parts[1]);
        if(!fs.directoryExists(_directory)){
          fs.createDirectory(_directory);
        }
        continue;
      }

      // File
      if(_parts.length === 3 && (_parts[0] === 'f' || _parts[0] === 'fa')){
        var _resLocalFile = fs.combine(_localPath,_parts[1])
                          + (_parts[0] === 'fa' ? '.__append__' : ''),
            _resLocalDirectory = fs.getDirectoryPath(_resLocalFile),
            _resWebFile = _skelUrlBase + '/' + _parts[2];

        if(!fs.directoryExists(_resLocalDirectory)){
          fs.createDirectory(_resLocalDirectory);
        }

        if(!fs.fileExists(_resLocalFile)){
          sys.logAction('Downloading resource file', _parts[2] + '...');
          web.download(_resWebFile, _resLocalFile, function silent(){});
        }

        if(!fs.fileExists(_resLocalFile)){
          __clearLocalPath();
          throw new Error('Web resource file ' + _parts[2] + ' not found!');
        }

        continue;
      }

      // Undefined
      var _msgError = 'Syntax error in web resource file [' + resourceName + ']\n'
                    + '  URL: ' + _webFile + '\n'
                    + '  Line ' + (_line + 1) + ': ' + _lineValue;
      __clearLocalPath();
      throw new Error(_msgError);
    }

    if(fs.fileExists(_localFile)){
      fs.deleteFile(_localFile);
    }
  }

  function _copySkeleton(skeleton, path){

  }

  /**
   * Run command entry point
   */
  function _run(opt, args){
    try {
      var _skelPathCommon = _skelPath.replace('{resource}', 'common'),
          _skelFileCommon = _skelLocalFile.replace('{resource}', 'common'),
          _skelPathTech = _skelPath.replace('{resource}', opt.tech),
          _skelFileTech = _skelLocalFile.replace('{resource}', opt.tech);

      // 1. --workdir must be empty
      if(fs.getDirectoryItems(opt.workdir).length > 0){
        throw new Error('Not empty directories can not be initialized.');
      }

      // 2. Se o diretório local::Skeleton Common não existe, ou existe junto ao
      // arquivo de recurso common.wres. O mesmo deve ser processado
      if(!fs.directoryExists(_skelPathCommon) || fs.fileExists(_skelFileCommon)){
        _makeWebResource('common');
      }

      // 3. Se o diretório local::Skeleton --tech não existe, ou existe junto ao
      // arquivo de recurso --tech.wres. O mesmo deve ser processado
      if(!fs.directoryExists(_skelPathTech) || fs.fileExists(_skelFileTech)){
        _makeWebResource(opt.tech);
      }

      // 4. Se o diretório local::Skeleton Common não existe. Erro Not Found
      if(!fs.directoryExists(_skelPathCommon) || fs.fileExists(_skelFileCommon)){
        throw new Error('Error processing <common> skeleton template');
      }

      // 5. Se o diretório local::Skeleton --tech não existe. Erro Not Found
      if(!fs.directoryExists(_skelPathTech) || fs.fileExists(_skelFileTech)){
        throw new Error('Error processing <' + opt.tech + '> skeleton template');
      }

    }catch(error){
      sys.logTask('A error ocurred on init a project skeleton.');
      throw error;
    }
  }

  command.api = {
    setup: _setup,
    run: _run
  }
})();
