// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(){ 'use strict'

  var su = sys.require('sysutils.js'),
      fs = sys.require('fsutils.js'),
      web = sys.require('webutils.js'),

      // Constants
      APPEND_EXTENSION = '.__append__',
      APPEND_REGEX = '^(.*){ext}$'.replace('{ext}', APPEND_EXTENSION.replace('.','\\.')),

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
      _skelWebFile = _skelUrlBase + '/{resource}.wres',
      _licenseLocalFile = fs.combine(_licensePathBase, '{license}.md'),
      _licenseWebFile = _licenseUrlBase + '/{license}.md';

  /**
   * Set environment configuration
   */
  function _setup(env){
    _env = env;
    return true;
  }

  /**
   * Get and make a Web Resource content
   *
   * @param {string} resourceName A name of resource
   */
  function _makeWebResource(resourceName){

    sys.logSubTask('Making a Web Resource', resourceName + '...');

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

    var _fileContent = fs.getArrayFileContent(_localFile);
    for(var _line = 0; _line < _fileContent.length; _line++){
      var _lineValue = '.'.replace('.',_fileContent[_line]).trim();

      // Comments
      if(_lineValue.length < 1 || _lineValue.charAt(0) == '#') continue;

      var _parts = _lineValue.split(':');

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
                          + (_parts[0] === 'fa' ? APPEND_EXTENSION : ''),
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

  /**
   * Copy a content of resource skeleton to path
   *
   * @param {string} skeleton Name of resource skeleton
   * @param {string} path     Destination path
   */
  function _copySkelResource(resourceName, path){

    sys.logSubTask('Copying resources', resourceName + ' to project path...');

    var _localPath = _skelPath.replace('{resource}', resourceName),
        _searchRegex = new RegExp(APPEND_REGEX, 'g');

    fs.copyDirectory(_localPath, path);

    var _appendFiles = fs.getDirectoryItems(path, _searchRegex);

    for(var _af in _appendFiles){
      var _aFile = _appendFiles[_af].path,
          _file = _aFile.replace(_searchRegex, '$1'),
          _aFileContent = fs.getArrayFileContent(_aFile),
          _fileContent = fs.fileExists(_file) ? fs.getArrayFileContent(_file) : [];
      _fileContent = _fileContent.concat(_aFileContent);
      fs.createTextFileWithContent(_file, _fileContent, true, true);
      fs.deleteFile(_aFile);
    }
  }

  /**
   * Get license of the Web and copy to path
   *
   * @param {string} licenseName  Name of license
   * @param {string} path         Path to copy
   */
  function _copyLicense(licenseName, path){

    sys.logSubTask('Copying license', licenseName + '...');

    var _licenseWeb = _licenseWebFile.replace('{license}', licenseName),
        _licenseLocal = _licenseLocalFile.replace('{license}', licenseName),
        _licensePath = fs.combine(path, 'LICENSE.md');

    if(!fs.directoryExists(_licensePathBase)) fs.createDirectory(_licensePathBase);

    if(!fs.fileExists(_licenseLocal)){
      sys.logAction('Downloading Web License', licenseName + '...');
      web.download(_licenseWeb, _licenseLocal, function silent(){});
    }

    if(!fs.fileExists(_licenseLocal)){
      throw new Error('Web license file ' +licenseName + ' not found!');
    }

    fs.copyFile(_licenseLocal, _licensePath);
  }

  /**
   * Run command entry point
   */
  function _run(opt, args){
    sys.logTask('Initializing a skeleton project...');
    try {
      var _skelPathCommon = _skelPath.replace('{resource}', 'common'),
          _skelFileCommon = _skelLocalFile.replace('{resource}', 'common'),
          _skelPathTech = _skelPath.replace('{resource}', opt.tech),
          _skelFileTech = _skelLocalFile.replace('{resource}', opt.tech);

      if(fs.getDirectoryItems(opt.workdir).length > 0 && !opt.replace){
        throw new Error('Not empty directories can not be initialized.');
      }

      if(!fs.directoryExists(_skelPathCommon) || fs.fileExists(_skelFileCommon)){
        _makeWebResource('common');
      }

      if(!fs.directoryExists(_skelPathTech) || fs.fileExists(_skelFileTech)){
        _makeWebResource(opt.tech);
      }

      _copySkelResource('common', opt.workdir);
      _copySkelResource(opt.tech, opt.workdir);

      if(!fs.directoryExists(_skelPathCommon) || fs.fileExists(_skelFileCommon)){
        throw new Error('Error processing <common> skeleton template');
      }

      if(!fs.directoryExists(_skelPathTech) || fs.fileExists(_skelFileTech)){
        throw new Error('Error processing <' + opt.tech + '> skeleton template');
      }

      if(opt.license) _copyLicense(opt.license, opt.workdir);

      sys.logTask('The project skeleton was successfully initialized!')

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
