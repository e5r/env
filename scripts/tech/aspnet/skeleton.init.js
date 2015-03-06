// Copyright (c) E5R Development Team. All rights reserved.
// Licensed under the MIT License. See LICENSE file for license information.

(function(_){ 'use strict'
  _.fs = sys.require('fsutils.js');
  _.web = sys.require('webutils.js');

  // Constants
  _.APPEND_EXTENSION = '.__append__';
  _.APPEND_REGEX = '^(.*){ext}$'.replace('{ext}', _.APPEND_EXTENSION.replace('.','\\.'));

  // Read comment "Runner Plugin Environment API" in <cmdrunner.js> for
  // more information of environment API
  _.env;

  // Skeleton
  _.skelUrlBase = sys.product.meta.fileRepository + '/resources/skeleton';
  _.skelPathBase = sys.product.meta.installPath + '\\resources\\skeleton';
  _.licenseUrlBase = sys.product.meta.fileRepository + '/resources/license';
  _.licensePathBase = sys.product.meta.installPath + '\\resources\\license';
  _.skelPath = _.fs.combine(_.skelPathBase, '{resource}');
  _.skelLocalFile = _.fs.combine(_.skelPathBase, '{resource}.wres');
  _.skelWebPath = _.skelUrlBase + '/{resource}';
  _.skelWebFile = _.skelUrlBase + '/{resource}.wres';
  _.licenseLocalFile = _.fs.combine(_.licensePathBase, '{license}.md');
  _.licenseWebFile = _.licenseUrlBase + '/{license}.md';
  _.e5rProjectPath = '{workdir}\\.e5r';
  _.e5rFile = _.e5rProjectPath + '\\{file}';

  /**
   * Set environment configuration
   */
  _.setup = function(env){
    _.env = env;
    return true;
  }

  /**
   * Get and make a Web Resource content
   *
   * @param {string} resourceName A name of resource
   */
  _.makeWebResource = function(resourceName){

    sys.logSubTask('Making a Web Resource', resourceName + '...');

    var _localPath = _.skelPath.replace('{resource}', resourceName),
        _localFile = _.skelLocalFile.replace('{resource}', resourceName),
        _webUrl = _.skelWebPath.replace('{resource}', resourceName),
        _webFile = _.skelWebFile.replace('{resource}', resourceName),
        __clearLocalPath = function(){
          try{
            _.fs.deleteDirectory(_localPath);
          }catch(e){
            sys.log('#LOG:',
              '<skeleton.init.makeWebResource>: Error clearing directory [',
              _localPath + ' ].');
          }
        };

    if(!_.fs.directoryExists(_.skelPathBase)){
      _.fs.createDirectory(_.skelPathBase);
    }

    if(!_.fs.fileExists(_localFile)){
      sys.logAction('Downloading Web Resource', resourceName + '...');
      _.web.download(_webFile, _localFile, function silent(){});
    }

    if(!_.fs.fileExists(_localFile)){
      throw new Error('Web Resource ' + resourceName + ' not found!');
    }

    var _fileContent = _.fs.getArrayFileContent(_localFile);
    for(var _line = 0; _line < _fileContent.length; _line++){
      var _lineValue = '.'.replace('.',_fileContent[_line]).trim();

      // Comments
      if(_lineValue.length < 1 || _lineValue.charAt(0) == '#') continue;

      var _parts = _lineValue.split(':');

      // Directory
      if(_parts.length === 2 && _parts[0] === 'd'){
        var _directory = _.fs.combine(_localPath, _parts[1]);
        if(!_.fs.directoryExists(_directory)){
          _.fs.createDirectory(_directory);
        }
        continue;
      }

      // File
      if(_parts.length === 3 && (_parts[0] === 'f' || _parts[0] === 'fa')){
        var _resLocalFile = _.fs.combine(_localPath,_parts[1])
                          + (_parts[0] === 'fa' ? _.APPEND_EXTENSION : ''),
            _resLocalDirectory = _.fs.getDirectoryPath(_resLocalFile),
            _resWebFile = _.skelUrlBase + '/' + _parts[2];

        if(!_.fs.directoryExists(_resLocalDirectory)){
          _.fs.createDirectory(_resLocalDirectory);
        }

        if(!_.fs.fileExists(_resLocalFile)){
          sys.logAction('Downloading resource file', _parts[2] + '...');
          _.web.download(_resWebFile, _resLocalFile, function silent(){});
        }

        if(!_.fs.fileExists(_resLocalFile)){
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

    if(_.fs.fileExists(_localFile)){
      _.fs.deleteFile(_localFile);
    }
  }

  /**
   * Copy a content of resource skeleton to path
   *
   * @param {string} skeleton Name of resource skeleton
   * @param {string} path     Destination path
   */
  _.copySkelResource = function(resourceName, path){

    sys.logSubTask('Copying resources', resourceName + ' to project path...');

    var _localPath = _.skelPath.replace('{resource}', resourceName),
        _searchRegex = new RegExp(_.APPEND_REGEX, 'g');

    _.fs.copyDirectory(_localPath, path);

    var _appendFiles = _.fs.getDirectoryItems(path, _searchRegex);

    for(var _af in _appendFiles){
      var _aFile = _appendFiles[_af].path,
          _file = _aFile.replace(_searchRegex, '$1'),
          _aFileContent = _.fs.getArrayFileContent(_aFile),
          _fileContent = _.fs.fileExists(_file) ? _.fs.getArrayFileContent(_file) : [];
      _fileContent = _fileContent.concat(_aFileContent);
      _.fs.createTextFileWithContent(_file, _fileContent, true);
      _.fs.deleteFile(_aFile);
    }
  }

  /**
   * Get license of the Web and copy to path
   *
   * @param {string} licenseName  Name of license
   * @param {string} path         Path to copy
   */
  _.copyLicense = function(licenseName, path){

    sys.logSubTask('Copying license', licenseName + '...');

    var _licenseWeb = _.licenseWebFile.replace('{license}', licenseName),
        _licenseLocal = _.licenseLocalFile.replace('{license}', licenseName),
        _licensePath = _.fs.combine(path, 'LICENSE.md');

    if(!_.fs.directoryExists(_.licensePathBase)) _.fs.createDirectory(_.licensePathBase);

    if(!_.fs.fileExists(_licenseLocal)){
      sys.logAction('Downloading Web License', licenseName + '...');
      _.web.download(_licenseWeb, _licenseLocal, function silent(){});
    }

    if(!_.fs.fileExists(_licenseLocal)){
      throw new Error('Web license file ' +licenseName + ' not found!');
    }

    _.fs.copyFile(_licenseLocal, _licensePath, true);
  }

  /**
   * Run command entry point
   */
  _.run = function(opt, args){
    sys.logTask('Initializing a skeleton project...');
    try {
      var _skelPathCommon = _.skelPath.replace('{resource}', 'common'),
          _skelFileCommon = _.skelLocalFile.replace('{resource}', 'common'),
          _skelPathTech = _.skelPath.replace('{resource}', opt.tech),
          _skelFileTech = _.skelLocalFile.replace('{resource}', opt.tech),
          _e5rSkelPath = _.e5rProjectPath.replace('{workdir}', opt.workdir),
          _skelTechFile = _.e5rFile
            .replace('{workdir}', opt.workdir)
            .replace('{file}', 'tech'),
          _skelVersionFile = _.e5rFile
            .replace('{workdir}', opt.workdir)
            .replace('{file}', 'version');

      if(_.fs.getDirectoryItems(opt.workdir).length > 0 && !opt.replace){
        throw new Error('Not empty directories can not be initialized.');
      }

      if(!_.fs.directoryExists(_skelPathCommon) || _.fs.fileExists(_skelFileCommon)){
        _.makeWebResource('common');
      }

      if(!_.fs.directoryExists(_skelPathTech) || _.fs.fileExists(_skelFileTech)){
        _.makeWebResource(opt.tech);
      }

      _.copySkelResource('common', opt.workdir);
      _.copySkelResource(opt.tech, opt.workdir);

      if(!_.fs.directoryExists(_skelPathCommon) || _.fs.fileExists(_skelFileCommon)){
        throw new Error('Error processing <common> skeleton template');
      }

      if(!_.fs.directoryExists(_skelPathTech) || _.fs.fileExists(_skelFileTech)){
        throw new Error('Error processing <' + opt.tech + '> skeleton template');
      }

      if(opt.license) _.copyLicense(opt.license, opt.workdir);

      if(!_.fs.directoryExists(_e5rSkelPath)){
        _.fs.createDirectory(_e5rSkelPath);
      }

      sys.logSubTask('Saving information files...');
      {
        //.e5t/tech file
        _.fs.createTextFileWithContent(_skelTechFile, opt.tech, true);

        //.e5r/version file
        if(opt.pversion){
          _.fs.createTextFileWithContent(_skelVersionFile, opt.pversion, true);
        }
      }

      sys.logTask('The project skeleton was successfully initialized!')

    }catch(error){
      sys.logTask('A error ocurred on init a project skeleton.');
      throw error;
    }
  }

  command.api = {
    setup: _.setup,
    run: _.run
  }
})({});
